// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./INFTCollection.sol";

contract Destripe is Ownable {
    IERC20 public acceptedToken;
    INFTCollection public nftCollection;

    uint public monthlyAmount = 0.001 ether;
    uint public constant thirtyDaysInSeconds = 24 * 60 * 60 * 30;

    struct Customer {
        uint index;
        uint tokenId;
        uint nextPayment;
    }

    mapping(address => Customer) public payments; // wallet address => payment infos
    address[] public customers // list of customers addresses

    event Granted(address indexed customer, uint date, uint tokenId);
    event Revoked(address indexed customer, uint date, uint tokenId);
    event Removed(address indexed customer, uint date, uint tokenId);
    event Paid(address indexed customer, uint date, uint amount);

    constructor(address tokenAddress, address nftAddress) {
        acceptedToken = IERC20(tokenAddress);
        nftCollection = INFTCollection(nftAddress);
    }

    function setMonthlyAmount(uint newAmount) external onlyOwner {
        monthlyAmount = newAmount;
    }

    function removeCustomer(address customer) external onlyOwner {
        uint tokenId = payments[customer].tokenId;
        nftCollection.burn(tokenId); // deletes NFT and makes user unable to access

        delete customers[payments[customer].index];
        delete payments[customer]; 

        emit Removed(customer, block.timestamp, tokenId);
    }
}
