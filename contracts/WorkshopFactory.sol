// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract WorkshopFactory is ERC721 {
    uint256 public nextTokenId;
    address public owner;
    mapping(uint256 => string) public workshopTypes;
    mapping(address => uint256) public playerLevel;

    constructor() ERC721("DeFiCraft Workshop", "WORKSHOP") {
        owner = msg.sender;
    }

    function mintWorkshop(address player, string memory workshopType) external {
        _safeMint(player, nextTokenId);
        workshopTypes[nextTokenId] = workshopType;
        nextTokenId++;
    }

    function setPlayerLevel(address player, uint256 level) external {
        require(msg.sender == owner, "Not owner");
        playerLevel[player] = level;
    }
}