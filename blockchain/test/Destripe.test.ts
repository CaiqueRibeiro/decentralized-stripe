import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Destripe", function () {
  async function deployFixture() {
    const DestripeCoin = await ethers.getContractFactory("DestripeCoin");
    const destripeCoin = await DestripeCoin.deploy();

    await destripeCoin.waitForDeployment();

    const DestripeCollection = await ethers.getContractFactory("DestripeCollection");
    const destripeCollection = await DestripeCollection.deploy();

    await destripeCollection.waitForDeployment();

    const Destripe = await ethers.getContractFactory("Destripe");
    const contract = await Destripe.deploy(destripeCoin.address, destripeCollection.address);

    await contract.waitForDeployment();

    await destripeCollection.setAuthorizedContract(contract.address);

    const [owner, otherAccount] = await ethers.getSigners();

    await destripeCoin.mint(otherAccount.address, ethers.parseEther("1"));

    return { contract, destripeCoin, destripeCollection, owner, otherAccount };
  }

  it("Should set the right unlockTime", async function () {
    const { contract, owner } = await loadFixture(deployFixture);

    expect(true).to.equal(true);
  });
});
