import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FitnessLeaderboard, FitnessLeaderboard__factory } from "../types";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory(
    "FitnessLeaderboard",
  )) as FitnessLeaderboard__factory;
  const contract = (await factory.deploy()) as FitnessLeaderboard;
  const address = await contract.getAddress();
  return { contract, address };
}

describe("FitnessLeaderboard", function () {
  let signers: Signers;
  let contract: FitnessLeaderboard;
  let address: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }
    ({ contract, address } = await deployFixture());
  });

  it("global totals should be zero-hash after deployment", async function () {
    const [s, m, c] = await contract.getGlobalStats();
    expect(s).to.eq(ethers.ZeroHash);
    expect(m).to.eq(ethers.ZeroHash);
    expect(c).to.eq(ethers.ZeroHash);
  });

  it("submit one activity and totals update", async function () {
    const steps = 6500;
    const minutes = 45;
    const calories = 350;

    const enc = await fhevm
      .createEncryptedInput(address, signers.alice.address)
      .add32(steps)
      .add32(minutes)
      .add32(calories)
      .encrypt();

    const tx = await contract
      .connect(signers.alice)
      .submitActivity(enc.handles[0], enc.inputProof, enc.handles[1], enc.inputProof, enc.handles[2], enc.inputProof);
    await tx.wait();

    const [s, m, c] = await contract.getGlobalStats();
    const ds = await fhevm.userDecryptEuint(FhevmType.euint32, s, address, signers.alice);
    const dm = await fhevm.userDecryptEuint(FhevmType.euint32, m, address, signers.alice);
    const dc = await fhevm.userDecryptEuint(FhevmType.euint32, c, address, signers.alice);

    expect(ds).to.eq(steps);
    expect(dm).to.eq(minutes);
    expect(dc).to.eq(calories);

    // Test buckets for 6500 steps (should be in bucket 2: 5K-10K)
    const buckets = await contract.getStepBuckets();
    expect(buckets).to.have.length(5);
    
    // All buckets should be encrypted (non-zero hash) after submission
    // Bucket 2 should have the increment
    const b2 = await fhevm.userDecryptEuint(FhevmType.euint32, buckets[2], address, signers.alice);
    expect(b2).to.eq(1);
    
    // Other buckets should be 0
    const b0 = await fhevm.userDecryptEuint(FhevmType.euint32, buckets[0], address, signers.alice);
    const b1 = await fhevm.userDecryptEuint(FhevmType.euint32, buckets[1], address, signers.alice);
    const b3 = await fhevm.userDecryptEuint(FhevmType.euint32, buckets[3], address, signers.alice);
    const b4 = await fhevm.userDecryptEuint(FhevmType.euint32, buckets[4], address, signers.alice);
    expect(b0).to.eq(0);
    expect(b1).to.eq(0);
    expect(b3).to.eq(0);
    expect(b4).to.eq(0);
  });

  it("badges are calculated correctly", async function () {
    // Submit multiple activities that would unlock different badges
    const act1 = { steps: 10000, minutes: 50, calories: 300 }; // Total: 10K steps, 50 minutes
    const act2 = { steps: 10000, minutes: 60, calories: 400 }; // Total: 20K steps, 110 minutes
    const act3 = { steps: 10000, minutes: 100, calories: 500 }; // Total: 30K steps, 210 minutes  
    const act4 = { steps: 10000, minutes: 100, calories: 800 }; // Total: 40K steps, 310 minutes
    const act5 = { steps: 20000, minutes: 100, calories: 800 }; // Total: 60K steps, 410 minutes
    const act6 = { steps: 20000, minutes: 100, calories: 800 }; // Total: 80K steps, 510 minutes - Committed!
    const act7 = { steps: 20000, minutes: 120, calories: 1200 }; // Total: 100K steps (>=42195), 630 minutes, Latest 120>=100, 1200>=1000 - Marathoner, Centurion, Calorie King, Consistent!

    for (const act of [act1, act2, act3, act4, act5, act6, act7]) {
      const enc = await fhevm
        .createEncryptedInput(address, signers.alice.address)
        .add32(act.steps)
        .add32(act.minutes)
        .add32(act.calories)
        .encrypt();

      const tx = await contract
        .connect(signers.alice)
        .submitActivity(enc.handles[0], enc.inputProof, enc.handles[1], enc.inputProof, enc.handles[2], enc.inputProof);
      await tx.wait();
    }

    // Now check badges via getUserBadges
    const tx = await contract.connect(signers.alice).getUserBadges(signers.alice.address);
    await tx.wait();
    
    const badges = await contract.getUserBadges.staticCall(signers.alice.address);
    const marathoner = await fhevm.userDecryptEbool(badges[0], address, signers.alice);
    const centurion = await fhevm.userDecryptEbool(badges[1], address, signers.alice);
    const calorieKing = await fhevm.userDecryptEbool(badges[2], address, signers.alice);
    const committed = await fhevm.userDecryptEbool(badges[3], address, signers.alice);
    const consistent = await fhevm.userDecryptEbool(badges[4], address, signers.alice);

    expect(marathoner).to.be.true; // 100K steps >= 42,195
    expect(centurion).to.be.true;  // Latest: 120 minutes >= 100
    expect(calorieKing).to.be.true;  // Latest: 1200 calories >= 1000
    expect(committed).to.be.true;  // 630 minutes >= 500
    expect(consistent).to.be.true; // 7 submissions >= 7
  });
});



