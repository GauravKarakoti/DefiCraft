import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { analyticsService } from './src/analytics.js';
import { partnerService } from './src/partnerIntegration.js';
import { tgeQuestService } from './src/tgeQuests.js';
import gameRouter from './src/gameService.js';
import { 
  getCachedGasCoverage,
  sponsorTransaction
} from './src/paymaster.cjs';

dotenv.config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

// Root endpoint
app.get('/', (req, res) => {
  res.send({
    status: 'OK',
    app: 'DefiCraft Backend',
    message: "Watch the demo video to know the endpoints",
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
  });
});

// Mount routers
app.use('/api/game', gameRouter);

// Analytics endpoints
app.get('/api/analytics', (req, res) => {
  res.json(analyticsService.getDailyMetrics());
});

// Paymaster endpoints
app.get('/api/paymaster/coverage/:playerAddress', async (req, res) => {
  try {
    const coverage = await getCachedGasCoverage(req.params.playerAddress);
    res.json(coverage);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      fallback: { percentage: 100, level: 1, userGasRequired: 0 }
    });
  }
});

app.post('/api/paymaster/sponsor/workshop', async (req, res) => {
  const { playerAddress } = req.body;
  
  try {
    const result = await sponsorTransaction({
      functionName: 'mintWorkshop',
      playerAddress
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      suggestion: 'Try again or use manual transaction'
    });
  }
});

// Partner endpoints
app.post('/api/partners/register', async (req, res) => {
  const { partnerId, config } = req.body;
  try {
    const result = await partnerService.registerPartner(partnerId, config);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/partners/create-quest', async (req, res) => {
  const { partnerId, questData } = req.body;
  try {
    const result = await partnerService.createBrandedQuest(partnerId, questData);
    console.log('Branded Quest Created:', result);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// TGE Quests endpoints
app.get('/api/tge/quests', async (req, res) => {
  const result = await tgeQuestService.getAvailableQuests();
  res.json(result);
});

app.get('/api/tge/progress/:playerAddress', async (req, res) => {
  try {
    const progress = await tgeQuestService.checkProgress(req.params.playerAddress);
    console.log('Player Progress:', progress);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tge/complete', async (req, res) => {
  const { playerAddress, questId } = req.body;
  try {
    const result = await tgeQuestService.completeQuest(playerAddress, questId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Paymaster API: ${process.env.PAYMASTER_API_KEY ? 'Enabled' : 'Disabled'}`);
  console.log(`Operator Wallet: ${process.env.OPERATOR_PRIVATE_KEY ? 'Configured' : 'MISSING!'}`);
});