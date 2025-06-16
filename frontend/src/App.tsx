import './App.css';
import UnityGame from './components/UnityGame';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { Web3Modal } from '@web3modal/react';
import { WagmiConfig } from 'wagmi';
import { ethereumClient, projectId, wagmiConfig } from './config/web3';

function App() {
  return (
    <div className="App">
      <WagmiConfig config={wagmiConfig}>
        <header className="header">
          <h1>DeFiCraft</h1>
          <p>Craft Your Financial Future. Play. Earn. Grow.</p>
        </header>
        
        <main className="game-container">
          <UnityGame />
        </main>
        
        <AnalyticsDashboard />
      </WagmiConfig>
      
      <Web3Modal 
        projectId={projectId} 
        ethereumClient={ethereumClient} 
        themeMode="dark"  // Changed from theme to themeMode
        themeVariables={{
          '--w3m-accent-color': '#4361ee',
          '--w3m-font-family': '"Roboto", sans-serif',
          '--w3m-background-color': '#4361ee',
          '--w3m-z-index': '1000'
        }}
      />
    </div>
  );
}

export default App;