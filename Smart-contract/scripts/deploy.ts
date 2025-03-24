import { ethers, run, network } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`\nDeploying contracts with account: ${deployer.address}`);

    // Define token parameters
    const tokenName = "stakingToken";
    const tokenSymbol = "STK";
    const initialSupply = ethers.parseUnits("100000", 18); 

    // Deploy ERC20 Token for Staking
    console.log("🚀 Deploying Staking Token...");
    const StakingToken = await ethers.getContractFactory("stakingToken"); 
    const stakingToken = await StakingToken.deploy(tokenName, tokenSymbol, initialSupply);
    await stakingToken.waitForDeployment();
    const stakingTokenAddress = await stakingToken.getAddress();
    console.log(`✅ Staking Token deployed at: ${stakingTokenAddress}`);

    // Define staking parameters
    const rewardRate = ethers.parseUnits("0.01", 18); // Reward rate per second
    const minStakingTime = 7 * 24 * 60 * 60; // Minimum 7 days staking

    console.log("🚀 Deploying Staking Contract...");
    const StakingContract = await ethers.getContractFactory("StakingContract");
    const stakingContract = await StakingContract.deploy(stakingTokenAddress, rewardRate, minStakingTime);
    await stakingContract.waitForDeployment();
    const stakingAddress = await stakingContract.getAddress();
    console.log(`Staking Contract deployed at: ${stakingAddress}`);
    const balanceAfter = await ethers.provider.getBalance(deployer.address);
    console.log(`\n Deployer Balance After: ${ethers.formatUnits(balanceAfter, 18)}`);


    console.log("\nDeployment Completed!");

     // Wait for a few confirmations before verification
     if (network.name !== "hardhat") {
        console.log("Waiting for transactions to confirm...");
        await new Promise((resolve) => setTimeout(resolve, 30000));

        try {
            console.log("Verifying Staking Token...");
            await run("verify:verify", {
                address: stakingTokenAddress,
                constructorArguments: [tokenName, tokenSymbol, initialSupply],
            });
            console.log("✅ Staking Token verified successfully!");

            console.log("Verifying Staking Contract...");
            await run("verify:verify", {
                address: stakingAddress,
                constructorArguments: [stakingTokenAddress, rewardRate, minStakingTime],
            });
            console.log("✅ Staking Contract verified successfully!");
        } catch (error) {
            console.error("Verification failed:", error);
        }

    }
}

// Run the script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
