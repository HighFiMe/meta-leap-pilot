import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";

export default  {
    state: () => ({ 
      web3: null,
      provider: null,
      account: null,}),

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
    }, },

    actions: { 
      async connectToMetamask({ commit }) {
        commit("setProvider", window.ethereum);
        const accounts = await window.ethereum.send('eth_requestAccounts');
        window.web3 = new Web3(window.ethereum);
        commit("setWeb3", window.web3);
        const address = accounts.result[0];
        commit("setAccount", address);
        console.log(address);
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