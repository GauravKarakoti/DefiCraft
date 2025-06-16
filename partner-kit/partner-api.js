import axios from 'axios';

class DeFiCraftPartner {
  constructor(apiKey) {
    this.client = axios.create({
      baseURL: 'https://defi-craft.vercel.app/partner',
      headers: { Authorization: `Bearer ${apiKey}` }
    });
  }

  async createCampaign(campaignData) {
    return this.client.post('/campaigns', campaignData);
  }

  async createBrandedQuest(questData) {
    return this.client.post('/quests', questData);
  }
}

export default DeFiCraftPartner;