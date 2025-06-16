# DeFiCraft Partner API Reference

## Authentication
All API requests require authentication using your API key:

```http
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### Create Branded Quest
`POST /api/partners/create-quest`

Request Body:
```json
{
  "partnerId": "your_partner_id",
  "questData": {
    "name": "Brand Quest",
    "description": "Complete tasks to earn rewards",
    "rewards": [
      {
        "token": "$PARTNER",
        "amount": 100
      }
    ],
    "startDate": "2025-07-01",
    "endDate": "2025-07-31",
    "revenueShare": 0.1
  }
}
```

### Setup Sponsorship Campaign
`POST /api/partners/setup-campaign`

Request Body:
```json
{
  "partnerId": "your_partner_id",
  "campaignData": {
    "name": "Summer Campaign",
    "gasBudget": 1.5,
    "startDate": "2025-06-15",
    "endDate": "2025-08-15",
    "targetAudience": "new_players"
  }
}
```

### SDK Usage
```javascript
import DeFiCraftPartner from 'defi-craft-partner-sdk';

const partner = new DeFiCraftPartner('YOUR_API_KEY');

// Create quest
const quest = await partner.createBrandedQuest({
  name: "Starbucks Quest",
  // ... other data
});

// Setup campaign
const campaign = await partner.setupSponsorshipCampaign({
  name: "Free Gas Weekend",
  gasBudget: 2.0,
  // ... other data
});
```

