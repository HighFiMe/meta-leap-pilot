import Vue from "vue";
import Vuex from "vuex";
import Moralis from "../plugins/moralis";
import walletModule from './wallet.js'

Vue.use(Vuex);

export default new Vuex.Store({
  modules : {
    walletModule
  },
  state: {
    nftList: {},
  },
  getters: {
    
  },
  mutations: {
    setNftListInAddress(state, { nftList, fundAddress}) {
      Vue.set(state.nftList, fundAddress, nftList);
    },
  },
  actions: {
    async getNFTsInAddress({ commit }) {
      const address='0xe95C4707Ecf588dfd8ab3b253e00f45339aC3054';
      const options = { chain: "rinkeby", address: address };
      const nftsInAddress = await Moralis.Web3API.account.getNFTs(options);
      console.log(nftsInAddress.result[0].token_uri);
      commit("setNftListInAddress", { nftList: nftsInAddress["result"], fundAddress: address});
      return nftsInAddress;
    },
  },
});
