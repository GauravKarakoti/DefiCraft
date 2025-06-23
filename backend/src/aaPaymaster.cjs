const { ethers } = require('ethers');
require('dotenv').config();

let userOpModule;
const initializeUserOp = async () => {
  if (!userOpModule) {
    userOpModule = await import('userop');
  }
  return userOpModule;
};

// Configuration
const AA_PLATFORM_CONFIG = {
  bundlerRpc: "https://bundler-testnet.nerochain.io/",
  paymasterRpc: "https://paymaster-testnet.nerochain.io",
};

const CONTRACT_ADDRESSES = {
  entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  accountFactory: "0x9406Cc6185a346906296840746125a0E44976454",
  workshopFactory: process.env.WORKSHOP_FACTORY_ADDRESS || "",
  specialization: process.env.SPECIALIZATION_ADDRESS || "",
  stakingAmulet: process.env.STAKING_AMULET_ADDRESS || "",
  tgeQuests: process.env.TGE_QUESTS_ADDRESS || ""
};

const API_KEY = process.env.PAYMASTER_API_KEY || "";

// Create provider
const provider = new ethers.JsonRpcProvider(process.env.NERO_RPC_URL);

const initAA = async () => {
  const { Client } = await initializeUserOp();
  return Client.init(process.env.NERO_RPC_URL, {
    entryPoint: CONTRACT_ADDRESSES.entryPoint,
    overrideBundlerRpc: AA_PLATFORM_CONFIG.bundlerRpc
  });
};

// Simulate gas coverage
const simulateGasCoverage = async (playerAddress) => {
  try {
    // In reality, this would use AA rules - for now we'll simulate
    const level = await getPlayerLevel(playerAddress);
    
    // Simple coverage rules based on player level
    return {
      percentage: Math.min(100, level * 20), // 20% per level
      level,
      userGasRequired: level > 0 ? 0 : 0.0001 // ETH
    };
  } catch (error) {
    console.error("Coverage simulation error:", error);
    return { percentage: 100, level: 1, userGasRequired: 0 };
  }
};

// Get player level from contract
const getPlayerLevel = async (playerAddress) => {
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.workshopFactory,
      ["function playerLevel(address) view returns (uint256)"],
      provider
    );
    return Number(await contract.playerLevel(playerAddress));
  } catch (error) {
    console.error("Error getting player level:", error);
    return 0;
  }
};

// Execute sponsored contract operation
const executeSponsoredOperation = async (
  playerAddress,
  contractAddress,
  contractAbi,
  functionName,
  functionParams
) => {
  const { Presets } = await initializeUserOp();
  try {
    // Initialize AA client
    const client = initAA();
    
    // Create signer for AA operations
    const operatorSigner = new ethers.Wallet(
      process.env.OPERATOR_PRIVATE_KEY || "",
      provider
    );
    
    // Initialize AA builder
    const builder = await Presets.Builder.SimpleAccount.init(
      operatorSigner,
      provider,
      {
        entryPoint: CONTRACT_ADDRESSES.entryPoint,
        factory: CONTRACT_ADDRESSES.accountFactory,
      }
    );
    
    // Configure paymaster for sponsored transactions
    const paymaster = {
      rpcUrl: AA_PLATFORM_CONFIG.paymasterRpc,
      context: { type: "payg", apiKey: API_KEY }
    };
    
    // Create contract instance
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      provider
    );
    
    // Encode function call
    const callData = contract.interface.encodeFunctionData(
      functionName,
      functionParams
    );
    
    // Create the UserOperation
    const userOp = await builder.execute(contractAddress, 0, callData);
    
    // Add paymaster middleware
    userOp.useMiddleware(Presets.Middleware.getGasPrice(provider));
    userOp.useMiddleware(Presets.Middleware.estimateUserOperationGas(provider));
    userOp.useMiddleware(Presets.Middleware.signUserOp(operatorSigner));
    
    console.log("Sending UserOperation to paymaster...");
    
    // Send the UserOperation
    const res = await client.sendUserOperation(userOp, {
      onBuild: (op) => console.log("Signed UserOperation:", op),
    });
    
    console.log("UserOperation sent with hash:", res.userOpHash);
    
    // Wait for the transaction to be included
    const receipt = await res.wait();
    if (!receipt) {
      throw new Error("Transaction receipt is null");
    }
    
    console.log("Transaction mined in block:", receipt.blockNumber);
    
    // Calculate gas sponsored
    const gasUsed = BigInt(receipt.gasUsed.toString());
    const effectiveGasPrice = BigInt(receipt.effectiveGasPrice.toString());
    const gasSponsored = gasUsed * effectiveGasPrice;
    
    return {
      userOpHash: res.userOpHash,
      transactionHash: receipt.transactionHash,
      gasSponsored: ethers.formatUnits(gasSponsored, "gwei") + " Gwei"
    };
  } catch (error) {
    console.error("AA Sponsorship error:", error);
    throw error;
  }
};

// Workshop Factory ABI
const WORKSHOP_FACTORY_ABI = [
  "function mintWorkshop(address player, string memory workshopType) external"
];

// Sponsored workshop mint
const sponsorWorkshopMint = async (playerAddress) => {
  return executeSponsoredOperation(
    playerAddress,
    CONTRACT_ADDRESSES.workshopFactory,
    WORKSHOP_FACTORY_ABI,
    'mintWorkshop',
    [playerAddress, "Basic"]
  );
};

module.exports = {
  initAA,
  simulateGasCoverage,
  executeSponsoredOperation,
  sponsorWorkshopMint
};