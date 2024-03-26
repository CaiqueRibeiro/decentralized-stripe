import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Destripe", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Destripe = await ethers.getContractFactory("Destripe");
    const contract = await Destripe.deploy();

    return { contract, owner, otherAccount };
  }

  it("Should set the right unlockTime", async function () {
    const { contract, owner } = await loadFixture(deployFixture);

    expect(true).to.equal(true);
  });
});
