<template>
  <v-container>
    <v-row v-if="(getNFTs = null)" style="text-align: center" align="center" justify="center">
      No NFTs present in the collection
    </v-row>
    <v-row>
      <v-col v-for="nft in getNFTs" :key="nft.token_id" cols="4">
        <v-img :src="nft.tokenURI" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "ManagedNFTs",

  data: () => ({}),
  computed: {
    getNFTs(){
      
      if (this.$store.state.dataListQuery.nfts == null || this.$store.state.nftList == {}) return [];
     // console.log(this.$store.state.dataListQuery.nfts);
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
  async mounted() {
    //await this.$store.dispatch("getNFTsInAddress");
    await this.$store.dispatch("getData");
  },
};
</script>
