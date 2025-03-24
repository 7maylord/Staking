# Staking Contract

## Overview
This Solidity smart contract allows users to stake ERC-20 tokens and earn rewards over time. It ensures secure staking, calculates rewards based on the staking duration, and enforces a minimum staking period before withdrawal.

## Features
✅ Users can **stake** ERC-20 tokens.
✅ Tracks each user's **staked amount** and **staking duration**.
✅ Calculates **staking rewards** based on a fixed reward rate.
✅ Users can **withdraw** staked tokens and earned rewards after the minimum staking period.
✅ Contract prevents **reentrancy attacks** using `ReentrancyGuard`.
✅ Uses **custom errors** for gas-efficient error handling.
✅ Supports **secure token transfers** via `SafeERC20`.
✅ Owner can **deposit rewards** to ensure withdrawals.

## Contract Details
- **Staking Token:** Any ERC-20 token specified at deployment.
- **Reward Rate:** Fixed per second, defined at deployment.
- **Minimum Staking Time:** Users must stake for at least a predefined period before withdrawing.

## Deployment
To deploy the contract, use Hardhat:

```sh
npx hardhat run scripts/deploy.js --network <network>
```

### Constructor Parameters
```solidity
constructor(
    IERC20 _stakingToken,   // Address of the ERC-20 staking token
    uint256 _rewardRate,    // Reward rate per second (e.g., 0.01 tokens per second)
    uint256 _minStakingTime // Minimum staking duration in seconds (e.g., 7 days)
)
```

## Contract Address : Lisk Sepolia
   ```sh
   0xB8995752aC27cae101A109625209BdFDF08be4f3
   ```
   
## STK Token Contract Address : Lisk Sepolia
   ```sh
   0xd4e0758Cf379D4c68F4281f7d4f82471E9DAa307
   ```

## Functions
### Staking
```solidity
function stake(uint256 amount) external;
```
**Description:** Allows users to deposit tokens for staking.

### Withdrawal
```solidity
function withdraw() external;
```
**Description:** Users can withdraw staked tokens and earned rewards after the minimum staking period.

### Reward Calculation
```solidity
function calculateReward(address user) public view returns (uint256);
```
**Description:** Returns the reward earned by a user based on staking duration.

### Deposit Rewards (Owner Only)
```solidity
function depositRewards(uint256 amount) external onlyOwner;
```
**Description:** The contract owner can deposit reward tokens to ensure users can claim rewards.

## Security Measures
- ✅ **Reentrancy Protection:** Uses `ReentrancyGuard` to prevent reentrancy attacks.
- ✅ **Safe Transfers:** Uses `SafeERC20` to prevent token transfer issues.
- ✅ **Custom Errors:** Uses Solidity custom errors for gas-efficient error handling.

## Testing
Run tests using Hardhat:

```sh
npx hardhat test
```

## License
This project is licensed under the MIT License.

