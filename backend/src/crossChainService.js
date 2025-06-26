import { ethers } from 'ethers';

const CHAIN_CONFIG = {
  nero: { id: 689, name: 'NERO', rpc: process.env.NERO_RPC_URL },
  polygon: { id: 137, name: 'Polygon', rpc: process.env.POLYGON_RPC_URL },
  arbitrum: { id: 42161, name: 'Arbitrum', rpc: process.env.ARBITRUM_RPC_URL }
};

export class CrossChainService {
  static async deployWorkshop(playerAddress, workshopId, chains) {
    const validChains = chains.filter(chain => CHAIN_CONFIG[chain]);
    
    // Execute cross-chain deployment
    const results = await Promise.allSettled(
      validChains.map(chain => this.deployOnChain(chain, playerAddress, workshopId))
    );
    
    return {
      success: results.filter(r => r.status === 'fulfilled').map(r => r.value),
      failures: results.filter(r => r.status === 'rejected').map(r => r.reason)
    };
  }
  
  static async deployOnChain(chain, playerAddress, workshopId) {
    const provider = new ethers.JsonRpcProvider(CHAIN_CONFIG[chain].rpc);
    const signer = new ethers.Wallet(process.env.OPERATOR_PRIVATE_KEY, provider);
    
    const contract = new ethers.Contract(
      process.env.CROSS_CHAIN_MANAGER_ADDRESS,
      ['function deployWorkshop(uint256 workshopId, uint256[] calldata chainIds)'],
      signer
    );
    
    const tx = await contract.deployWorkshop(workshopId, Object.values(CHAIN_CONFIG).map(c => c.id));
    await tx.wait();
    
    return { chain, txHash: tx.hash };
  }
  
  static async getCrossChainResources(playerAddress) {
    // Aggregate resources from all chains
    const resources = {};
    
    await Promise.all(
      Object.values(CHAIN_CONFIG).map(async chain => {
        try {
          const provider = new ethers.JsonRpcProvider(chain.rpc);
          const contract = new ethers.Contract(
            process.env.RESOURCE_TRACKER_ADDRESS,
            ['function getResources(address) view returns (tuple(string name, uint256 amount)[])'],
            provider
          );
          
          resources[chain.id] = await contract.getResources(playerAddress);
        } catch (error) {
          console.error(`Error fetching resources on ${chain.name}:`, error);
        }
      })
    );
    
    return resources;
  }
}