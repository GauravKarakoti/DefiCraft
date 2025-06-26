// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ResourceTracker is Ownable {
    struct Resource {
        string name;
        uint256 amount;
    }
    
    // Player address => Resource[]
    mapping(address => Resource[]) private playerResources;
    
    // Resource name => exists
    mapping(string => bool) private validResources;
    
    // Authorized minters (workshops, quests, etc.)
    mapping(address => bool) public minters;
    
    event ResourceAdded(address indexed player, string name, uint256 amount);
    event ResourceUpdated(address indexed player, string name, uint256 newAmount);
    event ResourceRemoved(address indexed player, string name);
    
    constructor(address initialOwner) Ownable(initialOwner) {
        // Initialize with common resources
        validResources["WOOD"] = true;
        validResources["STONE"] = true;
        validResources["METAL"] = true;
        validResources["CRYSTAL"] = true;
        validResources["ESSENCE"] = true;
    }
    
    modifier onlyMinter() {
        require(minters[msg.sender], "ResourceTracker: Caller is not minter");
        _;
    }
    
    modifier validResource(string memory name) {
        require(validResources[name], "ResourceTracker: Invalid resource");
        _;
    }
    
    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
    }
    
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
    }
    
    function addResourceType(string memory name) external onlyOwner {
        validResources[name] = true;
    }
    
    function mintResource(
        address player, 
        string memory name, 
        uint256 amount
    ) external onlyMinter validResource(name) {
        // Check if player already has this resource
        for (uint i = 0; i < playerResources[player].length; i++) {
            if (keccak256(bytes(playerResources[player][i].name)) == keccak256(bytes(name))) {
                playerResources[player][i].amount += amount;
                emit ResourceUpdated(player, name, playerResources[player][i].amount);
                return;
            }
        }
        
        // If new resource for player
        playerResources[player].push(Resource(name, amount));
        emit ResourceAdded(player, name, amount);
    }
    
    function burnResource(
        address player, 
        string memory name, 
        uint256 amount
    ) external onlyMinter validResource(name) {
        for (uint i = 0; i < playerResources[player].length; i++) {
            if (keccak256(bytes(playerResources[player][i].name)) == keccak256(bytes(name))) {
                require(
                    playerResources[player][i].amount >= amount,
                    "ResourceTracker: Insufficient balance"
                );
                
                playerResources[player][i].amount -= amount;
                
                if (playerResources[player][i].amount == 0) {
                    // Remove resource if balance is zero
                    _removeResource(player, i);
                    emit ResourceRemoved(player, name);
                } else {
                    emit ResourceUpdated(player, name, playerResources[player][i].amount);
                }
                return;
            }
        }
        revert("ResourceTracker: Resource not found");
    }
    
    function getResources(address player) external view returns (Resource[] memory) {
        return playerResources[player];
    }
    
    function getResourceAmount(address player, string memory name) 
        external 
        view 
        validResource(name) 
        returns (uint256) 
    {
        for (uint i = 0; i < playerResources[player].length; i++) {
            if (keccak256(bytes(playerResources[player][i].name)) == keccak256(bytes(name))) {
                return playerResources[player][i].amount;
            }
        }
        return 0;
    }
    
    function _removeResource(address player, uint256 index) private {
        uint256 lastIndex = playerResources[player].length - 1;
        if (index != lastIndex) {
            playerResources[player][index] = playerResources[player][lastIndex];
        }
        playerResources[player].pop();
    }
}