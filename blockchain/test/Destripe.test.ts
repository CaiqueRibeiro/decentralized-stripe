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
    const { destripe, destripeCoin, otherAccount } = await loadFixture(deployFixture);

    const instance = destripeCoin.connect(otherAccount);
    await instance.approve(destripe.getAddress(), ethers.parseEther("0.01"));
    await expect(destripe.pay(otherAccount.getAddress())).to.emit(destripe, "Granted");
  });

  it("Should NOT do first payment", async function () {
    const { destripe, destripeCoin, otherAccount } = await loadFixture(deployFixture);

    const instance = destripeCoin.connect(otherAccount);
    await expect(destripe.pay(otherAccount.getAddress())).to.be.revertedWith("You do not have enough amount or allowance to pay");
  });

  it("Should do second payment", async function () {
    const { destripe, destripeCoin, otherAccount } = await loadFixture(deployFixture);

    const instance = destripeCoin.connect(otherAccount);
    await instance.approve(destripe.getAddress(), ethers.parseEther("0.01"));

    await destripe.pay(otherAccount.getAddress());

    await time.increase(31 * 24 * 60 * 60); // advances blockchain in 31 days

    await expect(destripe.pay(otherAccount.getAddress())).to.emit(destripe, "Paid");
  });

  it("Should NOT do second payment", async function () {
    const { destripe, destripeCoin, otherAccount } = await loadFixture(deployFixture);

    const instance = destripeCoin.connect(otherAccount);
    await instance.approve(destripe.getAddress(), ethers.parseEther("0.01"));

    await destripe.pay(otherAccount.getAddress());

    await time.increase(31 * 24 * 60 * 60); // advances blockchain in 31 days

    await instance.approve(destripe.getAddress(), ethers.parseEther("0.000001")); // small approval to not be allowed to pay

    await expect(destripe.pay(otherAccount.getAddress())).to.emit(destripe, "Revoked");
  });

  it("Should do second payment after revoke", async function () {
    const { destripe, destripeCoin, otherAccount } = await loadFixture(deployFixture);

    const instance = destripeCoin.connect(otherAccount);
    await instance.approve(destripe.getAddress(), ethers.parseEther("0.01"));

    await destripe.pay(otherAccount.getAddress());

    await time.increase(31 * 24 * 60 * 60); // advances blockchain in 31 days

    await instance.approve(destripe.getAddress(), ethers.parseEther("0.000001")); // small approval to not be allowed to pay

    await destripe.pay(otherAccount.getAddress()); // unable to pay, so access is revoked

    await instance.approve(destripe.getAddress(), ethers.parseEther("1"));
    await expect(destripe.pay(otherAccount.getAddress())).to.emit(destripe, "Granted");
  });
});
