import { ethers } from "hardhat";
import { time, mine } from "@nomicfoundation/hardhat-network-helpers";

async function main() {
    const [deployer, user1] = await ethers.getSigners();

    console.log(`\n Deploying contracts with account: ${deployer.address}`);

    // Define token parameters
    const tokenName = "Staking Token";
    const tokenSymbol = "STK";
    const initialSupply = ethers.parseUnits("1000000000", 18); 

    // Deploy ERC20 Staking Token
    console.log("Deploying Staking Token...");
    const StakingToken = await ethers.getContractFactory("stakingToken"); 
    const stakingToken = await StakingToken.deploy(tokenName, tokenSymbol, initialSupply);
    await stakingToken.waitForDeployment();
    const stakingTokenAddress = await stakingToken.getAddress();
    console.log(`Staking Token deployed at: ${stakingTokenAddress}`);

    // Define staking parameters
    const rewardRate = ethers.parseUnits("0.000001", 18);
    const minStakingTime = 60 * 60; // Minimum 1 hour staking for testing

    console.log("Deploying Staking Contract...");
    const StakingContract = await ethers.getContractFactory("StakingContract");
    const stakingContract = await StakingContract.deploy(stakingTokenAddress, rewardRate, minStakingTime);
    await stakingContract.waitForDeployment();
    const stakingAddress = await stakingContract.getAddress();
    console.log(`Staking Contract deployed at: ${stakingAddress}`);

    console.log("\nConnected to Staking Token at:", stakingTokenAddress);
    console.log("Connected to Staking Contract at:", stakingAddress);

    // Check the staking contract's token balance before funding
    let contractBalance = await stakingContract.getContractBalance();
    console.log(`Staking contract balance before funding: ${ethers.formatUnits(contractBalance, 18)} STK`);

    // Fund the staking contract with 100 STK for staking rewards
    const fundAmount = ethers.parseUnits("100", 18);
    await stakingToken.transfer(stakingAddress, fundAmount);
    console.log(`Funded Staking Contract with 100 STK`);

    // Check the staking contract's token balance after funding
    contractBalance = await stakingContract.getContractBalance();
    console.log(`Staking contract balance after funding: ${ethers.formatUnits(contractBalance, 18)} STK`);

    // Transfer tokens to user1 for staking
    const stakeAmount = ethers.parseUnits("100", 18); // 100 tokens
    await stakingToken.connect(deployer).transfer(user1.address, stakeAmount);
    console.log(`Transferred ${ethers.formatUnits(stakeAmount, 18)} STK to User1`);

    // Check user1 balance before staking
    const user1BalanceBefore = await stakingToken.balanceOf(user1.address);
    console.log(`User1 Token Balance Before Staking: ${ethers.formatUnits(user1BalanceBefore, 18)} STK`);

    // User1 approves staking contract
    await stakingToken.connect(user1).approve(stakingAddress, stakeAmount);
    console.log(`User1 approved ${ethers.formatUnits(stakeAmount, 18)} STK for staking`);

    // User1 stakes tokens
    await stakingContract.connect(user1).stake(stakeAmount);
    console.log(`User1 staked ${ethers.formatUnits(stakeAmount, 18)} STK`);

    // Fast-forward time by the minimum staking time
    const latestTime = await time.latest(); // Get the current time
    const newTime = latestTime + minStakingTime + 1; // Move forward past staking time
    await time.increaseTo(newTime);
    console.log(`Fast-forwarded time to: ${newTime}`);

    // Mine a new block to ensure `block.timestamp` updates
    await mine();
    console.log(`Mined a new block to update timestamp`);

    // Check User1's pending reward
    const reward = await stakingContract.calculateReward(user1.address);
    console.log(`User1 Earned Reward: ${ethers.formatUnits(reward, 18)} STK`);

    // User1 withdraws stake + reward
    await stakingContract.connect(user1).withdraw();
    console.log(`User1 withdrew staked tokens and reward`);

    // Check balances after withdrawal
    const user1BalanceAfter = await stakingToken.balanceOf(user1.address);
    console.log(`User1 Token Balance After Withdrawal: ${ethers.formatUnits(user1BalanceAfter, 18)} STK`);

    console.log("\n Interaction Completed!");
}

// Run the script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
