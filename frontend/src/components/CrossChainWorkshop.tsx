import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

// Define type for chain options
type ChainOptions = {
  [key: string]: string;
};

// Define types for API responses
type ResourceItem = [string, number];
type ChainResources = ResourceItem[];
type ResourcesData = {
  [chain: string]: ChainResources;
};

type ApyData = {
  [chain: string]: number;
};

const CrossChainWorkshop = ({ workshopId }: { workshopId: string }) => {
  const { address } = useAccount();
  const [chains, setChains] = useState<string[]>(['nero']);
  const [resources, setResources] = useState<ResourcesData>({});
  const [apyData, setApyData] = useState<ApyData>({});

  useEffect(() => {
    // Fixed template literal syntax
    fetch(`/api/cross-chain/resources?player=${address}`)
      .then(res => res.json())
      .then(setResources);
      
    fetch(`/api/cross-chain/apy`)
      .then(res => res.json())
      .then(setApyData);
  }, [address]);

  const deployCrossChain = async () => {
    const response = await fetch('/api/cross-chain/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerAddress: address, workshopId, chains })
    });
    
    const result = await response.json();
    console.log('Deployment result:', result);
  };

  // Helper function to safely get chain name
  const getChainName = (chainId: string): string => {
    return CHAIN_OPTIONS[chainId] || chainId;
  };

  return (
    <div className="cross-chain-panel">
      <h3>Multi-Chain Deployment</h3>
      <div className="chain-selector">
        {Object.entries(CHAIN_OPTIONS).map(([id, name]) => (
          <label key={id}>
            <input
              type="checkbox"
              checked={chains.includes(id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setChains([...chains, id]);
                } else {
                  setChains(chains.filter(c => c !== id));
                }
              }}
            />
            {name}
          </label>
        ))}
      </div>
      
      <div className="apy-display">
        <h4>Current APYs</h4>
        {Object.entries(apyData).map(([chain, apy]) => (
          <div key={chain} className="apy-item">
            <span className="chain-name">{getChainName(chain)}</span>
            <span className="apy-value">{apy}%</span>
          </div>
        ))}
      </div>
      
      <button onClick={deployCrossChain} className="cta-button">
        Deploy to {chains.length} Chains
      </button>
      
      <div className="resource-grid">
        {Object.entries(resources).map(([chain, items]) => (
          <div key={chain} className="resource-chain">
            <h4>{getChainName(chain)} Resources</h4>
            <ul>
              {items.map(([name, amount]) => (
                <li key={name}>{name}: {amount}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

// Strongly typed chain options
const CHAIN_OPTIONS: ChainOptions = {
  nero: 'NERO Chain',
  polygon: 'Polygon',
  arbitrum: 'Arbitrum'
};

export default CrossChainWorkshop;
