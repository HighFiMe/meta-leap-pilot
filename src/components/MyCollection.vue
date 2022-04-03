<template>
  <v-container>
    <v-main v-if="getConnectedAccount">
      <v-row v-if="getNFTList === null" style="text-align: center" align="center" justify="center" class="plain--text">
        No NFTs present in the collection
      </v-row>
      <v-row v-else>
        <v-col
          v-for="nft in getNFTList.filter((nft) => showNFT(nft.symbol, nft.token_uri, nft.contract_type))"
          :key="nft.token_id"
          cols="4"
          height="330"
          align="center"
          justify="center"
          ><template>
            <div>
              <v-card class="secondary">
                <v-img :src="nft.token_uri" height="250" />
                <v-card-title class="justify-center plain--text">{{ nft.name }}</v-card-title>
                <v-card-subtitle class="plain--text">Token Id: {{ nft.token_id }}</v-card-subtitle>
                <v-card-subtitle class="plain--text"></v-card-subtitle>
              </v-card>
              <v-btn
                color="accent"
                v-on:click="wrapNFT(nft.owner_of, nft.token_address, nft.token_id)"
                style="text-align: center"
              >
                Wrap NFT
              </v-btn>
            </div>
          </template>
        </v-col>
      </v-row>
    </v-main>
    <v-main v-else class="plain--text">Connect wallet to see NFTs. The button is in the top right of the page !</v-main>
  </v-container>
</template>

<script>
export default {
  name: "MyCollection",

  components: {},

  data: () => ({}),
  computed: {
    getNFTList() {
      if (this.$store.state.dataList_MyNFTs == null || this.$store.state.dataList_MyNFTs == []) return null;
      return this.$store.state.dataList_MyNFTs;
    },
    getConnectedAccount() {
      console.log(this.$store.state.walletModule.account);
      return this.$store.state.walletModule.account;
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
    showNFT(symbol, tokenUri, contractType) {
      console.log(symbol, tokenUri);
      if (symbol != "wNFT" && contractType == "ERC721") {
        if (tokenUri != "" && tokenUri != null && tokenUri != "abcd" ) {
          return true;
        }
      }
      return false;
    },
  },
  async mounted() {
    await this.$store.dispatch("getNFTsInAddress");
  },
};
</script>
