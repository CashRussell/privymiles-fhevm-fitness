//////////////////////////////////////////////////////////////////////////
//
// WARNING!!
// ALWAY USE DYNAMICALLY IMPORT THIS FILE TO AVOID INCLUDING THE ENTIRE 
// FHEVM MOCK LIB IN THE FINAL PRODUCTION BUNDLE!!
//
//////////////////////////////////////////////////////////////////////////

import { JsonRpcProvider, Contract } from "ethers";
import { MockFhevmInstance } from "@fhevm/mock-utils";
import { FhevmInstance } from "../../fhevmTypes";

export const fhevmMockCreateInstance = async (parameters: {
  rpcUrl: string;
  chainId: number;
  metadata: {
    ACLAddress: `0x${string}`;
    InputVerifierAddress: `0x${string}`;
    KMSVerifierAddress: `0x${string}`;
    gatewayChainId?: number;
  };
}): Promise<FhevmInstance> => {
  const provider = new JsonRpcProvider(parameters.rpcUrl);
  
  // Query InputVerifier contract's EIP712 domain to get the actual chainId
  // This will tell us what chainId the InputVerifier contract is using in its EIP712 domain
  let actualInputVerifierChainId: bigint | undefined;
  let eip712Domain: any[] | undefined;
  try {
    const inputVerifierContract = new Contract(
      parameters.metadata.InputVerifierAddress,
      ["function eip712Domain() external view returns (bytes1, string, string, uint256, address, bytes32, uint256[])"],
      provider
    );
    const domain = await inputVerifierContract.eip712Domain();
    if (domain && Array.isArray(domain)) {
      eip712Domain = domain;
      actualInputVerifierChainId = BigInt(domain[3]); // chainId is at index 3
      console.log(`[fhevmMockCreateInstance] InputVerifier EIP712 domain chainId: ${actualInputVerifierChainId}`);
      console.log(`[fhevmMockCreateInstance] InputVerifier EIP712 domain verifyingContract: ${domain[4]}`);
    }
  } catch (error) {
    console.warn(`[fhevmMockCreateInstance] Failed to query InputVerifier EIP712 domain:`, error);
  }
  
  // Extract gatewayChainId from metadata
  // According to InputVerifier.ts comment: "The InputVerifier is always using the gatewayChainId in its eip712 domain"
  // But we need to match what the contract actually uses
  const metadataGatewayChainId = (parameters.metadata as any).gatewayChainId;
  // Use the actual chainId from the contract if available, otherwise use metadata gatewayChainId, otherwise default
  const gatewayChainId = actualInputVerifierChainId 
    ? Number(actualInputVerifierChainId)
    : (typeof metadataGatewayChainId === 'number' ? metadataGatewayChainId : 55815);
  console.log(`[fhevmMockCreateInstance] Using gatewayChainId: ${gatewayChainId} (from contract: ${actualInputVerifierChainId ? Number(actualInputVerifierChainId) : 'N/A'}, from metadata: ${metadataGatewayChainId || 'not provided'})`);
  console.log(`[fhevmMockCreateInstance] Contract chainId: ${parameters.chainId}`);
  
  // Use the actual verifyingContract from EIP712 domain if available, otherwise fallback to metadata
  const verifyingContractAddressInputVerification = eip712Domain && eip712Domain[4]
    ? eip712Domain[4] as `0x${string}` // index 4 is verifyingContract
    : parameters.metadata.InputVerifierAddress;
  
  console.log(`[fhevmMockCreateInstance] Using verifyingContractAddressInputVerification: ${verifyingContractAddressInputVerification}`);
  console.log(`[fhevmMockCreateInstance] Final config:`, {
    aclContractAddress: parameters.metadata.ACLAddress,
    chainId: parameters.chainId,
    gatewayChainId,
    inputVerifierContractAddress: parameters.metadata.InputVerifierAddress,
    kmsContractAddress: parameters.metadata.KMSVerifierAddress,
    verifyingContractAddressInputVerification,
    verifyingContractAddressDecryption: "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64",
  });
  
  const instance = await MockFhevmInstance.create(
    provider, 
    provider, 
    {
      aclContractAddress: parameters.metadata.ACLAddress,
      chainId: parameters.chainId,
      gatewayChainId: gatewayChainId,
    inputVerifierContractAddress: parameters.metadata.InputVerifierAddress,
    kmsContractAddress: parameters.metadata.KMSVerifierAddress,
    verifyingContractAddressDecryption:
      "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64",
      // verifyingContractAddressInputVerification should match the InputVerifier contract's EIP712 domain verifyingContract
      verifyingContractAddressInputVerification,
    },
    {
      // Properties for v0.3.0+ compatibility
      inputVerifierProperties: {},
      kmsVerifierProperties: {},
    }
  );
  
  console.log(`[fhevmMockCreateInstance] ✅ Mock FHEVM instance created successfully`);
  
  // Type assertion needed due to minor type differences between MockFhevmInstance and FhevmInstance in 0.3.0
  // The mock instance is functionally compatible at runtime
  return instance as unknown as FhevmInstance;
};
