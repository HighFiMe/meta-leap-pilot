<template>
  <v-container>
    <v-row v-if="(getNFTs = null)" style="text-align: center" align="center" justify="center">
      No NFTs present in the collection
    </v-row>
    <v-row>
      <v-col v-for="nft in getNFTs" :key="nft.id" cols="4">
        <v-img :src="nft.tokenURI" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
    name: 'PlayerAccess',

    data: () => ({
            
    }),
    computed:{
      getNFTs(){
        if (this.$store.state.dataList_PlayerAccess.nfts == null || this.$store.state.dataList_PlayerAccess.nfts == {}) return [];
        return this.$store.state.dataList_PlayerAccess.nfts;
    },
    },
    async mounted(){
      await this.$store.dispatch("getData",{component: "PlayerAccess"});
    },
  }
</script>
