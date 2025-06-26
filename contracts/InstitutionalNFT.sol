// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract InstitutionalNFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    string private _baseTokenURI;
    mapping(uint256 => bool) private _soulboundTokens;

    event SoulboundTokenMinted(address indexed to, uint256 tokenId);
    error SoulboundTokenTransfer();

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        _baseTokenURI = baseURI_;
    }

    function mintInstitutionalNFT(address institution) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(institution, tokenId);
        _soulboundTokens[tokenId] = true;
        emit SoulboundTokenMinted(institution, tokenId);
    }

    function isSoulbound(uint256 tokenId) public view returns (bool) {
        return _soulboundTokens[tokenId];
    }

    // Override transfers to block soulbound tokens
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        if (isSoulbound(tokenId) && auth != address(0)) {
            revert SoulboundTokenTransfer();
        }
        return super._update(to, tokenId, auth);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function updateBaseURI(string memory newBaseURI) public onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    // Disable approvals for soulbound tokens
    function setApprovalForAll(address operator, bool approved) public override {
        if (isSoulbound(_nextTokenId - 1)) {
            revert SoulboundTokenTransfer();
        }
        super.setApprovalForAll(operator, approved);
    }

    function approve(address to, uint256 tokenId) public override {
        if (isSoulbound(tokenId)) {
            revert SoulboundTokenTransfer();
        }
        super.approve(to, tokenId);
    }
}