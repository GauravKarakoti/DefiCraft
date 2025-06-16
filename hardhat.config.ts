import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    nero: {
      url: "https://rpc-testnet.nerochain.io",
      chainId: 689,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.NERO_EXPLORER_API_KEY ?? "", 
    customChains: [
      {
        network: "nero",
        chainId: 689,
        urls: {
          apiURL: "https://api-testnet.neroscan.io/api",
          browserURL: "https://testnet.neroscan.io/"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: "NERO",
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6"
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default config;