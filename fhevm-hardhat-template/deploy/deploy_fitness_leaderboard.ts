import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy FitnessLeaderboard contract with FHEVM support
  const deployed = await deploy("FitnessLeaderboard", {
    from: deployer,
    log: true,
  });

  console.log(`FitnessLeaderboard contract: `, deployed.address);
};
export default func;
func.id = "deploy_fitness_leaderboard"; // id required to prevent reexecution
func.tags = ["FitnessLeaderboard"];




