<template>
  <v-container>
    <br>
    <input type="text" v-model="search" placeholder="Filter" /> <br> <br>
    <v-main v-if="getConnectedAccount">
      <v-row v-if="this.$store.state.loadList.lockedNFTs == true && getNFTs == null || getNFTs.length == 0" style="padding-top: 200px;" justify="center" class="plain--text">
        No NFTs present in the collection
      </v-row>
      <v-row v-else>
        <v-row v-if="this.$store.state.loadList.lockedNFTs == false ">
          <loadingScreen></loadingScreen>
        </v-row>
        <v-row v-else>
        <v-dialog
          v-for="(nft, key) in getNFTs"
          :key="key"
          :retain-focus="false"
          persistent
          v-model="dialog"
          max-width="600"
        >
          <template v-slot:activator="{ on, attrs }">
            <div class="wNFT-card">
              <v-row>
                <v-card class="secondary">
                  <v-img :src="nft.image" height="250" width="300" />
                  <v-card-title class="plain--text">{{nft.name}}</v-card-title>
                  <v-card-subtitle class="plain--text">Token Id: {{ nft.leapTokenId }}</v-card-subtitle>
                </v-card>
              </v-row>
              <v-row justify="center">
                <v-btn color="accent" dark v-bind="attrs" v-on:click="open_dialog(nft)" style="margin-right:5px;"> Options </v-btn>
                <v-btn color="accent" dark @click="unwrap(nft.collectionAddress, nft.collectionTokenId)"> Un-wrap NFT </v-btn>
              </v-row>
            </div>
          </template>
          <v-card class="secondary">
            <v-card-actions>
              <v-row justify='end'>
                 <v-btn text @click="dialog = false" ><v-icon class="fa fa-remove"></v-icon></v-btn>
              </v-row>
            </v-card-actions>
            <v-card-text class="plain--text">
              <v-container >
                <v-row >
                  <v-col>owner: {{ owner }} </v-col>
                </v-row>
                <v-row>
                  <v-col
                    >approved:
                    {{
                      manager == "0x0000000000000000000000000000000000000000" ? "No Manager assigned" : manager
                    }}</v-col
                  >
                </v-row>
                <v-row>
                  <v-col>user: {{ user || "No player assigned" }}</v-col>
                </v-row>
                <!-- <v-row>
                  <v-col>Player Split: </v-col>
                </v-row> -->
                <v-row>
                  <v-text-field v-model="address" label="Enter Address" class="plain--text"></v-text-field>
                </v-row>
              </v-container>
            </v-card-text>
            <v-divider></v-divider>

            <v-card-actions>
              <v-btn color="accent" text @click="submit('approve', nft.leapTokenId)" > change manager </v-btn>
              <v-btn color="accent" text @click="submit('transfer', nft.leapTokenId)"> change user </v-btn>
              <!-- <v-btn color="accent" text > Player Split </v-btn> -->
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
    search: "",
  }),
  computed: {
    getNFTs() {
      var lockedNFTs = this.$store.state.NFTData.lockedNFTs;
      if (lockedNFTs == null || lockedNFTs == [] || lockedNFTs == 0)
        return null;
      if(!this.search){
        return Object.values(lockedNFTs).filter((nft) => this.showNFT(nft));
      } else {
        let nfts = Object.values(lockedNFTs).filter(nft => this.showNFT(nft));
        return nfts.filter(nft => 
          nft.leapTokenId.toLowerCase().includes(this.search.toLowerCase()) || 
          nft.collectionAddress.toLowerCase().includes(this.search.toLowerCase())
        )
      }
      // return Object.values(lockedNFTs).filter((nft) => this.showNFT(nft));
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
      this.manager = nft.userManager;

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
    async getNFTImage(collectionAddress, collectionTokenId) {
      var opensea_url = "https://testnets-api.opensea.io/api/v1/asset/TOKEN_ADDRESS/TOKEN_ID"
      opensea_url = opensea_url.replace("TOKEN_ADDRESS",collectionAddress);
      opensea_url = opensea_url.replace("TOKEN_ID",collectionTokenId);
      console.log(opensea_url);
      var res = await axios.get(opensea_url);
      console.log(res.data.image_url);
      // console.log(res.data.image);
      // if(res.data.image!=null || res.data.image!= undefined){
      //   return true;
      // }
      // return false;
    },
  },
  async mounted() {
    //await this.$store.dispatch("getNFTsInAddress");
    await this.$store.dispatch("getData", { component: "lockedNFTs" });
  },
};
</script>
