// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TGEQuest is ERC721 {
    address public owner;
    mapping(address => bool) public hasCompleted;
    mapping(address => uint256) public questProgress;

    constructor() ERC721("NERO Founder", "NEROFOUNDER") {
        owner = msg.sender;
    }

    function completeQuest(address player, uint256 questId) external {
        require(msg.sender == owner, "Not authorized");
        questProgress[player] |= (1 << questId);
        
        if(questProgress[player] == 0x1F) { // All 5 quests
            _mint(player, uint256(uint160(player)));
            hasCompleted[player] = true;
        }
    }
}