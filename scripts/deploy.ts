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

  // Save addresses to file
  const addresses = {
    tgequest: await tgequest.getAddress(),
    workshopFactory: await workshopFactory.getAddress(),
    specialization: await specialization.getAddress(),
    stakingAmulet: await stakingAmulet.getAddress(),
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