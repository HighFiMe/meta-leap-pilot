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

Vue.use(Vuex);

let sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const hotWalletAbi = require("../../contracts/abi/hotWallet.json");
const nftContractAbi = require("../../contracts/abi/myNftAbi.json");

const APIURL = "https://api.thegraph.com/subgraphs/name/lazycoder1/hot-wallet";

//const add ="0x0b3074cd5891526420d493b13439f3d4b8be6144"
const tokensQuery = `
  query {
  defaultWallets(where: {WALLET_TYPE: "ADDRESS"}) {
    id
    coldWallet
    hotWallet
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
      usageAccess: {},
    },
    hotWalletProtocol: "0x2efAaeFa209825Bd98eE19BCD404914427F74bCf",
    nftCollection: "0x5bB502ed31277C199919c2c3D66dce5E7A193BDd",
    hotWallet: "",
    coldWalletList: [],
    loadList: {
      myNFTs: false,
      usageAccess: false,
    },
  },
  getters: {},
  mutations: {
    setLoadingStates(state, data){
      switch (data.loadingType) {
        case 'usageAccess':
          state.loadList.usageAccess = data.setLoading;
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
      state.NFTData.usageAccess = data;
      state.loadList.usageAccess = true;
    },
    setHotWallet(state, hotWallet) {
      state.hotWallet = hotWallet;
    },
    setColdWalletList(state, coldWalletList) {
      state.coldWalletList = coldWalletList;
    },
  },
  actions: {
    async getUsageNFTs({ state, commit }) {
      var coldWalletList = state.coldWalletList;
      var coldWallet = "";
      for (var walletIndex = 0; walletIndex <= coldWalletList.length; walletIndex = walletIndex + 1){
        coldWallet = state.coldWalletList[walletIndex]['coldWallet'];

        if (coldWallet == "" || coldWallet == null || coldWallet == "0x0000000000000000000000000000000000000000") continue;
      
        const options = { chain: "rinkeby", address: coldWallet };
        var nftsInAddress = await Moralis.Web3API.account.getNFTs(options);
        nftsInAddress["result"].map(x => {
          commit("addNftToNftData", {nft:x, type: 'usageAccess', key: x['token_hash']});
        })
        
        commit("setLoadingStates", {loadingType: 'usageAccess', setLoading: true});
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
      await sleep(10000);
      await this.dispatch("getNFTsInAddress");
      await this.dispatch("loadMappingInfo");
      await sleep(1000);
      await this.dispatch("getUsageNFTs");
      
    },

    async loadMappingInfo({state, commit}) {
      const address = state.walletModule.account;

      if (address == "" || address == null) return;
      try {
        var coldWalletQuery = tokensQuery.replace("ADDRESS", address);
        coldWalletQuery = coldWalletQuery.replace("WALLET_TYPE", "hotWallet");
        var coldWalletResponse = await client.query(coldWalletQuery).toPromise();
        var walletList = coldWalletResponse.data.defaultWallets;

        commit("setColdWalletList", walletList)

        var hotWalletQuery = tokensQuery.replace("ADDRESS", address);
        hotWalletQuery = hotWalletQuery.replace("WALLET_TYPE", "coldWallet");
        
        var hotWalletResponse = await client.query(hotWalletQuery).toPromise();
        var hotWallet = hotWalletResponse.data.defaultWallets[0]['hotWallet'];

        commit("setHotWallet", hotWallet)
        
      } catch (error) {
        console.log("error");
        console.log(error);
        return null;
      }
    },

    async getHotWalletContract({ state }) {
      try {
        var hotWalletProtocolChecksum = Web3.utils.toChecksumAddress(state.hotWalletProtocol);
        var hotWalletContract = new state.walletModule.web3.eth.Contract(
          hotWalletAbi,
          hotWalletProtocolChecksum
        );
        return hotWalletContract;
      } catch (error) {
        console.log(error);
        console.log("connected contract not found");
        return null;
      }
    },

    async getNFTContract({ state }) {
      try {
        var nftChecksum = Web3.utils.toChecksumAddress(state.nftCollection);
        var nftContract = new state.walletModule.web3.eth.Contract(
          nftContractAbi,
          nftChecksum
        );
        return nftContract;
      } catch (error) {
        console.log(error);
        console.log("connected contract not found");
        return null;
      }
    },

    async setDefaultHotWallet({ state }, hotWalletAddress) {
      try {
        var hotWalletContract = await this.dispatch("getHotWalletContract");
        var hotWalletChecksum = Web3.utils.toChecksumAddress(hotWalletAddress);
        console.log(state.walletModule.account);
        await hotWalletContract.methods
          .setDefaultHotWallet(
            hotWalletChecksum
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

    async mintNFT(context, account) {
      try{
        var nftContract = await this.dispatch("getNFTContract");
        await nftContract.methods.mintNFT(account, 'https://lh3.googleusercontent.com/NfNeN2am-K5u14t-iFiStppxpLlRT-RPer4tdo2rxuXnLYolDma0HV0EAkx8eZjEIqoUgGC9vBmZRcmbhnCmYlzmXbWgkyL4C9rQjg=w286')
        .send({
          from: account
        });

      } catch (err) {
        console.log("error");
        console.log(err);
        return null;
      }
    },
  },
});
