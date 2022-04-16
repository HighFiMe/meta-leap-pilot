<template>
  <v-container>
    <br>
    <v-main v-if="getConnectedAccount">
      <v-row v-if="this.$store.state.loadList.managedNFTs == true && getNFTs == null || getNFTs.length == 0" style="padding-top: 200px;" justify="center" class="plain--text">
        No NFTs present in the collection
      </v-row>
      <v-row v-else class="text-center">
        <v-row v-if="this.$store.state.loadList.managedNFTs == false">
          <loadingScreen></loadingScreen>
        </v-row>
        <v-row v-else>
         <v-dialog
          v-for="(nft, key) in getNFTs"
          :key="key"
          :retain-focus="false"
          persistent
          v-model="dialog"
          max-width="290"
         >
          <template v-slot:activator="{ on, attrs }">
            <div class="wNFT-card">
              <v-row>
                <v-card class="secondary">
                  <v-img :src="nft.image" height="250" width="300" />
                  <v-card-title class="plain--text">NAME</v-card-title>
                  <v-card-subtitle class="plain--text">Token Id: {{ nft.leapTokenId }}</v-card-subtitle>
                </v-card>
              </v-row>
              <v-row justify="center">
                <v-btn color="accent" dark v-bind="attrs" v-on:click="open_dialog(nft)"> Options </v-btn>
              </v-row>
            </div>
          </template>
          <v-card class="plain">
            <v-card-actions>
              <v-row justify='end'>
                 <v-btn text @click="dialog = false" ><v-icon class="fa fa-remove"></v-icon></v-btn>
              </v-row>
            </v-card-actions>
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
              <v-btn color="primary" text @click="submit('transfer', nft.leapTokenId)"> Change player </v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
         </v-dialog>
        </v-row>
      </v-row>
    </v-main>
    <v-main v-else style="padding-top: 200px; padding-left:300px" justify="center" class="plain--text">Connect wallet to see NFTs. The button is in the top right of the page !</v-main>
  </v-container>
</template>

<script>
import loadingScreen from './loadingScreen.vue';
export default {
  name: "ManagedNFTs",

  components:{
    loadingScreen
  },
  data: () => ({
    dialog: false,
    address: "",
    owner: "",
    manager: "",
    user: "",
  }),
  computed: {
    getNFTs() {
      var managedNFTs = this.$store.state.NFTData.managedNFTs;
      if (managedNFTs == null || managedNFTs == [] || managedNFTs == 0)
        return null;
      return Object.values(managedNFTs).filter((nft) => this.showNFT(nft));
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

      this.$store
        .dispatch(action, {
          from: this.user,
          to: this.address,
          tokenId: this.leapTokenId,
        })
        .then(() => {
          this.$vToastify.success("Successfully transfered");
        });

      this.dialog = false;
    },
    showNFT(nft) {
      let account = this.$store.state.walletModule.account;
      if (account == null || account == "") {
        return false;
      }

      if (account == nft.userManager) {
        return true;
      }
      return true;
    },
  },
  async mounted() {
    //await this.$store.dispatch("getNFTsInAddress");
    await this.$store.dispatch("getData", { component: "ManagedNFTs" });
  },
};
</script>
