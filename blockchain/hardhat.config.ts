import dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  defaultNetwork: "local",
  networks: {
    sepolia: {
      url: process.env.INFURA_URL,
      chainId: parseInt(`${process.env.CHAIN_ID}`),
      accounts: {
        mnemonic: process.env.SECRET
      }
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
};

export default config;
