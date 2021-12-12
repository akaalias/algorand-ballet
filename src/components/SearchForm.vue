<template>
  <v-form class="pl-4 pr-4" id="searchForm">
    <v-row>
      <v-col cols="1" class="pt-8" v-if="accountIDHistory.length > 1">
        <v-btn
        small
        @click="goBack"
        >
          <v-icon>
            mdi-chevron-left
          </v-icon>

        </v-btn>
      </v-col>
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
      <v-col cols="7">
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
          :disabled="isDisabled ? false : true"
          block
        >
          {{ buttonText }}
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import { EndpointDomains } from "../models/EndpointDomains";

export default {
  name: "SearchForm",
  props: ["parentAccountID"],
  data:() => ({
    accountID: "",
    accountIDRules: [
      (v) => !!v || "AccountID is required",
      (v) => v.length === 58 || "AccountID must be exactly 58 characters long",
    ],
    networks: EndpointDomains.apiNetworks,
    selectedNetwork: EndpointDomains.defaultNetwork,
    buttonText: "Build Graph",
    accountIDHistory: [],
  }),
  methods: {
    searchReady() {
      this.notify();
    },
    goBack() {
      const topAccountID = this.accountIDHistory.pop();
      const previousAccountID = this.accountIDHistory.pop();
      this.accountID = previousAccountID;
      this.notify();
    },
    notify() {
      this.$emit('searchReady', {accountID: this.accountID, network: this.selectedNetwork});
    }
  },
  watch: {
    parentAccountID: function(newVal, oldVal) {
      this.accountID = newVal;
      this.accountIDHistory.push(newVal);
    }
  },
  computed: {
    isDisabled() {
      // evaluate whatever you need to determine disabled here...
      return this.accountID.length === 58;
    }
  }
};
</script>

<style scoped>

.top-z {
  z-index: 101;
}
</style>