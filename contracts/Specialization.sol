// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Specialization is Ownable {
    enum SpecializationType { DEX_ALCHEMIST, LENDING_ENCHANTER }
    
    mapping(address => SpecializationType) public playerSpecialization;
    mapping(SpecializationType => uint256) public boostPercentage;
    
    event SpecializationChosen(address indexed player, SpecializationType specialization);

    constructor() Ownable(msg.sender) {
        boostPercentage[SpecializationType.DEX_ALCHEMIST] = 1500; // 15% boost
        boostPercentage[SpecializationType.LENDING_ENCHANTER] = 1000; // 10% boost
    }

    function chooseSpecialization(SpecializationType specialization) external {
        require(playerSpecialization[msg.sender] == SpecializationType(0), "Already specialized");
        playerSpecialization[msg.sender] = specialization;
        emit SpecializationChosen(msg.sender, specialization);
    }

    function getBoost(address player) external view returns (uint256) {
        return boostPercentage[playerSpecialization[player]];
    }

    function setBoost(SpecializationType specialization, uint256 boost) external onlyOwner {
        boostPercentage[specialization] = boost;
    }
}