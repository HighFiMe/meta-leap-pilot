<template>
  <v-container>
    <v-row v-if="(getNFTList = null)" style="text-align: center" align="center" justify="center">
      No NFTs present in the collection
    </v-row>
    <v-row>
      <v-col v-for="nft in getNFTList" :key="nft.token_id" cols="4">
        <v-card height="200">
          <v-img :src="nft.token_uri" height="200" />
          <v-card-text>
            <!-- <modal /> -->
            <v-btn v-on:click="wrapNFT(nft.owner_of, nft.token_address, nft.token_id)"> Wrap NFT </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import modal from "./modal.vue";
export default {
  name: "MyCollection",

  components: {},

  data: () => ({}),
  computed: {
    getNFTList() {
      const address = "0xe95C4707Ecf588dfd8ab3b253e00f45339aC3054";
      if (this.$store.state.nftList == null || this.$store.state.nftList == {}) return [];
      console.log(this.$store.state.nftList);
      // console.log(this.$store.state.nftList[address]);
      return this.$store.state.nftList[address];
    },
  },
  methods: {
    async wrapNFT(ownerOf, tokenAddress, tokenId) {
      let account = this.$store.state.walletModule.account;
      if (account == null || account == "") {
        this.$vToastify.warning("Connect your wallet please");
        return;
      }
      await this.$store.dispatch("wrapNFT", {
        nftAddress: tokenAddress,
        from: account,
        tokenId: tokenId,
      });
    },
  },
  async mounted() {
    await this.$store.dispatch("getNFTsInAddress");
  },
};
</script>
