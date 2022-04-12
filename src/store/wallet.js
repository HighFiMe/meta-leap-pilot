import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";
import Web3Modal from "web3modal";

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  
});

export default  {
    state: () => ({ 
      web3: null,
      provider: null,
      account: null,
      networkId: null,
    }),

    mutations: { 
      setWeb3(state, web3) {
        state.web3 = web3;
    },
      setProvider(state, provider) {
        state.provider = provider;
    },
      setAccount(state, account) {
        state.account = account;
        state.web3.eth.defaultAccount = account;
    }, 
      setNetworkId(state,NetId){
        state.networkId = NetId;
      }
  },

    actions: { 
      async connectToMetamask({ commit }) {
        commit("setProvider", window.ethereum);
        const accounts = await window.ethereum.send('eth_requestAccounts');
        window.web3 = new Web3(window.ethereum);
        commit("setWeb3", window.web3);
        const address = accounts.result[0];
        this.dispatch("refreshData");
        commit("setAccount", address);
        console.log(address);
        
        const networkId = await window.web3.eth.net.getId();
        console.log(networkId);
        commit("setNetworkId", networkId);

        const provider = await web3Modal.connect();

        provider.on("accountsChanged", async (address) => {
          if (address.length > 0) {
            //console.log("changed");
           // console.log(address[0]);
            commit("setAccount", address[0]);
          }
          console.log("accountsChanged");
        });
        provider.on("chainChanged", async (chainId) => {
          chainId = parseInt(chainId);
          commit("setChainId", chainId);
          console.log("chainChanged", chainId);
        });
      },
    
      async connectToWalletconnect({ commit }) {
        const provider = new WalletConnectProvider({
          infuraId: "27e484dcd9e3efcfd25a83a78777cdf1",
        });
        commit("setProvider", provider);
        await provider.enable();
        const web3 = new Web3(provider);
        commit("setWeb3", web3);
        const accounts = await web3.eth.getAccounts();
        const address = accounts[0];
        commit("setAccount", address);
        console.log(address);
      }, 
    },
    
    getters: {  }
  }