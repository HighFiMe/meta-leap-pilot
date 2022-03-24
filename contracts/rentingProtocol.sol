// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol"; 
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";


/**
 * @title Owner
 * @dev Set & change owner
 */
contract RentingProt is ERC721Holder, ERC721URIStorage, Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(address => mapping(address => mapping(uint256 => uint256))) public nftStorageTracker;
    mapping(uint256 => address) public ownerMap; 


    event Deposited(address nftContract, address from, uint256 tokenId, bytes data);
    event Withdraw(address nftContract, address from, uint256 tokenId);

    constructor () ERC721("WrappedNFT", "wNFT")  { }

    // to support receiving ETH by default
    receive() external payable {}
    fallback() external payable {}

    function onERC721Received(address operator,
        address from,
        uint256 tokenId,
        bytes memory data) public override returns (bytes4) {
            emit Deposited(msg.sender, from, tokenId, data);
            uint256 newTokenId = mintWrappedNFT(msg.sender, from, tokenId);
            nftStorageTracker[msg.sender][from][tokenId] = newTokenId;
            ownerMap[newTokenId] = from;
            return this.onERC721Received.selector;
    }

    function withdraw(address nftContract, uint256 tokenId) public {
        require(nftStorageTracker[nftContract][msg.sender][tokenId] != 0, "Sender did not deposit the NFT");
        ERC721(nftContract).transferFrom(address(this),
            msg.sender,
            tokenId);
        _burn(nftStorageTracker[nftContract][msg.sender][tokenId]);
        ownerMap[tokenId] = address(0);
        nftStorageTracker[nftContract][msg.sender][tokenId] = 0;
        
        emit Withdraw(nftContract, msg.sender, tokenId);
    }

    function mintWrappedNFT(address nftContract, address from, uint256 tokenId) internal returns(uint256){
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        
        _mint(from, newItemId);
        _setTokenURI(newItemId, ERC721(nftContract).tokenURI(tokenId));

        return newItemId;
    }

    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOriginalOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");

        _transfer(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override {
        require(_isApprovedOrOriginalOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        _safeTransfer(from, to, tokenId, _data);
    }

    /**
     * @dev Returns whether `spender` is allowed to manage `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _isApprovedOrOriginalOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        address owner = ownerMap[tokenId];
        return (spender == owner || isApprovedForAll(owner, spender) || getApproved(tokenId) == spender);
    }
    
    /**
     * @dev See {IERC721-approve}.
     */
    function approve(address to, uint256 tokenId) public override {
        address owner = ownerMap[tokenId];
        require(to != owner, "ERC721: approval to current owner");

        require(
            _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
            "ERC721: approve caller is not owner nor approved for all"
        );

        _approve(to, tokenId);
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function setApprovalForAll(address operator, bool approved) public override {
        _setApprovalForAll(_msgSender(), operator, approved);
    }
}