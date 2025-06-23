import express from 'express';
import { getGasCoverage, getCachedGasCoverage, sponsorTransaction, sponsorWorkshopCreation } from './paymaster.cjs';
import WorkshopFactoryService from './workshopFactory.cjs';

const router = express.Router();

const createMintTransaction = (playerAddress) => {
  return WorkshopFactoryService.contract.mintWorkshop.populateTransaction(
    playerAddress,
    "Basic"
  );
};

// Player level endpoint
router.get('/player/:address/level', async (req, res) => {
  const { address } = req.params;
  const coverage = await getGasCoverage(address);
  
  res.json({
    level: coverage.level,
    gasCoverage: coverage.percentage
  });
});

router.post('/workshop/create', async (req, res) => {
  const { playerAddress } = req.body;
  const coverage = await getCachedGasCoverage(playerAddress);
  
  try {
    if (coverage.percentage < 100) {
      // Hybrid transaction flow using AA
      const result = await sponsorWorkshopCreation(playerAddress);
      
      analyticsService.trackGasSponsored(parseFloat(result.gasSponsored));
      analyticsService.trackPlayerActivity(
        playerAddress, 
        'sponsored_transaction',
        { 
          gasSponsored: result.gasSponsored,
          txHash: result.sponsoredTx
        }
      );
      
      return res.json({ 
        hybridTx: true,
        sponsoredTx: result.sponsoredTx,
        userGasRequired: coverage.userGasRequired 
      });
    }
    
    // Full coverage flow
    const result = await WorkshopFactoryService.mintWorkshop(playerAddress);
    analyticsService.trackPlayerActivity(playerAddress, 'create_workshop');
    
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Workshop creation failed:', error);
    res.status(500).json({ error: 'Workshop creation failed' });
  }
});

export default router;