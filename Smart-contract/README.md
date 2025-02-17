# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```
Build a Solidity smart contract for a staking system where users can stake tokens and earn rewards over time. The contract should include the following features:

Users can deposit (stake) ERC20 tokens into the contract.
The contract should track each user's staked amount and staking duration.
Rewards should be calculated based on the staking period and distributed accordingly.
Users should be able to withdraw their stake along with earned rewards after a minimum staking period.
Ensure the contract is gas-efficient and secure against potential vulnerabilities such as reentrancy attacks.
Use Custom Errors