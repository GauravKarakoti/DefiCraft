import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.API_KEY;
const API_URL = 'https://defi-craft.vercel.app/partner';

async function setupSponsorshipCampaign() {
  try {
    const response = await axios.post(`${API_URL}/api/partners/setup-campaign`, {
      partnerId: "nike",
      campaignData: {
        name: "Nike Summer Campaign",
        gasBudget: 3.2, // ETH
        startDate: "2025-06-15",
        endDate: "2025-08-15",
        targetAudience: "active_players",
        rules: {
          minLevel: 3,
          maxTransactions: 5
        }
      }
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Campaign created successfully:', response.data);
  } catch (error) {
    console.error('Error creating campaign:', error.response?.data || error.message);
  }
}

setupSponsorshipCampaign();