<template>
  <v-container>
    <v-row v-if="getNFTList = null" style="text-align:center;" align="center" justify="center">
             No NFTs present in the collection
           </v-row>
        <v-row>
          <v-col v-for="(nft) in getNFTList" :key="nft.block_number" cols="4">
           
            <v-img :src="nft.token_uri" />
            <v-row justify="center">
                <v-dialog v-model="dialog" max-width="290">
                   <template v-slot:activator="{ on, attrs }">
                    <v-btn color="primary" dark v-bind="attrs" v-on="on">
                     Approve Manager
                    </v-btn>
                   </template>
                   <v-card ref="ApproveManager">
                       <v-card-text>  
                         <v-text-field ref="approve_manager" label="approve manager"></v-text-field>
                       </v-card-text>
                       <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="primary" text @click="submit=false">
                           Submit
                          </v-btn>
                       </v-card-actions>
                   </v-card>
                 </v-dialog>
                 <v-dialog v-model="dialog" max-width="290">
                   <template v-slot:activator="{ on, attrs }">
                    <v-btn color="primary" dark v-bind="attrs" v-on="on">
                     Tranfer to Rentee
                    </v-btn>
                   </template>
                   <v-card ref="TransferToRentee">
                       <v-card-text>  
                         <v-text-field ref="rentee" label="Transfer to rentee"></v-text-field>
                       </v-card-text>
                       <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="primary" text @click="submit">
                           Submit
                          </v-btn>
                       </v-card-actions>
                   </v-card>
                 </v-dialog>
             </v-row>
           </v-col>
        </v-row>
  </v-container>
</template>

<script>
  
  export default {
    name: 'MyCollection',
    
    components:{
  
    },
    
    data: () => ({
      rentee:null, 
      manager:null,  
    }),
    computed:{
      transferToRentee(){
        return {
          rentee : this.rentee,
          }
      },
      approveManager(){
        return {
          manager : this.manager,
          }
      },

      getNFTList() {
      const address ='0xe95C4707Ecf588dfd8ab3b253e00f45339aC3054';
      if (this.$store.state.nftList == null || this.$store.state.nftList == {}) return [];
      console.log(this.$store.state.nftList);
     // console.log(this.$store.state.nftList[address]);
      return this.$store.state.nftList[address];
    }
    },
    method:{
      submit(){
        //this.$refs.form.validate();
      }
    },
    async mounted(){
      await this.$store.dispatch("getNFTsInAddress");
    },
  }
</script>
