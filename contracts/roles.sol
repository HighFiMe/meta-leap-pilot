pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; 
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract Roles {

  struct roles {
    address player;
    address breeder;
  }
  ERC721 public collection;
  mapping(uint256 => mapping(string => address)) public  _roleApprovals;
  mapping(uint256 => roles) public _tokenRoles; 

  event roleChangeApproved(uint256 tokenId, string role, address newApproved);
  event roleModified(uint256 tokenId, string role, address roleUser);

  
  constructor(address collectionAddress)  {
    collection = ERC721(collectionAddress);
  }

  // to support receiving ETH by default
  receive() external payable {}
  fallback() external payable {}

  function ownerOrApproved(address caller, uint256 tokenId, string memory role) public view returns(bool) {
    bool isOwnerOrApproved = false;
    if (collection.ownerOf(tokenId) == caller) {
      isOwnerOrApproved = true;
    }
    else if (_roleApprovals[tokenId][role] == caller) {
      isOwnerOrApproved = true;
    }
    return isOwnerOrApproved;
  }

  function modifyRole(string memory role, address roleUser, uint256 tokenId) public {
    bool allowedToModify = ownerOrApproved(msg.sender, tokenId, role);
    require(allowedToModify, "");
    
    _setRole(tokenId, role, roleUser);
    emit roleModified(tokenId, role, roleUser);
  }

  function returnOwner(uint256 tokenId) public view returns(bool){
    return msg.sender;
  }

  function _setRole(uint256 tokenId, string memory role, address roleUser) internal {
    if (_compareStrings(role, "player")) {
      _tokenRoles[tokenId].player = roleUser;
    }
    if (_compareStrings(role, "breeder")) {
      _tokenRoles[tokenId].breeder = roleUser;
    }
  }

  function _compareStrings(string memory a, string memory b) internal returns (bool) {
    return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
  }

  function approveUserForRole(string memory role, uint256 tokenId, address manager) public {
    require(collection.ownerOf(tokenId) == msg.sender, "Only owner of the token has this access");
    require(manager != collection.ownerOf(tokenId), "ERC721: approval to current owner");
    
    _roleApprovals[tokenId][role] == manager;
    emit roleChangeApproved(tokenId, role, manager);
  }


  function getPlayerRole(uint256 tokenId, string memory role) external view returns(address){
    if (_roleApprovals[tokenId][role] == address(0)) {
      return collection.ownerOf(tokenId);
    }
    return _roleApprovals[tokenId][role];
  }

}
