<template>
  <v-form v-model="valid">
    <v-container fluid>
      <v-row>
        <v-col cols="4">
          <v-form>
            <v-select
              v-model="selectedNetwork"
              item-text="name"
              item-value="domain"
              :items="networks"
              label="Select Network"
            ></v-select>

            <v-text-field
              v-model="accountID"
              :rules="accountIDRules"
              :counter="58"
              label="Algorand Account ID"
              required
            ></v-text-field>

            <v-select
              v-model="searchDepth"
              :items="searchDepths"
              label="Select Network Depth"
              hint="How many layers to search"
              persistent-hint
            ></v-select>

            <div>
              <br />
              <v-btn
                color="primary"
                elevation="2"
                large
                x-large
                v-on:click="search"
                :disabled="searching"
              >
                {{ buttonText }}
              </v-btn>
            </div>
          </v-form>
        </v-col>

        <v-col cols="8">
          <div class="cyHolder">
            <cytoscape :config="cyConfig"
                       :preConfig="preConfig"
                       :afterCreated="afterCreated">
                <cy-element
                  v-for="def in this.elements"
                  :key="`${def.data.id}`"
                  :definition="def"
                />
            </cytoscape>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import cola from "cytoscape-cola";
import { AlgorandGraphAPI } from "@/models/AlgorandGraphAPI";

export default {
  name: "AccountIDForm",
  data: () => ({
    valid: false,
    accountID: "A3XVEBGTEN6ZKUC3UO3BZ3BMVXCZ6TA4LO6R2LLYRYIRU5IHORXDJJVIOE",
    accountIDRules: [
      (v) => !!v || "AccountID is required",
      (v) => v.length >= 58 || "AccountID must be exactly than 58 characters",
    ],
    networks: [
      { name: "MainNet", domain: "mainnet-algorand.api.purestake.io" },
      { name: "TestNet", domain: "testnet-algorand.api.purestake.io" },
    ],
    selectedNetwork: {
      name: "TestNet",
      domain: "testnet-algorand.api.purestake.io",
    },
    searchDepth: 1,
    searchDepths: [0, 1, 2, 3, 4],
    searching: false,
    buttonText: "Build Graph for Account",
    apiKey: "pksIgccdqX9ADKvMLfVhf3hZqClM949951K9966v",
    requestURL: "",
    elements: [],
    cyConfig: {
      autounselectify: true,
      boxSelectionEnabled: false,
      layout: {
        name: "cola"
      },
      style: [
        {
          selector: "node",
          css: {
            "background-color": "#f92411"
          }
        },
        {
          selector: "edge",
          css: {
            "line-color": "#f92411"
          }
        }
      ]
    },
  }),
  methods: {
    async search() {
      let api = new AlgorandGraphAPI(this.selectedNetwork.domain)
      this.searching = true;
      this.buttonText = "Searching"
      this.elements = await api.accountIDGraphForRootAccountID(this.accountID)
      this.buttonText = "Build Graph for Account"
      this.searching = false;
    },
    preConfig(cytoscape) {
      console.log("calling pre-config");
      // cytoscape: this is the cytoscape constructor
      cytoscape.use(cola);
    },
    afterCreated(cy) {
      // cy: this is the cytoscape instance
      console.log("after created");
    },
  },
  components: {
    VueJsonPretty,
  },
};
</script>

<style scoped>
.cyHolder {
  width: 100%;
}
</style>
