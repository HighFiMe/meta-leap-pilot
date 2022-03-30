<template>
  <v-container>
    <v-main v-if="getConnectedAccount">
    <v-row v-if="(getNFTs === null)" style="text-align: center" align="center" justify="center" class="plain--text">
      No NFTs present in the collection
    </v-row>
    <v-row v-else>
      <v-col v-for="nft in getNFTs" :key="nft.id" cols="4">
        <v-card class="secondary">
          <v-img :src="nft.tokenURI" />
          <v-card-title class="plain--text">NAME</v-card-title>
          <v-card-subtitle class="plain--text">Token Id: {{nft.tokenId}}</v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
    </v-main>
    <v-main v-else class="plain--text">Connect wallet to see NFTs. The button is in the top right of the page !</v-main>
  </v-container>
</template>

<script>

export default {
    name: 'PlayerAccess',

    data: () => ({
            
    }),
    computed:{
      getNFTs(){
        if (this.$store.state.dataList_PlayerAccess.nfts == null || this.$store.state.dataList_PlayerAccess.nfts == {}) return null;
        return this.$store.state.dataList_PlayerAccess.nfts;
        
    },
    getConnectedAccount() {
      console.log(this.$store.state.walletModule.account);
      return this.$store.state.walletModule.account;
    },
    },
    async mounted(){
      await this.$store.dispatch("getData",{component: "PlayerAccess"});
    },
  }
</script>
