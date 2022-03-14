<template>
  <v-app>
    <v-app-bar
      style="margin:4px; border-radius:10px; border-color: black; border-width:medium; max-height:70px;"
      outlined
      elevation="0"
    >
      <div class="d-flex align-center" style="padding-left: 20px; font-size:1.5em;">
        <h2>
          meta leap
        </h2>
      </div>

      <v-spacer></v-spacer>

      <div class="d-flex align-center" style="padding-right:24px;">
      <v-btn
        depressed
        href=""
        style="text-transform: unset !important; background:lightgrey; font-size:1.2em;"
      >
        connect wallet
      </v-btn>
      </div>
    </v-app-bar>

    <v-main>
      <div style="padding-top:10px">
        <v-btn-toggle v-model="toggle_none">
          <v-btn
            depressed
            href=""
            style="text-transform: unset !important; background:lightgrey; margin-left:20px; font-size:1.2em; border-radius:4px; padding: 0px 24px;"
          >
            my collection
          </v-btn>
          <v-btn
            depressed
            href=""
            style="text-transform: unset !important; background:lightgrey; margin-left:20px; font-size:1.2em; border-radius:4px; padding: 0px 24px;"
          >
            managed nfts
          </v-btn>
          <v-btn
            depressed
            href=""
            style="text-transform: unset !important; background:lightgrey; margin-left:20px; font-size:1.2em; border-radius:4px; padding: 0px 24px;"
          >
            player access
          </v-btn>
        </v-btn-toggle>
      </div>
      <div v-show="toggle_none==0">
        <MyCollection/>
      </div>
      <div v-show="toggle_none==1">
        <ManagedNFTs/>
      </div>
      <div v-show="toggle_none==2">
        <PlayerAccess/>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import MyCollection from './components/MyCollection';
import ManagedNFTs from './components/ManagedNFTs';
import PlayerAccess from './components/PlayerAccess';

export default {
  name: 'App',

  components: {
    MyCollection,
    ManagedNFTs,
    PlayerAccess,
  },

  data: () => ({
      toggle_none: null,
  }),
};
</script>

<style scoped>

</style>