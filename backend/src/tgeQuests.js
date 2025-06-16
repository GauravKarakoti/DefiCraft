import { MongoClient } from 'mongodb'
import { analyticsService } from './analytics.js'
import WorkshopFactoryService from './workshopFactory.cjs'

const MONGODB_URI = process.env.DB_URL
const DB_NAME     = 'defiCraft'

let db, questsCollection

// Initialize MongoDB connection and the `quests` collection once
async function initDb() {
  if (db) return
  const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  await client.connect()
  db = client.db(DB_NAME)
  questsCollection = db.collection('quests')
  // Ensure each questId is unique
  await questsCollection.createIndex({ questId: 1 }, { unique: true })
}
await initDb()

export class TGEQuestService {
  async seedDefaultQuests() {
    await initDb()
    const defaults = [
      { questId: 1, name: "First Workshop", reward: 100 },
      { questId: 2, name: "Reach Level 5",    reward: 250 },
      { questId: 3, name: "Join a Guild",     reward: 150 },
      { questId: 4, name: "Craft 5 Items",    reward: 300 },
      { questId: 5, name: "Stake 100 $CRAFT", reward: 500 },
    ]
    const ops = defaults.map(q => ({
      updateOne: {
        filter: { questId: q.questId },
        update: { $set: q },
        upsert: true
      }
    }))
    await questsCollection.bulkWrite(ops)
  }

  async getAvailableQuests(filter = {}, options = {}) {
    await initDb()
    return questsCollection
      .find(filter, { projection: { _id: 0 }, ...options })
      .sort({ questId: 1 })
      .toArray()
  }

  async getQuest(questId) {
    await initDb()
    return questsCollection.findOne({ questId }, { projection: { _id: 0 } })
  }

  async checkProgress(playerAddress) {
    const workshopCount = await WorkshopFactoryService.getPlayerWorkshopCount(playerAddress)

    const quests = await this.getAvailableQuests()
    const progress = {}
    quests.forEach(q => {
      if (q.questId === 1)      progress[q.questId] = workshopCount > 0 ? 1 : 0
      else if (q.questId === 4) progress[q.questId] = Math.min(workshopCount, 5)
      else                       progress[q.questId] = 0
    })

    return { player: playerAddress, progress, completed: [] }
  }

  async completeQuest(playerAddress, questId) {
    const quest = await this.getQuest(questId)
    if (!quest) throw new Error('Unknown quest')

    const { progress, completed = [] } = await this.checkProgress(playerAddress)
    if (completed.includes(questId)) throw new Error('Quest already completed')
    if (progress[questId] < 1)        throw new Error(`Requirements not met for quest ${questId}`)

    analyticsService.trackPlayerActivity(
      playerAddress,
      'complete_tge_quest',
      { questId, reward: quest.reward }
    )

    completed.push(questId)
    return { completed, reward: quest.reward }
  }
}

export const tgeQuestService = new TGEQuestService()

if (process.env.NODE_ENV !== 'test') {
  ;(async () => {
    await tgeQuestService.seedDefaultQuests()
  })().catch(console.error)
}
