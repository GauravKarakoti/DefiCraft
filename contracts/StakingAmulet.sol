// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakingAmulet is ERC721 {
    uint256 public nextTokenId;
    address public stakingToken;
    mapping(uint256 => uint256) public stakedAmount;
    mapping(uint256 => uint256) public lastClaimTime;
    
    event Staked(address indexed player, uint256 amount, uint256 tokenId);
    event Unstaked(address indexed player, uint256 amount, uint256 tokenId);
    event RewardClaimed(address indexed player, uint256 amount, uint256 tokenId);

    constructor(address _stakingToken) ERC721("Staking Amulet", "AMULET") {
        stakingToken = _stakingToken;
    }

    function mintWithStake(uint256 amount) external {
        IERC20(stakingToken).transferFrom(msg.sender, address(this), amount);
        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        stakedAmount[tokenId] = amount;
        lastClaimTime[tokenId] = block.timestamp;
        emit Staked(msg.sender, amount, tokenId);
    }

    function claimReward(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        uint256 duration = block.timestamp - lastClaimTime[tokenId];
        uint256 reward = calculateReward(tokenId, duration);
        
        // Mint or transfer reward tokens here...
        lastClaimTime[tokenId] = block.timestamp;
        emit RewardClaimed(msg.sender, reward, tokenId);
    }
    
    function unstake(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        uint256 amount = stakedAmount[tokenId];
        
        IERC20(stakingToken).transfer(msg.sender, amount);
        _burn(tokenId);
        delete stakedAmount[tokenId];
        delete lastClaimTime[tokenId];
        emit Unstaked(msg.sender, amount, tokenId);
    }

    function calculateReward(uint256 tokenId, uint256 duration) public view returns (uint256) {
        // Simplified reward calculation (APY = 10%)
        return (stakedAmount[tokenId] * duration * 10) / (365 days * 100);
    }
}
