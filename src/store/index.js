import Vue from "vue";
import Vuex from "vuex";
import Moralis from "../plugins/moralis";
import walletModule from "./wallet.js";
import Web3 from "web3";
import { createClient } from "urql";

Vue.use(Vuex);

const myNftAbi = require("../../contracts/abi/myNftAbi.json");
const rentalProtAbi = require("../../contracts/abi/rentingProtAbi.json");

const APIURL = "https://api.thegraph.com/subgraphs/name/lazycoder1/graph";

const tokensQuery = `
  query {
  nfts(where: {approved: "0x0b3074cd5891526420d493b13439f3d4b8be6144"}) {
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
});

export default new Vuex.Store({
  modules: {
    walletModule,
  },
  state: {
    nftList: {},
    wrappingProtocol: "0x52F759C37328B9333A508271E1f54e8e66e00CB1",
    example: "",
  },
  getters: {},
  mutations: {
    setNftListInAddress(state, { nftList, fundAddress }) {
      Vue.set(state.nftList, fundAddress, nftList);
    },
    setExample(state, example) {
      state.example = example;
    },
  },
  actions: {
    async getData() {
      const data = await client.query(tokensQuery).toPromise();
      console.log(data);
      return data;
    },
    async getNFTsInAddress({ commit }) {
      //const address = this.$store.state.accounnt;
      const address = "0xe95C4707Ecf588dfd8ab3b253e00f45339aC3054";
      const options = { chain: "rinkeby", address: address };
      const nftsInAddress = await Moralis.Web3API.account.getNFTs(options);

      commit("setNftListInAddress", { nftList: nftsInAddress["result"], fundAddress: address });
      return nftsInAddress;
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
        console.log(state.wrappingProtocol);
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
        var rentProtContract = await this.dispatch("getWrapNFTContract");
        await rentProtContract.methods
          .safeTransferFrom(state.walletModule.account, transferNFTDetails.to, transferNFTDetails.tokenId)
          .send({
            from: state.walletModule.account,
          });
      } catch (error) {
        console.log(error);
        return null;
      }
    },
  },
});
