// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface INFTCollection is IERC721 {
    function setAuthorizedContract(address newAuthorizedContract) external;

    function getLastTokenId() external view returns (uint256);

    function setBaseURI(string calldata newAuthorizedURI) external;

    function burn(uint256 tokenId) external;

    function mint(address customer) external returns (uint256);
}
