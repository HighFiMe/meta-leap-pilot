<template>
        <v-row justify="center">
                <v-dialog
                   v-model="dialog"
                   max-width="290"
                >
                   <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      color="primary"
                      dark
                      v-bind="attrs"
                      v-on="on"
                     >
                     Wrapped NFTs
                    </v-btn>
                   </template>
                   <v-card>
                      <v-card-actions>
                         <v-spacer></v-spacer>
                         <v-btn :disabled="approve"
                           color="green darken-1"
                           text
                           @click="toggle_approve()"

                         >
                           Approve
                         </v-btn>
                         <v-btn :disabled="wrap"
                           color="green darken-1"
                           text
                           @click="toggle_wrap()"
                         >
                            Wrap
                         </v-btn>
                         <v-btn :disabled="list"
                            color="green darken-1"
                            text
                            @click="toggle_list()"
                            
                         >
                            List
                         </v-btn>
                      </v-card-actions>
                   </v-card>
                   </v-dialog>
             </v-row>
          
</template>
<script>
export default {
    name: 'modal',
    data: () =>({
        dialog: false, 
        approve:false,
        wrap:true,
        list:true,
    }),
    methods:{
        toggle_approve(){
        if(this.approve==false){
          this.approve=true;
          this.wrap=false;
          this.list=true;
        }
        
      },
      toggle_wrap(){
        if(this.wrap==false){
          this.wrap=true;
          this.list=false;
        }
      },
      toggle_list(){
        if(this.list==false){
          this.list=true;
          this.dialog=false;
        }
      },
    }
}
</script>