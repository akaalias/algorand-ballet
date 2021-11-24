<template>
  <v-form class="pl-4 pr-4" id="searchForm">
    <v-row>
      <v-col cols="2">
        <v-select
          v-model="selectedNetwork"
          item-text="name"
          item-value="domain"
          :items="networks"
          label="Network"
          single-line
          return-object
          class="top-z"
        ></v-select>
      </v-col>
      <v-col cols="8">
        <v-text-field
          v-model="accountID"
          :rules="accountIDRules"
          label="Algorand Target Account ID"
          required
          single-line
        ></v-text-field>
      </v-col>
      <v-col cols="2" class="pt-5">
        <v-btn
          color="primary"
          elevation="2"
          v-on:click="searchReady"
          :disabled="searching"
          block
        >
          {{ buttonText }}
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import { AlgorandAPIConfig } from "../models/AlgorandAPIConfig";

export default {
  name: "SearchForm",
  props: ["parentAccountID"],
  data:() => ({
    accountID: "FTRREWATI4Y7RZGN2QVTM4HITMFWGK5NU7VAWXN6FJNZG5FLYREQGI22C4",
    accountIDRules: [
      (v) => !!v || "AccountID is required",
      (v) => v.length === 58 || "AccountID must be exactly 58 characters long",
    ],
    networks: AlgorandAPIConfig.apiNetworks,
    selectedNetwork: AlgorandAPIConfig.defaultNetwork,
    buttonText: "Build Graph",
    searching: false,
  }),
  methods: {
    searchReady() {
      this.$emit('searchReady', {accountID: this.accountID, network: this.selectedNetwork});
    }
  },
  watch: {
    parentAccountID: function(newVal, oldVal) {
      this.accountID = newVal;
    }
  }
};
</script>

<style scoped>

</style>