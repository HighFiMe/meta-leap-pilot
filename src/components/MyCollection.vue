<template>
  <v-container>
    <v-row v-if="(getNFTList = null)" style="text-align: center" align="center" justify="center">
      No NFTs present in the collection
    </v-row>
    <v-row>
      <v-col v-for="nft in getNFTList" :key="nft.token_id" cols="4" height="330" align="center" justify="center">
        <v-img :src="nft.token_uri" height="250" />

        <v-btn
          v-on:click="wrapNFT(nft.owner_of, nft.token_address, nft.token_id)"
          style="text-align: center; margin-top: 25px"
        >
          Wrap NFT
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
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
