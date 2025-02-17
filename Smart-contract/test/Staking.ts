import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture, mine } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("StakingContract", function () {
  async function deployStakingContractFixture() {
    const [deployer, user] = await ethers.getSigners();

    // Define token parameters
    const tokenName = "Staking Token";
    const tokenSymbol = "STK";
    const initialSupply = ethers.parseUnits("100000", 18); // 100,000 tokens with 18 decimals

    // Deploy ERC20 Token for Staking
    const StakingToken = await ethers.getContractFactory("stakingToken");
    const stakingToken = await StakingToken.deploy(tokenName, tokenSymbol, initialSupply);
    await stakingToken.waitForDeployment();
    const stakingTokenAddress = await stakingToken.getAddress();

    // Define staking parameters
    const rewardRate = ethers.parseUnits("0.01", 18); // Reward rate per second
    const minStakingTime =  60; // 60 seconds for testing

    // Deploy Staking Contract
    const StakingContract = await ethers.getContractFactory("StakingContract");
    const stakingContract = await StakingContract.deploy(stakingTokenAddress, rewardRate, minStakingTime);
    await stakingContract.waitForDeployment();
    const stakingAddress = await stakingContract.getAddress();

    // Fund the staking contract with 100 STK for rewards
    const fundAmount = ethers.parseUnits("100", 18);
    await stakingToken.transfer(stakingAddress, fundAmount);

    return { stakingToken, stakingAddress, stakingContract, deployer, user, fundAmount, minStakingTime };
  }

  describe("Deployment", function () {
    it("Should deploy the staking contract and staking token", async function () {
      const { stakingToken, stakingContract } = await loadFixture(deployStakingContractFixture);

      expect(await stakingToken.name()).to.equal("Staking Token");
      expect(await stakingToken.symbol()).to.equal("STK");
      expect(await stakingContract.stakingToken()).to.equal(stakingToken.target);
    });

    it("Should fund the staking contract with 100 STK", async function () {
      const { stakingContract, fundAmount } = await loadFixture(deployStakingContractFixture);

      const contractBalance = await stakingContract.getContractBalance();
      expect(contractBalance).to.equal(fundAmount); // 100 STK
    });

    it("Should deploy the staking contract and staking token with correct addresses", async function () {
      const { stakingToken, stakingContract } = await loadFixture(deployStakingContractFixture);

      expect(await stakingToken.getAddress()).to.be.properAddress;
      expect(await stakingContract.getAddress()).to.be.properAddress;
    });
  });

  describe("Staking", function () {
    it("Should allow a user to stake tokens", async function () {
      const { stakingToken, stakingContract, user } = await loadFixture(deployStakingContractFixture);
      const stakeAmount = ethers.parseUnits("10", 18);

      // Fund the user with 100 STK tokens
      await stakingToken.transfer(user.address, ethers.parseUnits("100", 18)); 
      
      // Approve staking contract to spend user tokens
      await stakingToken.connect(user).approve(stakingContract.getAddress(), stakeAmount);

      // User stakes 10 STK tokens
      await stakingContract.connect(user).stake(stakeAmount);

      // Check staked balance
      const [stakedAmount, startTime] = await stakingContract.getStakeInfo(user.address);
      expect(stakedAmount).to.equal(stakeAmount);
      expect(startTime).to.be.gt(0);
    });

    it("Should revert staking if amount is zero", async function () {
      const { stakingContract } = await loadFixture(deployStakingContractFixture);
      await expect(stakingContract.stake(0)).to.be.revertedWithCustomError(stakingContract, "InsufficientStake");
    });
  });

  describe("Withdrawals", function () {
    it("Should allow withdrawal after minimum staking time with correct reward", async function () {
      const { stakingToken, stakingContract, user, minStakingTime } = await loadFixture(deployStakingContractFixture);
      const stakeAmount = ethers.parseUnits("10", 18);

      // Fund contract with extra tokens for rewards
      await stakingToken.transfer(stakingContract.getAddress(), ethers.parseUnits("10000", 18));

      // Fund the user with tokens and approve staking contract
      await stakingToken.transfer(user.address, ethers.parseUnits("100", 18));
      await stakingToken.connect(user).approve(stakingContract.getAddress(), stakeAmount);

      // User stakes 10 STK tokens
      await stakingContract.connect(user).stake(stakeAmount);

      // Fast-forward time by minimum staking time
      await time.increase(minStakingTime);
      await mine(); // Mine a new block to update timestamp

      // Withdraw the staked amount and reward
      const initialBalance = await stakingToken.balanceOf(user.address);
      await stakingContract.connect(user).withdraw();

      const finalBalance = await stakingToken.balanceOf(user.address);
      expect(finalBalance).to.be.gt(initialBalance); // User should receive rewards along with staked tokens
    });

    it("Should revert withdrawal if minimum staking time is not reached", async function () {
      const { stakingToken, stakingContract, user } = await loadFixture(deployStakingContractFixture);
      const stakeAmount = ethers.parseUnits("10", 18);

      // Fund contract with extra tokens for rewards
      await stakingToken.transfer(stakingContract.getAddress(), ethers.parseUnits("1000", 18));

      // Fund the user with tokens and approve staking contract
      await stakingToken.transfer(user.address, ethers.parseUnits("100", 18));
      await stakingToken.connect(user).approve(stakingContract.getAddress(), stakeAmount);

      // User stakes 10 STK tokens
      await stakingContract.connect(user).stake(stakeAmount);

      // Attempt withdrawal before minimum staking time
      await expect(stakingContract.connect(user).withdraw()).to.be.revertedWithCustomError(stakingContract, "MinimumStakingTimeNotReached");
    });
  });
});
