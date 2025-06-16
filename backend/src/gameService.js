import express from 'express';
import { getGasCoverage } from './paymaster.js';

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
  const coverage = await getGasCoverage(playerAddress);
  
  if (coverage.percentage < 100) {
    // Handle hybrid transaction
  }
  
  // Create workshop logic
  res.json({ success: true, workshopId: "12345" });
});

export default router;