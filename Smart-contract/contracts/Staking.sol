// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // Import IERC20 interface
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; // Import SafeERC20 library
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Staking contract
contract StakingContract is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;  

    IERC20 public immutable stakingToken;  
    uint256 public immutable rewardRate;
    uint256 public immutable minStakingTime;
    uint256 public totalSupply;
    uint256 public rewardPool;

    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
    }
    
    mapping(address => StakeInfo) private stakes;
    
    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 reward);    
    event RewardDeposited(uint256 amount);

    error InsufficientStake(uint256 amount);
    error MinimumStakingTimeNotReached();
    error TransferFailed();
    error InsufficientBalance();

    constructor(IERC20 _stakingToken, uint256 _rewardRate, uint256 _minStakingTime) Ownable(msg.sender) {
        stakingToken = _stakingToken; 
        rewardRate = _rewardRate;
        minStakingTime = _minStakingTime;
    }

    // Function to stake tokens
    function stake(uint256 amount) external nonReentrant {
        if (amount == 0) revert InsufficientStake(amount);

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        stakes[msg.sender].amount += amount;
        totalSupply += amount;
        stakes[msg.sender].startTime = block.timestamp;
        
        emit Staked(msg.sender, amount, block.timestamp);
    }

    // Function to withdraw staked tokens and rewards
    function withdraw() external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        if (stakeInfo.amount == 0) revert InsufficientStake(0);
        if (block.timestamp < stakeInfo.startTime + minStakingTime) {
            revert MinimumStakingTimeNotReached();
        }
        
        uint256 stakedAmount = stakeInfo.amount;
        uint256 reward = calculateReward(msg.sender);
        uint256 totalAmount = stakedAmount + reward;
        
        if (reward > rewardPool) revert InsufficientBalance();

      // Reset user stake 
        stakeInfo.amount = 0;
        stakeInfo.startTime = 0;

        totalSupply -= stakedAmount;
        rewardPool -= reward;

        emit Withdrawn(msg.sender, stakedAmount, reward);

        
        stakingToken.safeTransfer(msg.sender, totalAmount);
    }

    // Function to calculate reward for a user based on staking duration
    function calculateReward(address user) public view returns (uint256) {
        StakeInfo storage stakeInfo = stakes[user];
        if (stakeInfo.amount == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - stakeInfo.startTime;
        uint256 _reward = (stakeInfo.amount * stakingDuration * rewardRate) / 1e18;
        return _reward;
    }

    function depositRewards(uint256 amount) external onlyOwner {
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
        emit RewardDeposited(amount);
    }

    // Function to check contract's token balance
    function getContractBalance() external view returns (uint256) {
        return stakingToken.balanceOf(address(this)); 
    }
    
    // Function to get stake information for a user
    function getStakeInfo(address user) external view returns (uint256 amount, uint256 startTime) {
        return (stakes[user].amount, stakes[user].startTime);
    }
}
