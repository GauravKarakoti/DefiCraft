import { MongoClient } from 'mongodb'
import { analyticsService } from './analytics.js'

const MONGODB_URI = process.env.DB_URL
const DB_NAME = 'defiCraft'

let db, partnersCollection, questsCollection

async function initDb() {
  if (db) return
  const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  await client.connect()
  db = client.db(DB_NAME)
  partnersCollection = db.collection('partners')
  questsCollection   = db.collection('quests')

  // Indexes for fast lookups + upserts
  await partnersCollection.createIndex({ partnerId: 1 }, { unique: true })
  await questsCollection.createIndex({ questId: 1 }, { unique: true })
}
await initDb()

export class PartnerService {
  async registerPartner(partnerId, config) {
    if (!config.longTermCommitment || config.commitmentDuration < 6) {
      throw new Error('Partners must commit for 6+ months');
    }
    
    await initDb()
    await partnersCollection.updateOne(
      { partnerId },
      { $set: { partnerId, ...config } },
      { upsert: true }
    )
    return { success: true, partnerId }
  }

  async getPartner(partnerId) {
    await initDb()
    return await partnersCollection.findOne({ partnerId })
  }

  async createBrandedQuest(partnerId, questData) {
    const partner = await this.getPartner(partnerId)
    if (!partner) return 'Partner not registered'

    // Track partner revenue and activity
    analyticsService.trackRevenue(questData.revenueShare)
    analyticsService.trackPlayerActivity(
      'system',
      'partner_quest',
      { partnerId, questId: questData.id }
    )

    // Prepare quest record
    const record = {
      questId:     questData.id,
      partnerId,
      title:       questData.title,
      description: questData.description,
      reward:      questData.reward,
      revenueShare: questData.revenueShare,
      status:      'active',
      createdAt:   new Date(),
      metadata:    questData.metadata || {}
    }

    // Insert into MongoDB
    await questsCollection.insertOne(record)

    return record
  }

  async setupSponsorshipCampaign(partnerId, campaignData) {
    const partner = await this.getPartner(partnerId)
    if (!partner) throw new Error('Partner not registered')

    analyticsService.trackGasSponsored(campaignData.gasBudget)

    return {
      ...campaignData,
      partnerId,
      startDate:   new Date(),
      remainingGas: campaignData.gasBudget
    }
  }
}

export const partnerService = new PartnerService()

// Seed default partners (only once, not under test)
if (process.env.NODE_ENV !== 'test') {
  ;(async () => {
    await partnerService.registerPartner('nerolabs', {
      name: 'NERO Labs',
      revenueShare: 0.1,
      contact: 'partners@nerochain.io'
    })
    await partnerService.registerPartner('defi_protocols', {
      name: 'DeFi Protocols Alliance',
      revenueShare: 0.15,
      contact: 'integrations@defi.org'
    })
  })().catch(console.error)
}
