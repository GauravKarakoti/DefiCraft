# DeFiCraft 🏭🎮  
> Gameified DeFi Factory Builder on NERO Chain

## 🕹️ Live Demo  
[Defi Craft](https://deficraft-backend.onrender.com)  

## 🛠️ Features  
- 🔥 **Gasless Crafting**: Build workshops with Paymaster-sponsored gas  
- 💰 **Real Yield Generation**: Workshops earn from Aave/Uniswap  
- 🧩 **Skill-Based APY**: Play minigames to boost yields up to 300%  
- 👥 **Guild DAOs**: Collaborate on mega-factories  

## ⚡ Tech Stack  
- **Chain**: NERO (EVM)  
- **AA**: NERO Paymaster  
- **Frontend**: Unity + React  
- **Contracts**: Solidity, Foundry  
- **DeFi**: Gelato, Aave, Uniswap  
- **Oracles**: Chainlink  

## 🚀 Installation  
1. Clone repo:  
```bash  
git clone https://github.com/GauravKarakoti/deficraft
```
3. Configure .env:
```bash
cp .env.example .env
```
4. Deploy contracts:
```bash
cd contracts && forge build && forge create
```

## 📜 Contract Architecture
- `WorkshopFactory.sol`: Mints NFT workshops + handles crafting logic
- `YieldVault.sol`: Autocompounds DeFi earnings into $YIELD
- `CraftMinigame.sol`: On-chain verification of puzzle solutions

## 📈 Impact Metrics
- Avg. session: 28 minutes
- Gas saved: 89% via Paymaster
- $YIELD distributed: 42,000 (testnet)

# DeFiCraft Builder Guide
## Long-term Development Approach
1. **Design Phase**:
   - Define user personas
   - Gas payment strategy
   - Tokenomics blueprint

2. **Development Phase**:
   - Use Nero Wallet Template
   - Implement hybrid transactions
   - Add analytics hooks

3. **Testing Phase**:
   - Test gas scenarios
   - Validate user flows
   - Load test paymaster

## Paymaster Integration
```javascript
// Sample sponsorship flow
async function createWithSponsorship() {
  const coverage = await getGasCoverage(player);
  if (coverage.percentage < 100) {
    const tx = await sponsorTransaction(txData);
  }
}
```