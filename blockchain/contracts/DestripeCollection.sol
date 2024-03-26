// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DestripeCollection is ERC721, Ownable {
    uint256 private _nextTokenId;
    address public authorizedContract;
    string public baseURI = "http://localhost:3000/nft/";

    constructor(
        address initialOwner
    ) ERC721("DestripeCollection", "DSP") Ownable(initialOwner) {}

    function setAuthorizedContract(
        address newAuthorizedContract
    ) public onlyOwner {
        authorizedContract = newAuthorizedContract;
    }

    function setBaseURI(string calldata newAuthorizedURI) external onlyOwner {
        baseURI = newAuthorizedURI;
    }

    function _baseURI() internal pure override returns (string memory) {
        return baseURI;
    }

    function getLastTokenId() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    function burn(uint256 tokenId) external {
        require(
            msg.sender == authorizedContract || msg.sender == owner(),
            "Only the owner or authorized contract can burn a token"
        );
        _burn(tokenId);
    }

    function tokenURI(
        uint tokenId
    ) external view override(ERC721) returns (string memory) {
        return string.concat(_baseURI(), Strings.toString(tokenId), ".json");
    }

    function setApprovalForAll(
        address operator,
        bool approval
    ) public virtual override(ERC721) onlyOwner {
        _setApprovalForAll(operator, authorizedContract, approved);
    }

    function mint(address customer) external returns (uint256) {
        require(
            msg.sender == authorizedContract || msg.sender == owner(),
            "Only the owner or authorized contract can mint"
        );

        uint256 tokenId = _nextTokenId++;
        _safeMint(customer, tokenId);
        _setApprovalForAll(customer, authorizedContract, true);

        return tokenId;
    }
}
