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
    address[] public customers; // list of customers addresses

    event Granted(address indexed customer, uint tokenId, uint date);
    event Revoked(address indexed customer, uint tokenId, uint date);
    event Removed(address indexed customer, uint tokenId, uint date);
    event Paid(address indexed customer, uint amount, uint date);

    constructor(address tokenAddress, address nftAddress) Ownable(msg.sender) {
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

        emit Removed(customer, tokenId, block.timestamp);
    }

    function pay(address customer) external onlyOwner {
        bool thirtyDaysHavePassed = payments[customer].nextPayment <=
            block.timestamp;
        bool isFirstPayment = payments[customer].nextPayment == 0;
        bool hasAmount = acceptedToken.balanceOf(customer) >= monthlyAmount;
        bool hasAllowance = acceptedToken.allowance(customer, address(this)) >=
            monthlyAmount;

        bool haveToPay = thirtyDaysHavePassed || isFirstPayment;
        bool isAbleToPay = hasAmount && hasAllowance;

        if (haveToPay && !isAbleToPay) {
            if (!isFirstPayment) {
                nftCollection.safeTransferFrom(
                    customer,
                    address(this),
                    payments[customer].tokenId
                );
                emit Revoked(
                    customer,
                    payments[customer].tokenId,
                    block.timestamp
                );
            } else {
                revert("You do not have enough amount or allowance to pay");
            }
        }

        if (isFirstPayment) {
            nftCollection.mint(customer);
            payments[customer].tokenId = nftCollection.getLastTokenId();
            payments[customer].index = customers.length;
            customers.push(customer);

            emit Granted(customer, payments[customer].tokenId, block.timestamp);
        }

        if (haveToPay) {
            acceptedToken.transferFrom(customer, address(this), monthlyAmount);
            payments[customer].nextPayment =
                block.timestamp +
                thirtyDaysInSeconds;

            emit Paid(customer, monthlyAmount, block.timestamp);

            address currentNftOwner = nftCollection.ownerOf(
                payments[customer].tokenId
            );

            if (currentNftOwner != customer) {
                nftCollection.safeTransferFrom(
                    address(this),
                    customer,
                    payments[customer].tokenId
                );
                emit Granted(
                    customer,
                    payments[customer].tokenId,
                    block.timestamp
                );
            }

            payments[customer].nextPayment += thirtyDaysInSeconds;
            emit Paid(customer, monthlyAmount, block.timestamp);
        }
    }
}
