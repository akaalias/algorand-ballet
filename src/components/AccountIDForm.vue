<template>
  <v-form v-model="valid">
    <v-container fluid>
      <v-row>
        <v-col cols="1">
            <v-select
              v-model="selectedNetwork"
              item-text="name"
              item-value="domain"
              :items="networks"
              label="Select Network"
            ></v-select>
        </v-col>
        <v-col cols="6">
            <v-text-field
              v-model="accountID"
              :rules="accountIDRules"
              :counter="58"
              label="Algorand Target Account ID"
              required
            ></v-text-field>
        </v-col>
        <v-col cols="2">
            <v-select
              v-model="searchDepth"
              :items="searchDepths"
              label="Select Network Depth"
              hint="How many layers to search"
              persistent-hint
            ></v-select>
        </v-col>

        <v-col cols="2">
              <v-btn
                color="primary"
                elevation="2"
                large
                v-on:click="search"
                :disabled="searching"
              >
                {{ buttonText }}
              </v-btn>
        </v-col>

        <v-col cols="12">
          <div class="cyHolder">
            <cytoscape :config="cyConfig"
                       :afterCreated="afterCreated">
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
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(label)',
            "text-valign": "center",
            "text-halign": "center",
            "text-outline-color": "#555",
            "text-outline-width": "2px",
            "color": "#fff"
          }
        }, {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'mid-target-arrow-color': '#ccc',
            'mid-target-arrow-shape': 'triangle',
          }
        }, {
        selector: 'node.root',
          style: {
            width: '50',
            height: '50',
            "background-color": 'yellow',
            'label': 'data(label)',
          }
        },
        {
          selector: 'node.transaction',
          style: {
            'shape': 'rectangle',
            "background-color": "green"
          }
        },
        {
          selector: 'node.account',
          style: {
            width: '50',
            height: '50',
            'shape': 'ellipse',
            'label': 'data(label)',
          }
        },
        {
          selector: 'edge.outgoing',
          style: {
            "line-color": "red",
            'mid-target-arrow-color': 'red',
          }
        },
        {
          selector: 'edge.incoming',
          style: {
            "line-color": "green",
            'mid-target-arrow-color': 'green',
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
      this.cy.add(this.elements)
      this.cy.layout({ name: "cose" }).run()
      this.buttonText = "Build Graph for Account"
      this.searching = false;
    },
    preConfig(cytoscape) {
      console.log("calling pre-config");
    },
    afterCreated(cy) {
      this.cy = cy
      this.addInitialNodes();
    },
    addInitialNodes() {
      this.cy.add(this.elements);
      this.cy.layout({ name: "circle" }).run();
    }
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
