<template>
  <v-form id="searchForm">
    <v-row  v-if="accountIDHistory.length < 1" id="landingpage">
      <v-col cols="11" class="hero">
        <h1>
          Qualitative Blockchain Analysis
          for Algorand Investors
        </h1>

        <p>
          <b>Make your best-informed decision before interacting with an untrusted wallet.</b>
          <br>
          Get a sense of a wallet's "personality" based on their track-record of past transactions and relationships
          with other wallets, ASAs and applications.
        </p>
        <br>
        <v-btn class="cta"
               v-bind:href="currentDeepLink.url"
               color="primary"
               elevation="5"
        >
          Jump right in with this example!
        </v-btn>
         &nbsp; or &nbsp;
        <v-btn
               @click="notifyToShowInformationOverlay"
               outlined
               plain
               >
          Learn more about Ballet
        </v-btn>
      </v-col>
    </v-row>

    <v-row  v-if="accountIDHistory.length >= 1">
      <v-col cols="1" class="pt-8">
        <div class="align-right"
             v-if="accountIDHistory.length < 1"
        >
          Start
          <v-icon>
            mdi-chevron-right
          </v-icon>

        </div>
        <v-btn
        small
        @click="goBack"
        v-if="accountIDHistory.length > 1"
        >
          <v-icon>
            mdi-chevron-left
          </v-icon>
        </v-btn>
      </v-col>
      <v-col cols="7">
        <v-text-field
          v-model="accountID"
          :rules="accountIDRules"
          label="Enter an Algorand Account ID"
          required
          single-line
          clearable
          class="top-z"
        ></v-text-field>
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
      <v-col class="pt-7"
             cols="2"
      >
        <v-btn
          color="primary"
          elevation="2"
          v-on:click="searchReady"
          :disabled="isDisabled ? false : true"
          class="top-z"
          block
        >
          <v-icon>mdi-search-web</v-icon>

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
    buttonText: "Search",
    accountIDHistory: [],
    exampleDeepLinks: [ {
                          walletID: "YHFIMNQB2HSDWPH3LKMGZK7TTSVWPS44RBLKFBO5JAUD52EXPGTQGICWZY",
                          url: "/algorand-ballet/?deeplink=true&network=main&accountid=YHFIMNQB2HSDWPH3LKMGZK7TTSVWPS44RBLKFBO5JAUD52EXPGTQGICWZY&focus=graph&layout=concentric"
                        }
                        ],
    currentDeepLink: {}
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
    },
    calculateColumnsForSearchButton() {
      if(accountIDHistory.length > 1) {
        return 2
      } else {
        return 3
      }
    },
    getRandomDeepLink() {
      return this.exampleDeepLinks[Math.floor(Math.random() * this.exampleDeepLinks.length)];
    },
    notifyToShowInformationOverlay() {
      this.$emit('showInformationOverlay', {});
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
  },
  mounted: function() {
    const networkParam = this.$route.query.network;
    if(!!networkParam) {
      const network = EndpointDomains.getNetworkForKey(networkParam)
      if(!!network) {
        this.selectedNetwork = network;
      }
    }

    const accountIDParam = this.$route.query.accountid;
    if(!!accountIDParam && accountIDParam.length === 58) {
      this.accountID = accountIDParam;
      this.searchReady();
    }

    this.currentDeepLink = this.getRandomDeepLink();
  }
};
</script>

<style scoped>

.top-z {
  z-index: 101;
}

.align-right {
  text-align: right;
}

.hero {
  text-align: center;
  height: 200px;
}

.hero h1 {
  padding-top: 20px;
  font-size: 36pt;
  letter-spacing: -1.5pt;
}

.hero p {
  font-size: 18pt;
  padding-left: 100px;
  padding-right: 100px;
}

.hero b {
  font-weight: normal;
  text-decoration: underline;
}

#landingpage {
  padding-bottom: 120px;
}
</style>