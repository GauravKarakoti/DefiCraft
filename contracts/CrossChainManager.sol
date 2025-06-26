// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/operatorforwarder/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/operatorforwarder/Chainlink.sol"; // Explicitly import Chainlink library

contract CrossChainManager is ChainlinkClient, Ownable {
    using Chainlink for Chainlink.Request;
    
    struct CrossChainWorkshop {
        uint256[] chainIds;
        address owner;
        uint256 lastRebalance;
    }
    
    mapping(uint256 => CrossChainWorkshop) public workshops;
    mapping(uint256 => uint256) public chainAPYs; // ChainID -> APY
    
    address public workshopFactory;
    address public oracle;
    bytes32 public jobId;
    uint256 public fee;
    
    event WorkshopDeployed(uint256 workshopId, uint256[] chainIds);
    event FundsRebalanced(uint256 workshopId, uint256 fromChain, uint256 toChain, uint256 amount);
    event CrossChainCrafting(uint256 workshopId, uint256 sourceChain, uint256 destChain, string resource);
    event APYUpdated(uint256[] chainIds, uint256[] apys);
    
    constructor(address _workshopFactory) Ownable(msg.sender) {
        workshopFactory = _workshopFactory;
        _setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB); // LINK token on NERO
    }
    
    function deployWorkshop(uint256 workshopId, uint256[] calldata chainIds) external {
        require(IWorkshopFactory(workshopFactory).ownerOf(workshopId) == msg.sender, "Not owner");
        workshops[workshopId] = CrossChainWorkshop(chainIds, msg.sender, block.timestamp);
        emit WorkshopDeployed(workshopId, chainIds);
    }
    
    // function requestAPYUpdate() external {
    //     Chainlink.Request memory req = _buildOperatorRequest(jobId, this.fulfillAPYUpdate.selector);
    //     // Fixed: Use explicit Chainlink library calls
    //     Chainlink.add(req, "method", "GET");
    //     Chainlink.add(req, "url", "https://defi-craft.xyz/api/apy-feeds");
    //     Chainlink.add(req, "path", "data");
    //     _sendChainlinkRequestTo(oracle, req, fee);
    // }
    
    function fulfillAPYUpdate(bytes32 _requestId, bytes memory _apyData) public recordChainlinkFulfillment(_requestId) {
        (uint256[] memory chainIds, uint256[] memory apys) = abi.decode(_apyData, (uint256[], uint256[]));
        
        for (uint i = 0; i < chainIds.length; i++) {
            chainAPYs[chainIds[i]] = apys[i];
        }
        
        emit APYUpdated(chainIds, apys);
    }
    
    function autoRebalance(uint256 workshopId) external {
        CrossChainWorkshop storage workshop = workshops[workshopId];
        require(block.timestamp > workshop.lastRebalance + 1 days, "Too soon");
        
        // Find highest APY chain
        uint256 highestAPYChain;
        uint256 highestAPY;
        for (uint i = 0; i < workshop.chainIds.length; i++) {
            if (chainAPYs[workshop.chainIds[i]] > highestAPY) {
                highestAPY = chainAPYs[workshop.chainIds[i]];
                highestAPYChain = workshop.chainIds[i];
            }
        }
        
        // Execute rebalance (simplified)
        emit FundsRebalanced(workshopId, 0, highestAPYChain, 0);
        workshop.lastRebalance = block.timestamp;
    }
    
    function crossChainCraft(uint256 workshopId, uint256 sourceChain, uint256 destChain, string memory resource) external {
        require(workshops[workshopId].owner == msg.sender, "Not owner");
        // Bridge implementation would go here
        emit CrossChainCrafting(workshopId, sourceChain, destChain, resource);
    }
    
    // Admin functions
    function setOracle(address _oracle, bytes32 _jobId, uint256 _fee) external onlyOwner {
        oracle = _oracle;
        jobId = _jobId;
        fee = _fee;
    }
    
    function withdrawLink() external onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(_chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
    }
}

interface IWorkshopFactory {
    function ownerOf(uint256 tokenId) external view returns (address);
}
