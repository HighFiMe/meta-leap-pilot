import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";

export default  {
    state: () => ({ 
      web3: null,
      provider: null,
      account: null,
      chainId: null,
      ensName: null,
      }),

    mutations: { 
      setWeb3(state, web3) {
        state.web3 = web3;
        console.log(state.web3)
    },
      setProvider(state, provider) {
        state.provider = provider;
        console.log(state.provider)
    },
      setChain(state, chainId) {
        state.chainId = chainId;
        console.log(state.chainId)
    },
      setAccount(state, account) {
        state.account = account;
        console.log(state.account)
        state.web3.eth.defaultAccount = account;
    },
    setENSname(state, ensName) {
      state.ensName = ensName;
    } 
  },

    actions: { 
      async listeners ({ commit, state }) {
        // console.log(state.provider);
        state.provider.on('accountsChanged', (accounts) => {
          if(accounts && accounts[0])
          {
            if(accounts[0] != state.account)
            {
              console.log("account changed");
              commit("setAccount", accounts[0]);
              this.dispatch("refreshData");
            }
          } else {
            console.log("disconnected");
            commit("setProvider", null);
            commit("setWeb3", null);
            commit("setAccount", null);
            commit("setChain", null);
            state.provider.removeListener('accountsChanged'); //does this work?
          }
        });


        state.provider.on('chainChanged', (chainId) => {
          commit("setChain", chainId);
        });
      },
      async connectToMetamaskIfConnected({commit, state, dispatch}) {
        commit("setProvider", window.ethereum);
        var accounts = "";
        const currAccounts = await window.ethereum.request({
            method: "eth_accounts",
          });
        if (currAccounts.length != 0) {
          accounts = currAccounts;
        } else {
          return;
        }
        
        window.web3 = new Web3(state.provider);
        commit("setWeb3", window.web3);
        dispatch("listeners");
        const address = accounts[0];
        this.dispatch("refreshData");
        commit("setAccount", address);
        // this.dispatch("getENSName", address);
        const chainId = await state.provider.request({ method: 'eth_chainId' });
        commit("setChain", chainId);
      },

      async connectToMetamask({ commit, state, dispatch }) {
        commit("setProvider", window.ethereum);
        var accounts = await state.provider.send('eth_requestAccounts');

        window.web3 = new Web3(state.provider);
        commit("setWeb3", window.web3);
        dispatch("listeners");
        const address = accounts.result[0];

        commit("setAccount", address);
        this.dispatch("refreshData");

        const chainId = await state.provider.request({ method: 'eth_chainId' });
        console.log(chainId);
        commit("setChain", chainId);
      },

      async connectToWalletconnect({ commit, state }) {
      // async connectToWalletconnect({ commit }) {
        const provider = new WalletConnectProvider({
          infuraId: "85db4049c00b4783a425412807ff92e9",
        });

        commit("setProvider", provider);
        console.log(window.ethereum == provider);
        await state.provider.enable();
        const web3 = new Web3(state.provider);
        commit("setWeb3", web3);
        const accounts = await state.web3.eth.getAccounts();
        const address = accounts[0];
        commit("setAccount", address);
      }, 


      async getENSName({state, commit}, account) {
        console.log('pinging ens')
        try {
          var ensName = state.web3.eth.ens.reverseResolve(account);
          console.log('ensName: ',ensName);
          commit('setENSname', ensName);
        } catch (err) {
          console.log(err);
        }
      },
    },
    
    getters: {  }
  }