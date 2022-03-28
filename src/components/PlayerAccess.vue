<template>
  <v-container>
    <div>
      Data: {{ example1 }}
    </div>
      <v-btn @click="getURL()">get lang</v-btn>
  </v-container>
</template>

<script>

export default {
    name: 'PlayerAccess',

    data: () => ({
            
    }),
    methods:{
      async getURL(){
        
      },
    },
    async mounted(){
      console.log("here")
      await this.$store.dispatch("getdata");
    },
  }
</script>
