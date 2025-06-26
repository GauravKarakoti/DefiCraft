// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract DefiCraftDAO {
    using Address for address;
    
    struct InstitutionalPlayer {
        address wallet;
        string name;
        uint256 votingPower;
    }
    
    struct Proposal {
        address proposer;
        address[] targets;
        uint256[] values;
        bytes[] calldatas;
        uint256 startBlock;
        uint256 endBlock;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool executed;
        bool canceled;
        string description;
    }
    
    ERC20Votes public token;
    uint256 public constant VOTING_DELAY = 1;
    uint256 public constant VOTING_PERIOD = 50400; // 1 week in blocks (assuming 12s blocks)
    uint256 public constant PROPOSAL_THRESHOLD = 1000e18; // 1000 tokens
    uint256 public constant QUORUM_PERCENTAGE = 10; // 10%
    
    mapping(address => InstitutionalPlayer) public institutionalPlayers;
    address[] public institutionalAddresses;
    Proposal[] public proposals;
    
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    event ProposalCreated(
        uint256 proposalId,
        address proposer,
        address[] targets,
        uint256[] values,
        bytes[] calldatas,
        uint256 startBlock,
        uint256 endBlock,
        string description
    );
    
    event VoteCast(
        address indexed voter,
        uint256 proposalId,
        uint8 support,
        uint256 weight
    );
    
    event ProposalExecuted(uint256 proposalId);
    event ProposalCanceled(uint256 proposalId);
    event InstitutionRegistered(address indexed institution, string name);

    constructor(ERC20Votes _token) {
        token = _token;
    }
    
    function registerInstitution(string memory name) external {
        require(institutionalPlayers[msg.sender].wallet == address(0), "Already registered");
        institutionalPlayers[msg.sender] = InstitutionalPlayer({
            wallet: msg.sender,
            name: name,
            votingPower: 10000
        });
        institutionalAddresses.push(msg.sender);
        emit InstitutionRegistered(msg.sender, name);
    }
    
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) external returns (uint256) {
        require(targets.length == values.length, "Invalid proposal");
        require(targets.length == calldatas.length, "Invalid proposal");
        
        // Check proposal threshold
        uint256 votes = getVotes(msg.sender, block.number - 1);
        require(votes >= PROPOSAL_THRESHOLD, "Below proposal threshold");
        
        uint256 proposalId = proposals.length;
        uint256 startBlock = block.number + VOTING_DELAY;
        uint256 endBlock = startBlock + VOTING_PERIOD;
        
        proposals.push(Proposal({
            proposer: msg.sender,
            targets: targets,
            values: values,
            calldatas: calldatas,
            startBlock: startBlock,
            endBlock: endBlock,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            executed: false,
            canceled: false,
            description: description
        }));
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            targets,
            values,
            calldatas,
            startBlock,
            endBlock,
            description
        );
        
        return proposalId;
    }
    
    function vote(uint256 proposalId, uint8 support) external {
        require(support <= 2, "Invalid vote type");
        Proposal storage proposal = proposals[proposalId];
        
        require(block.number >= proposal.startBlock, "Voting not started");
        require(block.number <= proposal.endBlock, "Voting ended");
        require(!proposal.canceled, "Proposal canceled");
        require(!proposal.executed, "Proposal executed");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        
        uint256 weight = getVotes(msg.sender, proposal.startBlock);
        require(weight > 0, "No voting power");
        
        hasVoted[proposalId][msg.sender] = true;
        
        if (support == 0) {
            proposal.againstVotes += weight;
        } else if (support == 1) {
            proposal.forVotes += weight;
        } else if (support == 2) {
            proposal.abstainVotes += weight;
        }
        
        emit VoteCast(msg.sender, proposalId, support, weight);
    }
    
    function execute(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.number > proposal.endBlock, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Proposal canceled");
        
        // Check quorum
        uint256 quorumVotes = (token.getPastTotalSupply(proposal.startBlock) * QUORUM_PERCENTAGE) / 100;
        require(proposal.forVotes + proposal.againstVotes + proposal.abstainVotes >= quorumVotes, "Quorum not met");
        
        proposal.executed = true;
        
        for (uint256 i = 0; i < proposal.targets.length; i++) {
            proposal.targets[i].functionCallWithValue(
                proposal.calldatas[i],
                proposal.values[i]
            );
        }
        
        emit ProposalExecuted(proposalId);
    }
    
    function cancel(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(msg.sender == proposal.proposer, "Only proposer can cancel");
        require(block.number < proposal.startBlock, "Voting already started");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Already canceled");
        
        proposal.canceled = true;
        emit ProposalCanceled(proposalId);
    }
    
    function getVotes(address account, uint256 blockNumber) public view returns (uint256) {
        if (institutionalPlayers[account].wallet != address(0)) {
            return institutionalPlayers[account].votingPower;
        }
        return token.getPastVotes(account, blockNumber);
    }
    
    function state(uint256 proposalId) public view returns (string memory) {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.canceled) return "Canceled";
        if (proposal.executed) return "Executed";
        if (block.number < proposal.startBlock) return "Pending";
        if (block.number <= proposal.endBlock) return "Active";
        return "Succeeded";
    }
    
    function getProposalCount() external view returns (uint256) {
        return proposals.length;
    }
    
    function quorum(uint256 proposalId) public view returns (uint256) {
        Proposal storage proposal = proposals[proposalId];
        return (token.getPastTotalSupply(proposal.startBlock) * QUORUM_PERCENTAGE) / 100;
    }
}