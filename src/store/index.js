import Vue from "vue";
import Vuex from "vuex";
import Moralis from "../plugins/moralis";
import walletModule from "./wallet.js";
import Web3 from "web3";
import { createClient, dedupExchange, cacheExchange, fetchExchange } from "urql";

Vue.use(Vuex);

const myNftAbi = require("../../contracts/abi/myNftAbi.json");
const rentalProtAbi = require("../../contracts/abi/rentingProtAbi.json");

const APIURL = "https://api.thegraph.com/subgraphs/name/lazycoder1/graph";

//const add ="0x0b3074cd5891526420d493b13439f3d4b8be6144"
const tokensQuery = `
  query {
  nfts(where: {KEY: "VALUE"}) {
    id
    tokenId
    tokenURI
    approved
    owner 
    user
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
    dataList_MyNFTs: [],
    wrappingProtocol: "0x7228278aA8E50eB3f82559AcCd36C37eF74a8704",
    dataList_WrappedNFTs: {},
    dataList_ManagedNFTs: {},
    dataList_PlayerAccess: {},
  },
  getters: {},
  mutations: {
    setNftListInAddress(state, data) {
      state.dataList_MyNFTs = data;
    },
    setDataList_WrappedNFTs(state, data) {
      state.dataList_WrappedNFTs = data;
    },
    setDataList_ManagedNFTs(state, data) {
      state.dataList_ManagedNFTs = data;
    },
    setDataList_PlayerAccess(state, data) {
      state.dataList_PlayerAccess = data;
    },
  },
  actions: {
    async getData({ state, commit }, { component }) {
      var address = state.walletModule.account;
      if (address == "" || address == null) return;

      if (component === "WrappedNFTs") {
        console.log("here wrpped");
        var wrapped_nfts = tokensQuery.replace("KEY", "owner");
        wrapped_nfts = wrapped_nfts.replace("VALUE", address);
        var dataWrappedNFTs = await client.query(wrapped_nfts).toPromise();

        commit("setDataList_WrappedNFTs", dataWrappedNFTs.data);
        return dataWrappedNFTs;
      } else if (component === "ManagedNFTs") {
        console.log("here managed");
        var managed_nfts = tokensQuery.replace("KEY", "approved");
        managed_nfts = managed_nfts.replace("VALUE", address);
        var dataManagedNFTs = await client.query(managed_nfts).toPromise();

        commit("setDataList_ManagedNFTs", dataManagedNFTs.data);
        return dataManagedNFTs;
      } else if (component === "PlayerAccess") {
        console.log("player managed");
        var player_access = tokensQuery.replace("KEY", "user");
        player_access = player_access.replace("VALUE", address);
        var dataPlayerAccess = await client.query(player_access).toPromise();

        commit("setDataList_PlayerAccess", dataPlayerAccess.data);
        return dataPlayerAccess;
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
      await this.dispatch("getData", { component: "ManagedNFTs" });
      await this.dispatch("getData", { component: "PlayerAccess" });
    },

    async getNFTContract({ state }, nftAddress) {
      try {
        var nftAddressChecksum = Web3.utils.toChecksumAddress(nftAddress);
        var nftContract = new state.walletModule.web3.eth.Contract(myNftAbi, nftAddressChecksum);
        return nftContract;
      } catch (error) {
        console.log(error);
        console.log("connected contract not found");
        return null;
      }
    },

    async getWrapNFTContract({ state }) {
      try {
        var rentProtocolChecksum = Web3.utils.toChecksumAddress(state.wrappingProtocol);
        var rentProtContract = new state.walletModule.web3.eth.Contract(rentalProtAbi, rentProtocolChecksum);
        return rentProtContract;
      } catch (error) {
        console.log(error);
        return null;
      }
    },

    async wrapNFT({ state }, wrapDetails) {
      try {
        var nftContract = await this.dispatch("getNFTContract", wrapDetails.nftAddress);
        await nftContract.methods.safeTransferFrom(wrapDetails.from, state.wrappingProtocol, wrapDetails.tokenId).send({
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
        await rentProtContract.methods.approve(approveDetails.to, approveDetails.tokenId).send({
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
          .safeTransferFrom(transferNFTDetails.from, transferNFTDetails.to, transferNFTDetails.tokenId)
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
