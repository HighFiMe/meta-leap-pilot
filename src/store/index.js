import Vue from "vue";
import Vuex from "vuex";
import Moralis from "../plugins/moralis";
import walletModule from "./wallet.js";
import Web3 from "web3";
import {
  createClient,
  dedupExchange,
  cacheExchange,
  fetchExchange,
} from "urql";
import axios from "axios";
import {convertNFTListToMap, getNFTDictOperations} from "./utils.js";

Vue.use(Vuex);

let sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getImageFromOpenseaAssetData({ collectionAddress, collectionTokenId, tokenUri }) {
  try{
    var opensea_url =
      "https://testnets-api.opensea.io/api/v1/asset/TOKEN_ADDRESS/TOKEN_ID";
    opensea_url = opensea_url.replace("TOKEN_ADDRESS", collectionAddress);
    opensea_url = opensea_url.replace("TOKEN_ID", collectionTokenId);
    var res = await axios.get(opensea_url);
    if (res.data.image_preview_url == null) {
      return tokenUri
    }
    return res.data.image_preview_url;
  } catch {
    return tokenUri
  }
}

const myNftAbi = require("../../contracts/abi/myNftAbi.json");
const rentalProtAbi = require("../../contracts/abi/rentingProtAbi.json");

const APIURL = "https://api.thegraph.com/subgraphs/name/lazycoder1/graph";

//const add ="0x0b3074cd5891526420d493b13439f3d4b8be6144"
const tokensQuery = `
  query {
  nfts(where: {KEY: "VALUE"}) {
    leapTokenId
    collectionAddress
    collectionTokenId
    tokenURI
    manager
    owner 
    user
    name 
    symbol
  }
}
`;
const client = createClient({
  url: APIURL,
  exchanges: [dedupExchange, cacheExchange, fetchExchange],
  requestPolicy: "network-only",
});

export default new Vuex.Store({
  modules: {
    walletModule,
  },
  state: {
    NFTData: {
      myNFTs: [],
      wrappedNFTs: {},
      managedNFTs: {},
      playerAccess: {},
    },
    wrappingProtocol: "0x7228278aA8E50eB3f82559AcCd36C37eF74a8704",
    loadList: {
      myNFTs: false,
      wrappedNFTs: false,
      managedNFTs: false,
      playerAccess: false,
    },
  },
  getters: {},
  mutations: {
    setLoadingStates(state, data){
      switch (data.loadingType) {
        case 'myNFTs':
          state.loadList.myNFTs = data.isLoading;
          break;
        case 'wrappedNFTs':
          state.loadList.wrappedNFTs = data.isLoading;
          break;
        case 'managedNFTs':
          state.loadList.managedNFTs = data.isLoading;
          break;
        case 'playerAccess':
          state.loadList.playerAccess = data.isLoading;
          break;
        default:
          console.log(`Loading screen error change `);
          break;
      }
    },
    addNftToNftData(state, data) {
      Vue.set(state.NFTData[data.type], data.key, data.nft);
    },
    removeNftFromNftData(state, data) {
      Vue.delete(state.NFTData[data.type], data.key);
    },

    setNftListInAddress(state, data) {

      state.NFTData.myNFTs = data;
      state.loadList.myNFTs = true;
    },
    setDataList_ManagedNFTs(state, data) {
      state.NFTData.managedNFTs = data;
      state.loadList.managedNFTs = true;
    },
    setDataList_PlayerAccess(state, data) {
      state.NFTData.playerAccess = data;
      state.loadList.playerAccess = true;
    },
  },
  actions: {
    async getData({ state, commit }, { component }) {
      var address = state.walletModule.account;
      if (address == "" || address == null) return;

      if (component === "WrappedNFTs") {
        
        var wrapped_nfts = tokensQuery.replace("KEY", "owner");
        wrapped_nfts = wrapped_nfts.replace("VALUE", address);
        var dataWrappedNFTs = await client.query(wrapped_nfts).toPromise();
        var wrappedNFTDict = convertNFTListToMap(dataWrappedNFTs.data.nfts);
        await this.dispatch("commitNFTData",
          {incomingDict:wrappedNFTDict, currentDict:state.NFTData.wrappedNFTs, type: 'wrappedNFTs'});
        commit("setLoadingStates", {loadingType: 'wrappedNFTs', setLoading: true})
        
      } else if (component === "ManagedNFTs") {
        
        var managed_nfts = tokensQuery.replace("KEY", "manager");
        managed_nfts = managed_nfts.replace("VALUE", address);
        var dataManagedNFTs = await client.query(managed_nfts).toPromise();
        var managedNFTDicts = convertNFTListToMap(dataManagedNFTs.data.nfts);
        await this.dispatch("commitNFTData",
          {incomingDict:managedNFTDicts, currentDict:state.NFTData.managedNFTs, type: 'managedNFTs'});
        commit("setLoadingStates", {loadingType: 'managedNFTs', setLoading: true})
      } else if (component === "PlayerAccess") {
        
        var player_access = tokensQuery.replace("KEY", "user");
        player_access = player_access.replace("VALUE", address);
        var dataPlayerAccess = await client.query(player_access).toPromise();
        var playerAccessDict = convertNFTListToMap(dataPlayerAccess.data.nfts);
        await this.dispatch("commitNFTData",
          {incomingDict:playerAccessDict, currentDict:state.NFTData.playerAccess, type: 'playerAccess'});
        commit("setLoadingStates", {loadingType: 'playerAccess', setLoading: true})
      }
    },


    async commitNFTData({commit}, {incomingDict, currentDict, type}) {
      var operations = getNFTDictOperations(incomingDict, currentDict);
      let key = 0;
      for (let index in operations.insert) {
        key = operations.insert[index];
        if (!(incomingDict[key]['tokenURI'].includes('googleusercontent'))) {
          console.log('requests made');
          incomingDict[key]['image'] = await getImageFromOpenseaAssetData(
            {
              collectionAddress: incomingDict[key]['collectionAddress'], 
              collectionTokenId: incomingDict[key]['collectionTokenId'], 
              tokenUri: incomingDict[key]['tokenUri']
            });
           await sleep(1000);
        }else{
          incomingDict[key]['image'] = incomingDict[key]['tokenURI'];
        }
        commit("addNftToNftData", {nft:incomingDict[key], type, key})
      }
      for (let index in operations.delete) {
        key = operations.delete[index];
        commit("removeNftFromNftData", {type, key})
      }
    },

    async getNFTsInAddress({ commit, state }) {
      const address = state.walletModule.account;

      if (address == "" || address == null) return;
      const options = { chain: "rinkeby", address: address };
      const nftsInAddress = await Moralis.Web3API.account.getNFTs(options);

      commit("setNftListInAddress", nftsInAddress["result"]);
      return nftsInAddress;
    },

    async refreshData() {
      this.dispatch("getNFTsInAddress");
      await this.dispatch("getData", { component: "WrappedNFTs" });
      await sleep(1000);
      console.log('here');
      await this.dispatch("getData", { component: "ManagedNFTs" });
      await sleep(1000);
      console.log('here');
      await this.dispatch("getData", { component: "PlayerAccess" });
    },

    async getNFTContract({ state }, nftAddress) {
      try {
        var nftAddressChecksum = Web3.utils.toChecksumAddress(nftAddress);
        var nftContract = new state.walletModule.web3.eth.Contract(
          myNftAbi,
          nftAddressChecksum
        );
        return nftContract;
      } catch (error) {
        console.log(error);
        console.log("connected contract not found");
        return null;
      }
    },

    async getWrapNFTContract({ state }) {
      try {
        var rentProtocolChecksum = Web3.utils.toChecksumAddress(
          state.wrappingProtocol
        );
        var rentProtContract = new state.walletModule.web3.eth.Contract(
          rentalProtAbi,
          rentProtocolChecksum
        );
        return rentProtContract;
      } catch (error) {
        console.log(error);
        return null;
      }
    },

    async wrapNFT({ state }, wrapDetails) {
      try {
        var nftContract = await this.dispatch(
          "getNFTContract",
          wrapDetails.nftAddress
        );
        await nftContract.methods
          .safeTransferFrom(
            wrapDetails.from,
            state.wrappingProtocol,
            wrapDetails.tokenId
          )
          .send({
            from: state.walletModule.account,
          });
      } catch (error) {
        console.log(error);
        return null;
      }
    },

    async unwrapNFT({ state }, { collectionAddress, collectionTokenId }) {
      try {
        var rentProtContract = await this.dispatch("getWrapNFTContract");
        await rentProtContract.methods
          .withdraw(collectionAddress, collectionTokenId)
          .send({
            from: state.walletModule.account,
          });
      } catch (error) {
        console.log(error);
        return null;
      }
    },

    async assignApprover({ state }, approveDetails) {
      try {
        var rentProtContract = await this.dispatch("getWrapNFTContract");
        await rentProtContract.methods
          .approve(approveDetails.to, approveDetails.tokenId)
          .send({
            from: state.walletModule.account,
          });
      } catch (error) {
        console.log(error);
        return null;
      }
    },

    async transfer({ state }, transferNFTDetails) {
      try {
        console.log(transferNFTDetails);
        var rentProtContract = await this.dispatch("getWrapNFTContract");
        console.log(state.walletModule.account);
        await rentProtContract.methods
          .safeTransferFrom(
            transferNFTDetails.from,
            transferNFTDetails.to,
            transferNFTDetails.tokenId
          )
          .send({
            from: state.walletModule.account,
          });
      } catch (error) {
        console.log("error");
        console.log(error);
        return null;
      }
    },
  },
});
