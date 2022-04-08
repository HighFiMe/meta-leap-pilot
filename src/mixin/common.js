export const sharedMethods = {
  methods: {
    fetchUrlDetails: async function() { 
      console.log("in shared space")
      const response = await fetch("https://api.npms.io/v2/search?q=vue");
      console.log(response);
    }
  }
}

