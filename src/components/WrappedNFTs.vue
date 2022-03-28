<template>
  <v-container>
    <v-row v-if="(getNFTs = null)" style="text-align: center" align="center" justify="center">
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
              <v-btn color="primary" dark v-bind="attrs" v-on:click="openModal(nft.token_id)"> Options </v-btn>
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
            <v-btn color="primary" text @click="dialog = false"> close </v-btn>
            <v-btn color="primary" text @click="submit('approve', nft.token_id)"> Approve </v-btn>
            <v-btn color="primary" text @click="submit('transfer', nft.token_id)"> Transfer </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
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
    tokenId: "",
  }),
  computed: {
    getNFTs() {
      if (this.$store.state.dataListQuery.nfts == null || this.$store.state.nftList == {}) return [];
      //console.log(this.$store.state.dataListQuery.nfts);
      return this.$store.state.dataListQuery.nfts;
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
    openModal(token_id) {
      this.dialog = true;
      this.tokenId = token_id;
    },

    submit(buttonType, token_id) {
      const account = this.$store.state.walletModule.account;
      console.log(account);
      if (account == null || account == "") {
        this.$vToastify.warning("Connect your wallet please");
        return;
      }

      var dispatchTo = buttonType == "approve" ? "assignApprover" : "transfer";

      this.$store
        .dispatch(dispatchTo, {
          to: this.address,
          tokenId: this.tokenId,
        })
        .then(() => {
          this.$vToastify.success("Action was successful !");
          this.dialog = false;
        });
    },
  },
  async mounted() {
    //await this.$store.dispatch("getNFTsInAddress");
    await this.$store.dispatch("getData");
  },
};
</script>
