import { expect } from "chai";
import { ethers } from "hardhat";
import { WorkshopFactory } from "../typechain-types";

describe("WorkshopFactory", function () {
  let workshopFactory: WorkshopFactory;
  let owner: any, player1: any, player2: any;

  before(async () => {
    [owner, player1, player2] = await ethers.getSigners();
    
    const WorkshopFactory = await ethers.getContractFactory("WorkshopFactory");
    workshopFactory = await WorkshopFactory.deploy();
    await workshopFactory.waitForDeployment();
  });

  it("Should mint a new workshop", async () => {
    const tx = await workshopFactory.connect(player1).mintWorkshop("Basic Workshop");
    await tx.wait();
    
    const workshopCount = await workshopFactory.balanceOf(player1.address);
    expect(workshopCount).to.equal(1);
  });

  it("Should set player level", async () => {
    await workshopFactory.setPlayerLevel(player1.address, 3);
    const level = await workshopFactory.playerLevel(player1.address);
    expect(level).to.equal(3);
  });

  it("Should prevent non-owner from setting levels", async () => {
    await expect(
      workshopFactory.connect(player2).setPlayerLevel(player1.address, 5)
    ).to.be.revertedWith("Not owner");
  });

  it("Should retrieve workshop details", async () => {
    const workshopId = 0;
    const workshopType = await workshopFactory.workshopTypes(workshopId);
    const ownerAddress = await workshopFactory.ownerOf(workshopId);
    
    expect(workshopType).to.equal("Basic Workshop");
    expect(ownerAddress).to.equal(player1.address);
  });
});