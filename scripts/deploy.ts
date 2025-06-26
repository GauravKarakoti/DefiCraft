import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy Craft Token (ERC-20)
  const TGEQuest = await ethers.getContractFactory("TGEQuest");
  const tgequest = await TGEQuest.deploy();
  await tgequest.waitForDeployment();
  console.log("TGEQuest deployed to:", await tgequest.getAddress());

  // Deploy Workshop Factory
  const WorkshopFactory = await ethers.getContractFactory("WorkshopFactory");
  const workshopFactory = await WorkshopFactory.deploy();
  await workshopFactory.waitForDeployment();
  console.log("WorkshopFactory deployed to:", await workshopFactory.getAddress());

  // Deploy Specialization
  const Specialization = await ethers.getContractFactory("Specialization");
  const specialization = await Specialization.deploy();
  await specialization.waitForDeployment();
  console.log("Specialization deployed to:", await specialization.getAddress());

  // Deploy Staking Amulet
  const StakingAmulet = await ethers.getContractFactory("StakingAmulet");
  const stakingAmulet = await StakingAmulet.deploy(await tgequest.getAddress());
  await stakingAmulet.waitForDeployment();
  console.log("StakingAmulet deployed to:", await stakingAmulet.getAddress());

  const CrossChainManager = await ethers.getContractFactory("CrossChainManager");
  const crossChainManagaer = await CrossChainManager.deploy(await workshopFactory.getAddress());
  await crossChainManagaer.waitForDeployment();
  console.log("CrossChainManager deployed to:", await crossChainManagaer.getAddress());

  const DefiCraftDAO = await ethers.getContractFactory("DefiCraftDAO");
  const defiCraftDAO = await DefiCraftDAO.deploy(await tgequest.getAddress());
  await defiCraftDAO.waitForDeployment();
  console.log("DefiCraftDAO deployed to:", await defiCraftDAO.getAddress());

  const InstitutionalNFT = await ethers.getContractFactory("InstitutionalNFT");
  const insitutionalNFT = await InstitutionalNFT.deploy(
    "DeFiCraft Institutional Pass", // name
    "DFC-INST",                     // symbol
    "https://defi-craft.vercel.app/nft-metadata/"
  );
  await insitutionalNFT.waitForDeployment();
  console.log("InstitutionalNFT deployed to:", await insitutionalNFT.getAddress());

  const ResourceTracker = await ethers.getContractFactory("Specialization");
  const resourceTracker = await ResourceTracker.deploy();
  await resourceTracker.waitForDeployment();
  console.log("ResourceTracker deployed to:", await resourceTracker.getAddress());

  // Save addresses to file
  const addresses = {
    tgequest: await tgequest.getAddress(),
    workshopFactory: await workshopFactory.getAddress(),
    specialization: await specialization.getAddress(),
    stakingAmulet: await stakingAmulet.getAddress(),
    crossChainManager: await crossChainManagaer.getAddress(),
    defiCraftDAO: await defiCraftDAO.getAddress(),
    institutionalNFT: await insitutionalNFT.getAddress(),
    resourceTracker: await resourceTracker.getAddress(),
  };

  const addressesPath = path.join(__dirname, "../deployed-addresses.json");
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("Addresses saved to:", addressesPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });