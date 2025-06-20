import express from 'express';
import { getGasCoverage, getCachedGasCoverage } from './paymaster.js';

const router = express.Router();

// Player level endpoint
router.get('/player/:address/level', async (req, res) => {
  const { address } = req.params;
  const coverage = await getGasCoverage(address);
  
  res.json({
    level: coverage.level,
    gasCoverage: coverage.percentage
  });
});

// Workshop creation
router.post('/workshop/create', async (req, res) => {
  const { playerAddress } = req.body;
  
  // Check gas coverage
  const coverage = await getCachedGasCoverage(playerAddress);
  
  try {
    if (coverage.percentage < 100) {
      // Hybrid transaction flow
      const txData = createHybridTransaction(playerAddress);
      const sponsoredTx = await sponsorTransaction(txData);
      return res.json({ hybridTx: sponsoredTx });
    }
    
    // Full gas coverage flow
    const result = await WorkshopFactory.mintWorkshop(playerAddress);
    analyticsService.trackPlayerActivity(playerAddress, 'create_workshop');
    
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Workshop creation failed:', error);
    res.status(500).json({ error: 'Workshop creation failed' });
  }
});

export default router;