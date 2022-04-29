<template>
  <v-container class="container_playerAccess" style="margin-top: 100px;">
    <v-main v-if="getConnectedAccount" >
      <v-row
        v-if="
          this.$store.state.loadList.usageAccess == true && getNFTs === null
        "
        style="padding-top: 200px"
        justify="center"
        class="plain--text"
      >
        No NFTs present in the collection
      </v-row>
      <v-row v-else>
        <v-row v-if="this.$store.state.loadList.usageAccess == false" >
          {{this.$store.state.loadList.usageAccess}}
          <loadingScreen ></loadingScreen>
          }
        </v-row>
        <v-row v-else >
          <v-col v-for="(nft, key) in getNFTs" :key="key" cols="4">
            <v-card class="secondary">
              <v-text v-if="isOpenseaURL(nft.metadata) == true">
                <v-img
                  :src="getOpenseaUrl(nft.metadata)"
                  height="250"
                  width="400"
                />
              </v-text>
              <v-text v-else>
                <v-img :src="nft.token_uri" height="250"
              /></v-text>
              <v-card-title class="justify-center plain--text">{{
                nft.name
              }}</v-card-title>
              <v-card-subtitle class="plain--text"
                >Token Id: {{ nft.token_id }}</v-card-subtitle
              >
              <v-card-subtitle class="plain--text"></v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>
      </v-row>
    </v-main>
    <v-main
      v-else
      style="padding-top: 200px; padding-left: 300px"
      class="plain--text"
      >Connect wallet to see NFTs. The button is in the top right of the page
      !</v-main
    >
  </v-container>
</template>

<script>
import loadingScreen from "./loadingScreen.vue";

export default {
  name: "usageAccess",
  components: {
    loadingScreen,
  },
  data: () => ({
    search: "",
  }),
  computed: {
    getNFTs() {
      var usageAccess = this.$store.state.NFTData.usageAccess;
      console.log(this.$store.state.loadList.usageAccess);
      if (usageAccess == null || usageAccess == [] || usageAccess.length == 0|| this.$store.state.walletModule.account == this.$store.state.coldWallet)
        return null;
      return Object.values(usageAccess);

    },
    getConnectedAccount() {
      console.log(this.$store.state.walletModule.account);
      return this.$store.state.walletModule.account;
    },
  },
  methods: {
    isOpenseaURL(metadata) {
      if (metadata != null && JSON.parse(metadata) != null) {
        //console.log(JSON.parse(metadata).image);
        return true;
      }
      return false;
    }, 
    getOpenseaUrl(metadata) {
      if (metadata != null && JSON.parse(metadata).image.startsWith("https")) {
        return JSON.parse(metadata).image;
      }

      var url = this.openseaStartUrl + JSON.parse(metadata).image.slice(7);
      //console.log(url);
      return url;
    },
  },
  async mounted() {
    await this.$store.dispatch("getData", { component: "usageAccess" });
  },
};
</script>
