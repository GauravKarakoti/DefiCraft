import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { EthereumClient } from '@web3modal/ethereum'
import { mainnet } from 'wagmi/chains'
import type { Chain } from 'viem'

export const projectId = process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID ?? ''

const metadata = {
  name: 'DeFiCraft',
  description: 'DeFiCraft Game',
  url: 'https://defi-craft.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Define NERO Chain
const nero: Chain = {
  id: 689, 
  name: 'NERO Testnet',
  nativeCurrency: {
    name: 'NERO',
    symbol: 'NERO',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.nerochain.io'] },
    public: { http: ['https://rpc-testnet.nerochain.io'] },
  },
  blockExplorers: {
    default: { 
      name: 'NERO Explorer', 
      url: 'https://testnet.neroscan.io/' 
    },
  },
  testnet: true
}

// FIX: Create chains as readonly tuple
const chains = [nero, mainnet] as const;

// Create wagmiConfig with fixed chains type
export const wagmiConfig = defaultWagmiConfig({ 
  chains,  // Now matches readonly tuple type
  projectId, 
  metadata
})

// Create Ethereum client
export const ethereumClient = new EthereumClient(wagmiConfig, [...chains])

// Create Web3Modal configuration
createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#4361ee',
    '--w3m-border-radius-master': '8px'
  }
})