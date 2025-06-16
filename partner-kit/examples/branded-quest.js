import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.PARTNER_API_KEY;
const API_URL = 'https://defi-craft.vercel.app/partner';

async function createBrandedQuest() {
  try {
    const response = await axios.post(`${API_URL}/api/partners/create-quest`, {
      partnerId: "starbucks",
      questData: {
        name: "Starbucks Coffee Quest",
        description: "Post a photo of your Starbucks coffee and earn $BREW tokens",
        rewards: [
          { token: "$BREW", amount: 10 }
        ],
        startDate: "2025-07-01",
        endDate: "2025-07-31",
        revenueShare: 0.15
      }
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Quest created successfully:', response.data);
  } catch (error) {
    console.error('Error creating quest:', error.response?.data || error.message);
  }
}

createBrandedQuest();