<template>
  <v-container>
    <br>
    <v-main v-if="getConnectedAccount">
      <v-row v-if="this.$store.state.loadList.wrappedNFTs == true && getNFTs == null || getNFTs.length == 0" style="padding-top: 200px;" justify="center" class="plain--text">
        No NFTs present in the collection
      </v-row>
      <v-row v-else>
        <v-row v-if="this.$store.state.loadList.wrappedNFTs == false ">
          <loadingScreen></loadingScreen>
        </v-row>
        <v-row v-else>
        <v-dialog
          v-for="nft in getNFTs.filter((nft) => showNFT(nft))"
          :key="nft.leapTokenId"
          :retain-focus="false"
          persistent
          v-model="dialog"
          max-width="600"
        >
          <template v-slot:activator="{ on, attrs }">
            <div class="wNFT-card">
              <v-row>
                <v-card class="secondary">
                  <v-text>{{nft.tokenURI}}</v-text>
                  <!--<v-text>{{isOpenseaURL(nft.tokenURI)}}</v-text>-->
                  <!--<v-text v-if="isOpenseaURL(nft.tokenURI) == true">hey</v-text>-->
                  <v-img :src="nft.tokenURI" height="250" width="300" />
                  <v-card-title class="plain--text">NAME</v-card-title>
                  <v-card-subtitle class="plain--text">Token Id: {{ nft.leapTokenId }}</v-card-subtitle>
                </v-card>
              </v-row>
              <v-row justify="center">
                <v-btn color="accent" dark v-bind="attrs" v-on:click="open_dialog(nft)" style="margin-right:5px;"> Options </v-btn>
                <v-btn color="accent" dark @click="unwrap(nft.collectionAddress, nft.collectionTokenId)"> Un-wrap NFT </v-btn>
              </v-row>
            </div>
          </template>
          <v-card>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col>Owner: {{ owner }} </v-col>
                </v-row>
                <v-row>
                  <v-col
                    >Manager:
                    {{
                      manager == "0x0000000000000000000000000000000000000000" ? "No Manager assigned" : manager
                    }}</v-col
                  >
                </v-row>
                <v-row>
                  <v-col>Player: {{ user || "No player assigned" }}</v-col>
                </v-row>
                <v-row>
                  <v-text-field v-model="address" label="Enter Address"></v-text-field>
                </v-row>
              </v-container>
            </v-card-text>
            <v-divider></v-divider>

            <v-card-actions>
              <v-btn color="primary" text @click="submit('approve', nft.leapTokenId)"> Change Manager </v-btn>
              <v-btn color="primary" text @click="submit('transfer', nft.leapTokenId)"> Change Player </v-btn>
              
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="dialog = false"> Close </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        </v-row>
      </v-row>
    </v-main>
    <v-main v-else style="padding-top: 200px; padding-left:300px" justify="center" class="plain--text">Connect wallet to see NFTs. The button is in the top right of the page !</v-main>
  </v-container>
</template>

<style>
.wNFT-card {
  margin: 20px;
}
</style>

<script>
import loadingScreen from './loadingScreen.vue';
import axios from "axios";

export default {
  name: "WrappedNFT",

  components: {
    loadingScreen,
  },

  data: () => ({
    address: "",
    dialog: false,
    owner: "",
    manager: "",
    user: "",
  }),
  computed: {
    getNFTs() {
      if (this.$store.state.dataList.wrappedNFTs.nfts == null || this.$store.state.dataList.wrappedNFTs.nfts == [] || this.$store.state.dataList.wrappedNFTs.nfts.length == 0)
        return null;
      return this.$store.state.dataList.wrappedNFTs.nfts;
    },
    getConnectedAccount() {
      console.log(this.$store.state.walletModule.account);
      return this.$store.state.walletModule.account;
    },
    /*
    getNFTList() {
      const address = "0xe95C4707Ecf588dfd8ab3b253e00f45339aC3054";
      if (this.$store.state.nftList == null || this.$store.state.nftList == {}) return [];
      console.log(this.$store.state.nftList);
      // console.log(this.$store.state.nftList[address]);
      return this.$store.state.nftList[address];
    },*/
  },
  methods: {
    open_dialog(nft) {
      this.leapTokenId = nft.leapTokenId;
      this.user = nft.user;
      this.owner = nft.owner;
      this.manager = nft.manager;

      this.dialog = true;
    },
    submit(buttonType) {
      let action = buttonType == "approve" ? "assignApprover" : "transfer";

      let account = this.$store.state.walletModule.account;
      if (account == "" || account == null) {
        this.$vToastify.warning("Connect your wallet please");
        return;
      }

      if (this.address == "" || this.address == null) {
        this.$vToastify.warning("Please enter a valid address");
        return;
      }

      this.$store.dispatch(action, {
        from: this.user,
        to: this.address,
        tokenId: this.leapTokenId,
      });

      this.dialog = false;
    },
    unwrap(collectionAddress, collectionTokenId) {
      let account = this.$store.state.walletModule.account;
      if (account == "" || account == null) {
        this.$vToastify.warning("Connect your wallet please");
        return;
      }

      this.$store.dispatch("unwrapNFT", {
        collectionAddress,
        collectionTokenId
      });

      this.dialog = false;
    },
    showNFT(nft) {
      let account = this.$store.state.walletModule.account;
      if (account == null || account == "") {
        return false;
      }

      if (account == nft.owner) {
        return true;
      }
      return false;
    },
    async isOpenseaURL(uri) {
      var res = await axios.get(uri);
      console.log(res.data.image);
      if(res.data.image!=null || res.data.image!= undefined){
        return true;
      }
      return false;
    },
  },
  async mounted() {
    //await this.$store.dispatch("getNFTsInAddress");
    await this.$store.dispatch("getData", { component: "WrappedNFTs" });
  },
};
</script>
