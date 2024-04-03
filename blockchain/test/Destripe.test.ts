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
    const destripe = await Destripe.deploy(destripeCoin.getAddress(), destripeCollection.getAddress());

    await destripe.waitForDeployment();

    await destripeCollection.setAuthorizedContract(destripe.getAddress());

    const [owner, otherAccount] = await ethers.getSigners();

    await destripeCoin.mint(otherAccount.address, ethers.parseEther("1"));

    return { destripe, destripeCoin, destripeCollection, owner, otherAccount };
  }

  it("Should do first payment", async function () {
    const { destripe, destripeCoin, destripeCollection, owner, otherAccount } = await loadFixture(deployFixture);

    const instance = destripeCoin.connect(otherAccount);
    await instance.approve(destripe.getAddress(), ethers.parseEther("0.01"));
    await expect(destripe.pay(otherAccount.getAddress())).to.emit(destripe, "Granted");
  });
});
