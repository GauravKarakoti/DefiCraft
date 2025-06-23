const aaPaymaster = require('./aaPaymaster.cjs');

const coverageCache = new Map();

exports.getGasCoverage = async (playerAddress) => {
  try {
    return await aaPaymaster.simulateGasCoverage(playerAddress);
  } catch (error) {
    console.error('Coverage error:', error);
    return { percentage: 100, level: 1, userGasRequired: 0 };
  }
};

exports.getCachedGasCoverage = async (playerAddress) => {
  if (coverageCache.has(playerAddress)) {
    return coverageCache.get(playerAddress);
  }
  
  const coverage = await exports.getGasCoverage(playerAddress);
  coverageCache.set(playerAddress, coverage);
  
  // Clear cache after 1 minute
  setTimeout(() => coverageCache.delete(playerAddress), 60000);
  
  return coverage;
};

exports.sponsorTransaction = async (txData) => {
  try {
    // For workshop minting
    if (txData.functionName === 'mintWorkshop') {
      const result = await aaPaymaster.sponsorWorkshopMint(txData.playerAddress);
      return {
        sponsoredTx: result.transactionHash,
        gasSponsored: result.gasSponsored
      };
    }
    
    throw new Error("Unsupported transaction type");
  } catch (error) {
    console.error("Sponsorship error:", error);
    throw error;
  }
};

// Additional helper for direct workshop minting
exports.sponsorWorkshopCreation = async (playerAddress) => {
  return exports.sponsorTransaction({
    functionName: 'mintWorkshop',
    playerAddress
  });
};