<template>
  <v-app theme="theme">
    <v-main class="primary">
      <v-app-bar
        class="plain"
        style="
          margin: 4px;
          border-radius: 10px;
          border-color: black;
          border-width: medium;
          max-height: 70px;
        "
        outlined
        elevation="0"
      >
        <div
          class="d-flex align-center"
          style="padding-left: 20px; font-size: 1.5em"
        >
          <h2>meta leap</h2>
        </div>

        <v-spacer></v-spacer>
        <v-btn
          color="accent"
          style="
            text-transform: unset !important;
            background: lightgrey;
            font-size: 1.2em;
            margin-right: 20px;
          "
          @click="mintNFT()"
          >Mint NFT</v-btn
        >
        <v-btn
          depressed
          style="
            text-transform: unset !important;
            background: lightgrey;
            font-size: 1.2em;
          "
          >{{ $store.state.walletModule.account }}</v-btn
        >
      </v-app-bar>

      <v-main class="primary">
        <template>
          <v-dialog v-model="sheet" persistent width="400px">
            <!-- <template v-slot:activator="{ on, attrs }">
                  <v-btn color="green" dark v-bind="attrs" v-on="on">Open Persistent</v-btn>
               </template> -->
            <v-card class="text-center" height="200px">
              <br />
              <br />
              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    depressed
                    x-large
                    v-bind="attrs"
                    v-on="on"
                    color="accent"
                    style="
                      text-transform: unset !important;
                      background: lightgrey;
                      font-size: 1.2em;
                    "
                  >
                    connect wallet
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item
                    v-for="(item, index) in items"
                    :key="index"
                    :disabled="item.disabled"
                    link
                    @click="handleClick(index)"
                  >
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
              <div class="py-3">Please connect your wallet to continue</div>
            </v-card>
          </v-dialog>
        </template>
        <div style="padding-top: 10px; color: primary">
          <v-btn-toggle v-model="toggle_none" class="primary">
            <v-btn
              class="plain--text"
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
            <v-btn
              class="plain--text"
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
              Usage access
            </v-btn>
          </v-btn-toggle>
        </div>
        <div v-show="toggle_none == 0">
          <MyCollection />
        </div>
        <!-- <div v-show="toggle_none == 1">
          <wrappedNFTs />
        </div>
        <div v-show="toggle_none == 2">
          <ManagedNFTs />
        </div> -->
        <div v-show="toggle_none == 1">
          <UsageAccess />
        </div>
      </v-main>
    </v-main>
  </v-app>
</template>

<script>
import MyCollection from "./components/MyCollection";
import UsageAccess from "./components/UsageAccess";

//import axios from 'axios';
// import detectEthereumProvider from '@metamask/detect-provider';

let sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default {
  name: "App",

  components: {
    MyCollection,
    UsageAccess,
  },

  data: () => ({
    // sheet: true,
    toggle_none: 0,

    items: [
      {
        title: "Metamask Login",
        diabled: true,
        click() {
          this.$store.dispatch("connectToMetamask").walletModule;
          // console.log(window.ethereum.request({ method: 'eth_accounts' }))
        },
      },
      {
        title: "walletconnect",
        disabled: false,
        click() {
          this.$store.dispatch("connectToWalletconnect").walletModule;
          // console.log(window.ethereum.request({ method: 'eth_accounts' }))
        },
      },
    ],
  }),

  computed: {
    sheet: {
      get() {
        return !this.$store.state.walletModule.account;
      },
    },
  },
  methods: {
    handleClick(index) {
      this.items[index].click.call(this);
    },
    mintNFT() {
      var account = this.$store.state.walletModule.account;
      if (account == null || account == "") {
        this.$vToastify.warning("Please connect your wallet, we will mint the NFT to the wallet!");
        return;
      }
      this.$store.dispatch("mintNFT", account).then(() => this.$vToastify.success("Transaction completed, please wait a minute for the NFT to arrive."));
      this.$vToastify.success("Transaction placed, please wait for it to complete.");
    }
  },

  
  async mounted() {
    let a = 1;
    let b = 1;
    this.$store.dispatch("connectToMetamaskIfConnected")
    this.$store.dispatch("refreshData");
    
    while (a == b) {
      await sleep(10000);
      await this.$store.dispatch("refreshData");
    }
  },
};
</script>

<style scoped></style>
