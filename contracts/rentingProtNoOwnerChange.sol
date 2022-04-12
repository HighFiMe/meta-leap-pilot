// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol"; 
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


/**
 * @title Owner
 * @dev Set & change owner
 */
contract RentingProtNoOwnerChange is ERC721Holder, ERC721URIStorage {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(address => mapping(address => mapping(uint256 => uint256))) public nftStorageTracker;
    mapping(uint256 => address) public playerMap;
    mapping(uint256 => address) public playerManager; 


    event Deposited(address nftContract, address from, uint256 oldtokenId, uint256 newTokenId, bytes data);
    event Withdraw(address nftContract, address from, uint256 tokenId, uint256 burnedTokenId);
    event NewPlayerManager(uint256 tokenId, address manager);
    event NewPlayer(uint256 tokenId, address manager);

    constructor () ERC721("WrappedNFT", "wNFT")  { }

    // to support receiving ETH by default
    receive() external payable {}
    fallback() external payable {}

    function onERC721Received(address operator,
        address from,
        uint256 tokenId,
        bytes memory data) public override returns (bytes4) {
            
            uint256 newTokenId = mintWrappedNFT(msg.sender, from, tokenId);
            nftStorageTracker[msg.sender][from][tokenId] = newTokenId;
            emit Deposited(msg.sender, from, tokenId, newTokenId, data);
            playerMap[newTokenId] = from;
            return this.onERC721Received.selector;
    }

    function withdraw(address nftContract, uint256 tokenId) public {
        require(nftStorageTracker[nftContract][msg.sender][tokenId] != 0, "Sender did not deposit the NFT");
        emit Withdraw(nftContract, msg.sender, tokenId, nftStorageTracker[nftContract][msg.sender][tokenId]);
        ERC721(nftContract).transferFrom(address(this),
            msg.sender,
            tokenId);
        _burn(nftStorageTracker[nftContract][msg.sender][tokenId]);

        playerMap[tokenId] = address(0);
        nftStorageTracker[nftContract][msg.sender][tokenId] = 0;
        
    }

    function mintWrappedNFT(address nftContract, address from, uint256 tokenId) internal returns(uint256){
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        
        _mint(from, newItemId);
        _setTokenURI(newItemId, ERC721(nftContract).tokenURI(tokenId));

        return newItemId;
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    // function setApprovalForAll(address operator, bool approved) public virtual override {
    //     _setApprovalForAll(_msgSender(), operator, approved);
    // }

    function setPlayerManager(uint256 tokenId, address manager) external {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        playerManager[tokenId] = manager;
        emit NewPlayerManager(tokenId, manager);
    }

    function getPlayerManager(uint256 tokenId) public view returns(address){
        return playerManager[tokenId];
    }

    function setPlayer(uint256 tokenId, address player) external {
        require(_isManagerOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        playerMap[tokenId] = player;
        emit NewPlayer(tokenId,  player);
    }

    function _isManagerOrOwner(address spender, uint256 tokenId) internal returns(bool){
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        address owner = ERC721.ownerOf(tokenId);
        return (spender == owner || getPlayerManager(tokenId) == spender);
    }

    function getPlayer(uint256 tokenId) public view returns(address){
        return playerMap[tokenId];
    }


}