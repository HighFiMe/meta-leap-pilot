<template>
  <v-container>
    <v-main v-if="getConnectedAccount">
      <br />
      <v-row
        style="
          background-color: #3d3a50;
          border-radius: 50px;
          margin-bottom: 50px;
        "
      >
        <div class="set-default-bar">
          <v-col>
            <v-text-field
              v-model="hotWalletAddress"
              :counter="42"
              label="Enter Default Hot Wallet Address"
              required
            ></v-text-field>
          </v-col>
          <v-col>
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
              v-on:click="changeDefaultHotWaller()"
            >
              Set Default Hot Wallet
            </v-btn></v-col
          >
        </div>
      </v-row>

      <br />
      <v-row
        style="
          background-color: #3d3a50;
          border-radius: 50px;
          margin-bottom: 50px;
        "
      >
        <v-col>Your current default address: </v-col>
        <v-col>{{ $store.state.hotWallet }} </v-col>
      </v-row>
      <v-row
        v-if="this.$store.state.loadList.myNFTs == true && getNFTList === null"
        style="padding-top: 200px"
        justify="center"
        class="plain--text"
      >
        No NFTs present in the collection
      </v-row>
      <v-row v-else>
        <v-row v-if="this.$store.state.loadList.myNFTs == false">
          <loadingScreen></loadingScreen>
        </v-row>
        <v-row v-else>
          <v-col
            v-for="nft in getNFTList.filter((nft) =>
              showNFT(nft.symbol, nft.token_uri, nft.contract_type)
            )"
            :key="nft.synced_at"
            cols="4"
            height="330"
            align="center"
            justify="center"
            ><template>
              <div>
                <v-card class="secondary">
                  <v-text v-if="isOpenseaURL(nft.metadata) == true">
                    <v-img
                      :src="getOpenseaUrl(nft.metadata)"
                      height="250"
                      width="400"
                    />
                  </v-text>
                  <v-text v-else>
                    <v-img :src="nft.token_uri" height="250"
                  /></v-text>
                  <v-card-title class="justify-center plain--text">{{
                    nft.name
                  }}</v-card-title>
                  <v-card-subtitle class="plain--text"
                    >Token Id: {{ nft.token_id }}</v-card-subtitle
                  >
                  <v-card-subtitle class="plain--text"></v-card-subtitle>
                </v-card>
              </div>
            </template>
          </v-col>
        </v-row>
      </v-row>
    </v-main>
    <v-main
      v-else
      style="padding-top: 200px"
      justify="center"
      class="plain--text"
      >Connect wallet to see NFTs. The button is in the top right of the page
      !</v-main
    >
  </v-container>
</template>

<style>
.set-default-bar {
  display: contents;
}
</style>

<script>
import loadingScreen from "./loadingScreen.vue";

export default {
  name: "MyCollection",

  components: {
    loadingScreen,
  },

  data: () => ({
    openseaStartUrl: "https://ipfs.io/ipfs/",
    search: "",
    hotWalletAddress: "",
  }),
  computed: {

    getNFTList() {
      if (
        this.$store.state.NFTData.myNFTs == null ||
        this.$store.state.NFTData.myNFTs == [] ||
        this.$store.state.NFTData.myNFTs.length == 0
      )
        return null;
      return this.$store.state.NFTData.myNFTs;
    },
    getConnectedAccount() {
      return this.$store.state.walletModule.account;
    },
  },
  methods: {
    async wrapNFT(ownerOf, tokenAddress, tokenId) {
      let account = this.$store.state.walletModule.account;
      if (account == null || account == "") {
        this.$vToastify.warning("Connect your wallet please");
        return;
      }

      for (var i = 0; i < this.$store.state.NFTData.myNFTs.length; i++) {
        if (
          tokenId == this.$store.state.NFTData.myNFTs[i].token_id &&
          tokenAddress == this.$store.state.NFTData.myNFTs[i].token_address
        ) {
          this.$store.state.NFTData.myNFTs[i] == null;
          //vue.set
        }
      }
      await this.$store.dispatch("wrapNFT", {
        nftAddress: tokenAddress,
        from: account,
        tokenId: tokenId,
      });
    },
    async changeDefaultHotWaller() {
      await this.$store
        .dispatch("setDefaultHotWallet", this.hotWalletAddress)
        .then(() => {
          this.$vToastify.success("Successfully transfered");
        });
    },
    showNFT(symbol, tokenUri, contractType) {
      if ( contractType == "ERC721") {
        if (tokenUri != "" && tokenUri != null && tokenUri != "abcd") {
          return true;
        }
        return false;
      }
    },
    isOpenseaURL(metadata) {
      if (metadata != null && JSON.parse(metadata) != null) {
        return true;
      }
      return false;
    }, 
    getOpenseaUrl(metadata) {
      if (metadata != null && JSON.parse(metadata).image.startsWith("https")) {
        return JSON.parse(metadata).image;
      }

      var url = this.openseaStartUrl + JSON.parse(metadata).image.slice(7);
      return url;
    },
  },
  
};
</script>
