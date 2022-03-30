<template>
  <v-container>
    <v-main v-if="getConnectedAccount">
      <v-row v-if="getNFTs == null" style="text-align: center" align="center" justify="center">
        No NFTs present in the collection
      </v-row>
      <v-row v-else>
        <v-dialog
          v-for="nft in getNFTs"
          :key="nft.tokenId"
          :retain-focus="false"
          persistent
          v-model="dialog"
          max-width="290"
        >
          <template v-slot:activator="{ on, attrs }">
            <div class="wNFT-card">
              <v-row>
                <v-img :src="nft.tokenURI" height="250" width="300" />
              </v-row>
              <v-row justify="center">
                <v-btn color="primary" dark v-bind="attrs" v-on:click="open_dialog(nft.tokenId)"> Options </v-btn>
              </v-row>
            </div>
          </template>
          <v-card>
            <v-card-text>
              <v-container>
                <v-text-field v-model="address" label="Enter Address"></v-text-field>
              </v-container>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="dialog = false"> Close </v-btn>

              <v-btn color="primary" text @click="submit('approve', nft.tokenId)"> Approve </v-btn>
              <v-btn color="primary" text @click="submit('transfer', nft.tokenId)"> Transfer </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </v-main>
    <v-main v-else class="plain--text">Connect wallet to see NFTs. The button is in the top right of the page !</v-main>
  </v-container>
</template>

<style>
.wNFT-card {
  margin: 20px;
}
</style>

<script>
export default {
  name: "WrappedNFT",

  components: {},

  data: () => ({
    address: "",
    dialog: false,
  }),
  computed: {
    getNFTs() {
      if (this.$store.state.dataList_WrappedNFTs.nfts == null || this.$store.state.dataList_WrappedNFTs.nfts == {})
        return null;
      return this.$store.state.dataList_WrappedNFTs.nfts;
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
    open_dialog(tokenId) {
      this.tokenId = tokenId;
      this.dialog = true;
      return;
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
        to: this.address,
        tokenId: this.tokenId,
      });

      this.dialog = false;
    },
  },
  async mounted() {
    //await this.$store.dispatch("getNFTsInAddress");
    await this.$store.dispatch("getData", { component: "WrappedNFTs" });
  },
};
</script>
