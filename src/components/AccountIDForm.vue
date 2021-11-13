<template>
  <v-form v-model="valid">
    <v-container>

      <v-row>
        <v-col
          cols="12"
          md="12"
        >
          <v-select
            v-model="network"
          :items="networks"
          label="Select Network"
        ></v-select>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="12"
        >
          <v-text-field
            v-model="accountID"
            :rules="accountIDRules"
            :counter="58"
            label="Algorand Account ID"
            required
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="12"
        >
          <v-select
            v-model="searchDepth"
            :items="searchDepths"
            label="Select Network Depth"
            hint="How many layers to search"
            persistent-hint
          ></v-select>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="12"
        >
          <v-btn
            color="primary"
            elevation="2"
            large
            x-large
            v-on:click="search"
            :disabled="searching"
          >
            {{buttonText}}
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
export default {
  name: "AccountIDForm",
  data: () => ({
    valid: false,
    accountID: 'A3XVEBGTEN6ZKUC3UO3BZ3BMVXCZ6TA4LO6R2LLYRYIRU5IHORXDJJVIOE',
    accountIDRules: [
      v => !!v || 'AccountID is required',
      v => v.length >= 58 || 'AccountID must be exactly than 58 characters',
    ],
    networks: ['MainNet', 'TestNet', 'BetaNet'],
    network: 'TestNet',
    searchDepth: 1,
    searchDepths: [0, 1, 2, 3, 4],
    searching: false,
    buttonText: "Build Graph for Account"
  }),
  methods: {
    search: async function() {
      this.searching = true
      this.buttonText = "Searching"
      await new Promise(f => setTimeout(f, 2000));
      this.buttonText = "Build Graph for Account"
      this.searching = false
    }
  }
};
</script>

<style scoped>

</style>