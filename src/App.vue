<template>
  <v-app theme="theme">
    <v-main class="primary">
    <v-app-bar class="plain"
      style="margin: 4px; border-radius: 10px; border-color: black; border-width: medium; max-height: 70px"
      outlined
      elevation="0"
      
    >
      <div class="d-flex align-center" style="padding-left: 20px; font-size: 1.5em">
        <h2>meta leap</h2>
      </div>

      <v-spacer></v-spacer>

      <div class="d-flex align-center" style="padding-right: 24px">
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn 
              v-if="!$store.state.walletModule.account"
              depressed
              v-bind="attrs"
              v-on="on"
              color="accent"
              style="text-transform: unset !important; background: lightgrey; font-size: 1.2em"
            >
              connect wallet
            </v-btn>
            <v-btn v-else depressed style="text-transform: unset !important; background: lightgrey; font-size: 1.2em">{{
              $store.state.walletModule.account
            }}</v-btn>
          </template>
          <v-list>
            <v-list-item v-for="(item, index) in items" :key="index" :disabled="item.disabled" link @click="handleClick(index)">
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <v-main class="primary">
      <div style="padding-top: 10px; color: primary" >
        <v-btn-toggle v-model="toggle_none" class="primary" >
          <v-btn class="plain--text"
            
            href=""
            color="accent"
            style="
              text-transform: unset !important;
              margin-left: 20px;
              font-size: 1.2em;
              border-radius: 4px;
              padding: 0px 24px;
            "
            
          >
            my collection
          </v-btn>
          <v-btn class="plain--text"
            
            href=""
            color="accent"
            style="
              text-transform: unset !important;
              background: lightgrey;
              margin-left: 20px;
              font-size: 1.2em;
              border-radius: 4px;
              padding: 0px 24px;
            "
          >
            Wrapped NFT's
          </v-btn>
          <v-btn class="plain--text"
            
            href=""
            color="accent"
            style="
              text-transform: unset !important;
              background: lightgrey;
              margin-left: 20px;
              font-size: 1.2em;
              border-radius: 4px;
              padding: 0px 24px;
            "
          >
            managed nfts
          </v-btn>
          <v-btn class="plain--text"
            
            href=""
            color="accent"
            style="
              text-transform: unset !important;
              background: lightgrey;
              margin-left: 20px;
              font-size: 1.2em;
              border-radius: 4px;
              padding: 0px 24px;
            "
          >
            player access
          </v-btn>
        </v-btn-toggle>
      </div>
      <div v-show="toggle_none == 0">
        <MyCollection />
      </div>
      <div v-show="toggle_none == 1">
        <wrappedNFTs />
      </div>
      <div v-show="toggle_none == 2">
        <ManagedNFTs />
      </div>
      <div v-show="toggle_none == 3">
        <PlayerAccess />
      </div>
    </v-main>
    </v-main>
  </v-app>
</template>

<script>
import MyCollection from "./components/MyCollection";
import wrappedNFTs from "./components/WrappedNFTs.vue";
import ManagedNFTs from "./components/ManagedNFTs";
import PlayerAccess from "./components/PlayerAccess";

//import axios from 'axios';
// import detectEthereumProvider from '@metamask/detect-provider';

let sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default {
  name: "App",

  components: {
    MyCollection,
    wrappedNFTs,
    ManagedNFTs,
    PlayerAccess,
  },

  data: () => ({
    toggle_none: 0,
    
    items: [
      {
        title: "Metamask Login",
        diabled: false,
        click() {
          this.$store.dispatch("connectToMetamask").walletModule;
          // console.log(window.ethereum.request({ method: 'eth_accounts' }))
        },
      },
      {
        title: "walletconnect",
        disabled: true,
        click() {
          this.$store.dispatch("connectToWalletconnect").walletModule;
          // console.log(window.ethereum.request({ method: 'eth_accounts' }))
        },
      },
    ],
  }),

  methods: {
    handleClick(index) {
      this.items[index].click.call(this);
    },
  },

  beforeMount() {
    this.$nextTick(async () => {
      if (window.ethereum.isConnected()) {
        const currAccounts = await window.ethereum.request({ method: "eth_accounts" });
        // console.log(accounts)
        this.$store.state.walletModule.account = currAccounts[0];
      }
    });
  },
  async mounted() {
    let a = 1;
    let b = 1;
    this.$store.dispatch("connectToMetamask").then(() => {
      this.$store.dispatch("refreshData");
    });
    while (a == b) {
      await sleep(10000);
      await this.$store.dispatch("refreshData");
    }
  },
};
</script>

<style scoped></style>
