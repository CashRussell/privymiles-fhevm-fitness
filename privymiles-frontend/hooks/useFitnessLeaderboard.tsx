'use client';

import { ethers } from "ethers";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FhevmInstance } from "../fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "../fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "../fhevm/GenericStringStorage";
import { FitnessLeaderboardAddresses } from "../abi/FitnessLeaderboardAddresses";
import { FitnessLeaderboardABI } from "../abi/FitnessLeaderboardABI";

function getFitnessLeaderboardByChainId(chainId: number | undefined): {
  abi: typeof FitnessLeaderboardABI;
  address?: `0x${string}`;
} {
  if (!chainId) {
    return { abi: FitnessLeaderboardABI };
  }
  const key = chainId === 31337 ? 'localhost' : chainId === 11155111 ? 'sepolia' : 'unknown';
  const entry = (FitnessLeaderboardAddresses as any)[key];
  if (!entry?.address) {
    return { abi: FitnessLeaderboardABI };
  }
  return { abi: FitnessLeaderboardABI, address: entry.address as `0x${string}` };
}

export function useFitnessLeaderboard(parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  eip1193Provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  sameChain: React.RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: React.RefObject<(ethersSigner: ethers.JsonRpcSigner | undefined) => boolean>;
}) {
  const { instance, fhevmDecryptionSignatureStorage, chainId, ethersSigner, ethersReadonlyProvider } = parameters;

  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState<{ steps: number; minutes: number; calories: number } | null>(null);
  const [userLatest, setUserLatest] = useState<{ steps: number; minutes: number; calories: number } | null>(null);
  const [userStats, setUserStats] = useState<{ steps: number; minutes: number; calories: number; submissionCount: number } | null>(null);
  const [stepBuckets, setStepBuckets] = useState<number[] | null>(null);
  const [minuteBuckets, setMinuteBuckets] = useState<number[] | null>(null);
  const [calorieBuckets, setCalorieBuckets] = useState<number[] | null>(null);
  const [userBadges, setUserBadges] = useState<{ marathoner: boolean; centurion: boolean; calorieKing: boolean; consistent: boolean; committed: boolean } | null>(null);

  const contract = useMemo(() => getFitnessLeaderboardByChainId(chainId), [chainId]);

  const canSubmit = useMemo(() => {
    return contract.address && instance && ethersSigner && !loading;
  }, [contract.address, instance, ethersSigner, loading]);

  const canRefresh = useMemo(() => {
    return contract.address && instance && ethersSigner && !loading;
  }, [contract.address, instance, ethersSigner, loading]);

  const submitActivity = useCallback(
    async ({ steps, minutes, calories }: { steps: number; minutes: number; calories: number }) => {
      if (!contract.address) {
        throw new Error(`Contract not deployed on chain ${chainId}. Please switch to a supported network (Sepolia or localhost).`);
      }
      if (!instance) {
        throw new Error('FHEVM instance is not ready. Please wait for initialization to complete.');
      }
      if (!ethersSigner) {
        throw new Error('Please connect your wallet first');
      }
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const contractInst = new ethers.Contract(contract.address, contract.abi as any, ethersSigner);

        console.log(`[submitActivity] Creating encrypted inputs for contract: ${contract.address}, user: ${ethersSigner.address}`);
        
        let inputSteps, encSteps, inputMinutes, encMinutes, inputCalories, encCalories;
        
        try {
          console.log(`[submitActivity] Creating encrypted input for steps: ${steps}`);
          console.log(`[submitActivity] Contract address: ${contract.address}, User address: ${ethersSigner.address}`);
          console.log(`[submitActivity] Instance type:`, instance.constructor?.name);
          // Try to access instance properties for debugging (may fail if private)
          if ('chainId' in instance && typeof (instance as any).chainId === 'number') {
            console.log(`[submitActivity] Instance chainId: ${(instance as any).chainId}`);
          }
          inputSteps = instance.createEncryptedInput(contract.address, ethersSigner.address);
          inputSteps.add32(steps);
          encSteps = await inputSteps.encrypt();
          console.log(`[submitActivity] Steps encrypted successfully`);
        } catch (error) {
          console.error(`[submitActivity] Error encrypting steps:`, error);
          console.error(`[submitActivity] Error details:`, {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          throw new Error(`Failed to encrypt steps: ${error instanceof Error ? error.message : String(error)}`);
        }

        try {
          console.log(`[submitActivity] Creating encrypted input for minutes: ${minutes}`);
          inputMinutes = instance.createEncryptedInput(contract.address, ethersSigner.address);
          inputMinutes.add32(minutes);
          encMinutes = await inputMinutes.encrypt();
          console.log(`[submitActivity] Minutes encrypted successfully`);
        } catch (error) {
          console.error(`[submitActivity] Error encrypting minutes:`, error);
          throw new Error(`Failed to encrypt minutes: ${error instanceof Error ? error.message : String(error)}`);
        }

        try {
          console.log(`[submitActivity] Creating encrypted input for calories: ${calories}`);
          inputCalories = instance.createEncryptedInput(contract.address, ethersSigner.address);
          inputCalories.add32(calories);
          encCalories = await inputCalories.encrypt();
          console.log(`[submitActivity] Calories encrypted successfully`);
        } catch (error) {
          console.error(`[submitActivity] Error encrypting calories:`, error);
          throw new Error(`Failed to encrypt calories: ${error instanceof Error ? error.message : String(error)}`);
        }

        const tx = await contractInst.submitActivity(
          encSteps.handles[0],
          encSteps.inputProof,
          encMinutes.handles[0],
          encMinutes.inputProof,
          encCalories.handles[0],
          encCalories.inputProof,
        );

        await tx.wait();
      } finally {
        setLoading(false);
      }
    },
    [contract, instance, ethersSigner],
  );

  const refreshTotals = useCallback(async () => {
    if (!contract.address || !instance || !ethersSigner) return;
    setLoading(true);
    try {
      const contractInst = new ethers.Contract(contract.address, contract.abi as any, ethersReadonlyProvider || ethersSigner);
      
      const [stepsHandle, minutesHandle, caloriesHandle] = await contractInst.getGlobalStats();

      // Only decrypt if we have decryption signature storage
      try {
        const sig = await FhevmDecryptionSignature.loadOrSign(
          instance,
          [contract.address as `0x${string}`],
          ethersSigner,
          fhevmDecryptionSignatureStorage
        );

        if (sig) {
          const res = await instance.userDecrypt(
            [
              { handle: stepsHandle, contractAddress: contract.address },
              { handle: minutesHandle, contractAddress: contract.address },
              { handle: caloriesHandle, contractAddress: contract.address },
            ],
            sig.privateKey,
            sig.publicKey,
            sig.signature,
            sig.contractAddresses,
            sig.userAddress,
            sig.startTimestamp,
            sig.durationDays
          );

          const steps = Number(res[stepsHandle] || 0n);
          const minutes = Number(res[minutesHandle] || 0n);
          const calories = Number(res[caloriesHandle] || 0n);

          setTotals({ steps, minutes, calories });
        } else {
          setTotals(null);
        }
      } catch {
        setTotals(null);
      }
    } finally {
      setLoading(false);
    }
  }, [contract, instance, ethersSigner, ethersReadonlyProvider, fhevmDecryptionSignatureStorage]);

  const refreshBuckets = useCallback(async () => {
    if (!contract.address || !instance || !ethersSigner) return;
    setLoading(true);
    try {
      const contractInst = new ethers.Contract(contract.address, contract.abi as any, ethersReadonlyProvider || ethersSigner);
      
      const [stepHandles, minuteHandles, calorieHandles] = await Promise.all([
        contractInst.getStepBuckets(),
        contractInst.getMinuteBuckets(),
        contractInst.getCalorieBuckets()
      ]);

      // Decrypt all buckets
      try {
        const sig = await FhevmDecryptionSignature.loadOrSign(
          instance,
          [contract.address as `0x${string}`],
          ethersSigner,
          fhevmDecryptionSignatureStorage
        );

        if (sig) {
          const decryptionMap: Record<string, any> = {};
          
          [...stepHandles, ...minuteHandles, ...calorieHandles].forEach(handle => {
            decryptionMap[handle] = { handle, contractAddress: contract.address };
          });

          const res = await instance.userDecrypt(
            Object.values(decryptionMap),
            sig.privateKey,
            sig.publicKey,
            sig.signature,
            sig.contractAddresses,
            sig.userAddress,
            sig.startTimestamp,
            sig.durationDays
          );

          setStepBuckets(stepHandles.map((handle: any) => Number(res[handle] || 0n)));
          setMinuteBuckets(minuteHandles.map((handle: any) => Number(res[handle] || 0n)));
          setCalorieBuckets(calorieHandles.map((handle: any) => Number(res[handle] || 0n)));
        } else {
          setStepBuckets(null);
          setMinuteBuckets(null);
          setCalorieBuckets(null);
        }
      } catch (err) {
        setStepBuckets(null);
        setMinuteBuckets(null);
        setCalorieBuckets(null);
      }
    } finally {
      setLoading(false);
    }
  }, [contract, instance, ethersSigner, ethersReadonlyProvider, fhevmDecryptionSignatureStorage]);

  const refreshUserLatest = useCallback(async () => {
    if (!contract.address || !instance || !ethersSigner) return;
    setLoading(true);
    try {
      const contractInst = new ethers.Contract(contract.address, contract.abi as any, ethersReadonlyProvider || ethersSigner);
      
      const [stepsHandle, minutesHandle, caloriesHandle] = await contractInst.getUserLatest(ethersSigner.address);

      // Decrypt user's latest data
      try {
        const sig = await FhevmDecryptionSignature.loadOrSign(
          instance,
          [contract.address as `0x${string}`],
          ethersSigner,
          fhevmDecryptionSignatureStorage
        );

        if (sig) {
          const res = await instance.userDecrypt(
            [
              { handle: stepsHandle, contractAddress: contract.address },
              { handle: minutesHandle, contractAddress: contract.address },
              { handle: caloriesHandle, contractAddress: contract.address },
            ],
            sig.privateKey,
            sig.publicKey,
            sig.signature,
            sig.contractAddresses,
            sig.userAddress,
            sig.startTimestamp,
            sig.durationDays
          );

          const steps = Number(res[stepsHandle] || 0n);
          const minutes = Number(res[minutesHandle] || 0n);
          const calories = Number(res[caloriesHandle] || 0n);

          setUserLatest({ steps, minutes, calories });
        } else {
          setUserLatest(null);
        }
      } catch {
        setUserLatest(null);
      }
    } finally {
      setLoading(false);
    }
  }, [contract, instance, ethersSigner, ethersReadonlyProvider, fhevmDecryptionSignatureStorage]);

  const refreshUserStats = useCallback(async () => {
    if (!contract.address || !instance || !ethersSigner) return;
    setLoading(true);
    try {
      const contractInst = new ethers.Contract(contract.address, contract.abi as any, ethersReadonlyProvider || ethersSigner);
      
      const [stepsHandle, minutesHandle, caloriesHandle, submissionCount] = await contractInst.getUserStats(ethersSigner.address);

      // Decrypt user's total stats
      try {
        const sig = await FhevmDecryptionSignature.loadOrSign(
          instance,
          [contract.address as `0x${string}`],
          ethersSigner,
          fhevmDecryptionSignatureStorage
        );

        if (sig) {
          const res = await instance.userDecrypt(
            [
              { handle: stepsHandle, contractAddress: contract.address },
              { handle: minutesHandle, contractAddress: contract.address },
              { handle: caloriesHandle, contractAddress: contract.address },
            ],
            sig.privateKey,
            sig.publicKey,
            sig.signature,
            sig.contractAddresses,
            sig.userAddress,
            sig.startTimestamp,
            sig.durationDays
          );

          const steps = Number(res[stepsHandle] || 0n);
          const minutes = Number(res[minutesHandle] || 0n);
          const calories = Number(res[caloriesHandle] || 0n);

          setUserStats({ steps, minutes, calories, submissionCount: Number(submissionCount) });
        } else {
          setUserStats(null);
        }
      } catch {
        setUserStats(null);
      }
    } finally {
      setLoading(false);
    }
  }, [contract, instance, ethersSigner, ethersReadonlyProvider, fhevmDecryptionSignatureStorage]);

  const refreshUserBadges = useCallback(async () => {
    if (!contract.address || !instance || !ethersSigner) return;
    setLoading(true);
    try {
      const contractInst = new ethers.Contract(contract.address, contract.abi as any, ethersSigner);
      
      // getUserBadges is nonpayable (creates new ebool and calls FHE.allow)
      // We need to execute it as a transaction and then use staticCall to get the values
      const tx = await contractInst.getUserBadges(ethersSigner.address);
      await tx.wait();
      
      // After transaction is mined, get the return values with staticCall
      const contractReadInst = new ethers.Contract(contract.address, contract.abi as any, ethersReadonlyProvider || ethersSigner);
      const result = await contractReadInst.getUserBadges.staticCall(ethersSigner.address);
      
      // Check if result is an array or object
      let badges;
      if (Array.isArray(result)) {
        badges = result;
      } else if (result && typeof result === 'object') {
        // If it's an ethers Result object, extract array elements
        badges = [result[0], result[1], result[2], result[3], result[4]];
      } else {
        console.error('[refreshUserBadges] Unexpected result type:', result);
        setUserBadges(null);
        return;
      }
      
      if (!Array.isArray(badges) || badges.length !== 5) {
        console.error('[refreshUserBadges] Invalid badges array:', badges);
        setUserBadges(null);
        return;
      }
      
      const [marathonerHandle, centurionHandle, calorieKingHandle, committedHandle, consistentHandle] = badges;

      // Decrypt badges
      try {
        const sig = await FhevmDecryptionSignature.loadOrSign(
          instance,
          [contract.address as `0x${string}`],
          ethersSigner,
          fhevmDecryptionSignatureStorage
        );

        if (sig) {
          const res = await instance.userDecrypt(
            [
              { handle: marathonerHandle, contractAddress: contract.address },
              { handle: centurionHandle, contractAddress: contract.address },
              { handle: calorieKingHandle, contractAddress: contract.address },
              { handle: committedHandle, contractAddress: contract.address },
              { handle: consistentHandle, contractAddress: contract.address },
            ],
            sig.privateKey,
            sig.publicKey,
            sig.signature,
            sig.contractAddresses,
            sig.userAddress,
            sig.startTimestamp,
            sig.durationDays
          );

          const marathoner = res[marathonerHandle] === true;
          const centurion = res[centurionHandle] === true;
          const calorieKing = res[calorieKingHandle] === true;
          const committed = res[committedHandle] === true;
          const consistent = res[consistentHandle] === true;

          setUserBadges({ marathoner, centurion, calorieKing, consistent, committed });
        } else {
          setUserBadges(null);
        }
      } catch (err) {
        console.error('[refreshUserBadges] Decryption error:', err);
        setUserBadges(null);
      }
    } finally {
      setLoading(false);
    }
  }, [contract, instance, ethersSigner, ethersReadonlyProvider, fhevmDecryptionSignatureStorage]);

  return { submitActivity, loading, totals, userLatest, userStats, stepBuckets, minuteBuckets, calorieBuckets, userBadges, refreshTotals, refreshUserLatest, refreshUserStats, refreshBuckets, refreshUserBadges, canSubmit, canRefresh } as const;
}
