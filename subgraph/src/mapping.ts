import { BigInt } from "@graphprotocol/graph-ts";
import { store } from "@graphprotocol/graph-ts";
import {
  RentingProt,
  Approval,
  ApprovalForAll,
  Deposited,
  OwnershipTransferred,
  Transfer,
  Withdraw,
} from "../generated/RentingProt/RentingProt";
import { Nft } from "../generated/schema";

export function handleApproval(event: Approval): void {
  let nft = Nft.load(event.params.tokenId.toString());
  if (nft == null) {
    nft = new Nft(event.params.tokenId.toString());
  }

  nft.manager = event.params.approved;
  nft.managerUpdatedAt = event.block.timestamp;
  nft.save();

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.
  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.balanceOf(...)
  // - contract.getApproved(...)
  // - contract.isApprovedForAll(...)
  // - contract.name(...)
  // - contract.nftStorageTracker(...)
  // - contract.onERC721Received(...)
  // - contract.owner(...)
  // - contract.ownerMap(...)
  // - contract.ownerOf(...)
  // - contract.supportsInterface(...)
  // - contract.symbol(...)
  // - contract.tokenURI(...)
}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleDeposited(event: Deposited): void {
  let nft = Nft.load(event.params.newTokenId.toString());
  let contract = RentingProt.bind(event.address);
  if (nft == null) {
    nft = new Nft(event.params.newTokenId.toString());
  }

  nft.leapTokenId = event.params.newTokenId.toString();
  nft.owner = event.params.from;
  nft.collectionTokenId = event.params.oldtokenId.toString();
  nft.collectionAddress = event.params.nftContract;
  nft.tokenURI = contract.tokenURI(event.params.newTokenId);
  nft.name = contract.name();
  nft.symbol = contract.symbol();
  nft.createdAt = event.block.timestamp;

  nft.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleTransfer(event: Transfer): void {
  let nft = Nft.load(event.params.tokenId.toString());
  if (nft == null) {
    nft = new Nft(event.params.tokenId.toString());
  }
  nft.userUpdatedAt = event.block.timestamp;
  nft.user = event.params.to;
  nft.save();
}

export function handleWithdraw(event: Withdraw): void {
  let nft_id = event.params.burnedTokenId.toString();
  let nft = Nft.load(nft_id);

  store.remove("Nft", nft_id);
}
