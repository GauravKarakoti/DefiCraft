const { ethers } = require('ethers');
const WorkshopFactoryArtifact = require('../../contracts/abi/WorkshopFactory.json');
const WorkshopFactoryABI = WorkshopFactoryArtifact.abi;
const dotenv = require('dotenv');
dotenv.config();

class WorkshopFactoryService {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(process.env.NERO_RPC_URL);
        this.wallet = new ethers.Wallet(process.env.OPERATOR_PRIVATE_KEY, this.provider);
        this.contract = new ethers.Contract(
            process.env.WORKSHOP_FACTORY_ADDRESS,
            WorkshopFactoryABI,
            this.wallet
        );
    }

    // Mint a new workshop for a player
    async mintWorkshop(playerAddress, workshopType) {
        try {
            const tx = await this.contract.mintWorkshop(playerAddress, workshopType);
            await tx.wait();
            return { success: true, txHash: tx.hash };
        } catch (error) {
            console.error('Error minting workshop:', error);
            return { success: false, error: error.message };
        }
    }

    // Set player level (admin function)
    async setPlayerLevel(playerAddress, level) {
        try {
            const tx = await this.contract.setPlayerLevel(playerAddress, level);
            await tx.wait();
            return { success: true, txHash: tx.hash };
        } catch (error) {
            console.error('Error setting player level:', error);
            return { success: false, error: error.message };
        }
    }

    // Get workshop details
    async getWorkshopDetails(tokenId) {
        try {
            const workshopType = await this.contract.workshopTypes(tokenId);
            const owner = await this.contract.ownerOf(tokenId);
            return { 
                tokenId, 
                workshopType, 
                owner,
                exists: true
            };
        } catch (error) {
            console.error('Error fetching workshop details:', error);
            return { exists: false };
        }
    }

    // Get player's workshop count
    async getPlayerWorkshopCount(playerAddress) {
        try {
            const balance = await this.contract.balanceOf(playerAddress);
            return parseInt(balance);
        } catch (error) {
            console.error('Error getting workshop count:', error);
            return 0;
        }
    }

    // Get player level
    async getPlayerLevel(playerAddress) {
        try {
            const level = await this.contract.playerLevel(playerAddress);
            return parseInt(level);
        } catch (error) {
            console.error('Error getting player level:', error);
            return 0;
        }
    }

    // Get all workshops owned by a player
    async getPlayerWorkshops(playerAddress) {
        try {
            const count = await this.getPlayerWorkshopCount(playerAddress);
            const workshops = [];
            
            for (let i = 0; i < count; i++) {
                const tokenId = await this.contract.tokenOfOwnerByIndex(playerAddress, i);
                const details = await this.getWorkshopDetails(tokenId);
                workshops.push(details);
            }
            
            return workshops;
        } catch (error) {
            console.error('Error getting player workshops:', error);
            return [];
        }
    }

    // Get all workshop types
    async getWorkshopTypes() {
        // This would be expanded later
        return ['Basic', 'Advanced', 'Elite'];
    }
}

module.exports = new WorkshopFactoryService();