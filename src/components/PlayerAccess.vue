<template>
  <v-container>
    <br>
    <v-main v-if="getConnectedAccount">
      <v-row v-if="this.$store.state.loadList.playerAccess == true && getNFTs === null" style="padding-top: 200px;" justify="center" class="plain--text">
        No NFTs present in the collection
      </v-row>
      <v-row v-else>
        <v-row v-if="this.$store.state.loadList.playerAccess == false">
            <loadingScreen></loadingScreen>
        </v-row>
        <v-row v-else>
         <v-col v-for="nft in getNFTs.filter((nft) => showNFT(nft))" :key="nft.leapTokenId" cols="4">
           <v-card class="secondary">
            <v-img :src="nft.tokenURI" />
            <v-card-title class="plain--text">NAME</v-card-title>
            <v-card-subtitle class="plain--text">Token Id: {{ nft.leapTokenId }}</v-card-subtitle>
          </v-card>
        </v-col>
        </v-row>
      </v-row>
    </v-main>
    <v-main v-else style="padding-top: 200px; padding-left:300px"  class="plain--text">Connect wallet to see NFTs. The button is in the top right of the page !</v-main>
  </v-container>
</template>

<script>
import loadingScreen from './loadingScreen.vue';

export default {
  name: "PlayerAccess",
  components:{
    loadingScreen,
  },
  data: () => ({}),
  computed: {
    getNFTs() {
      if (this.$store.state.dataList.playerAccess.nfts == null || this.$store.state.dataList.playerAccess.nfts == [] || this.$store.state.dataList.playerAccess.nfts.length == 0)
        return null;
      return this.$store.state.dataList.playerAccess.nfts;
    },
    getConnectedAccount() {
      console.log(this.$store.state.walletModule.account);
      return this.$store.state.walletModule.account;
    },     
  },
  methods: {
    
    
    showNFT(nft) {
      let account = this.$store.state.walletModule.account;
      if (account == null || account == "") {
        return false;
      }

      if (account == nft.user) {
        return true;
      }
      return true;
    },
  },
  async mounted() {
    await this.$store.dispatch("getData", { component: "PlayerAccess" });
    
  },
};
</script>
