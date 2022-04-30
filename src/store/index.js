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

const hotWalletAbi = require("../../contracts/abi/hotWallet.json");
const nftContractAbi = require("../../contracts/abi/myNftAbi.json");

const APIURL = "https://api.thegraph.com/subgraphs/name/lazycoder1/hot-wallet";

//const add ="0x0b3074cd5891526420d493b13439f3d4b8be6144"
const tokensQuery = `
  query {
  defaultWallets(hotWallet: "ADDRESS") {
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
    coldWallet: "",
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
    setColdWallet(state, coldWallet) {
      state.coldWallet = coldWallet;
    }
  },
  actions: {
    async getUsageNFTs({ state, commit }) {
      var coldWallet = state.hotWallet;
      console.log('cold wallet', coldWallet);
      if (coldWallet == "" || coldWallet == null || coldWallet == "0x0000000000000000000000000000000000000000") return;
      console.log('here here heeer')
      const options = { chain: "rinkeby", address: coldWallet };
      var nftsInAddress = await Moralis.Web3API.account.getNFTs(options);
      console.log(nftsInAddress)
      nftsInAddress["result"].map(x => {
        commit("addNftToNftData", {nft:x, type: 'usageAccess', key: x['token_hash']});
      })
      
      commit("setLoadingStates", {loadingType: 'usageAccess', setLoading: true});
      
    },


    // async commitNFTData({commit}, {incomingDict, currentDict, type}) {
    //   var operations = getNFTDictOperations(incomingDict, currentDict);
    //   let key = 0;
    //   for (let index in operations.insert) {
    //     key = operations.insert[index];
    //     if (!(incomingDict[key]['tokenURI'].includes('googleusercontent'))) {
    //       console.log('requests made');
    //       incomingDict[key]['image'] = await getImageFromOpenseaAssetData(
    //         {
    //           collectionAddress: incomingDict[key]['collectionAddress'], 
    //           collectionTokenId: incomingDict[key]['collectionTokenId'], 
    //           tokenUri: incomingDict[key]['tokenUri']
    //         });
    //        await sleep(1000);
    //     }else{
    //       incomingDict[key]['image'] = incomingDict[key]['tokenURI'];
    //     }
    //     commit("addNftToNftData", {nft:incomingDict[key], type, key})
    //   }
    //   for (let index in operations.delete) {
    //     key = operations.delete[index];
    //     commit("removeNftFromNftData", {type, key})
    //   }
    // },

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
      await this.dispatch("loadDefaultAddress");
      await this.dispatch("getUsageNFTs");
      
    },

    async loadDefaultAddress({state, commit}) {
      const address = state.walletModule.account;

      if (address == "" || address == null) return;
      try {
        var player_access = tokensQuery.replace("ADDRESS", address);
        var dataUsageAccess = await client.query(player_access).toPromise();
        var walletMap = dataUsageAccess.data.defaultWallets[0];

        commit("setHotWallet", walletMap['hotWallet']);
        commit("setColdWallet", walletMap['coldWallet'])
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
      
    }
  },
});
