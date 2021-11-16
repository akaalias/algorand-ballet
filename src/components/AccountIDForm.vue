<template>
  <v-form v-model="valid">
    <v-container fluid>
      <v-row>
        <v-col cols="2">
            <v-select
              v-model="selectedNetwork"
              item-text="name"
              item-value="domain"
              :items="networks"
              label="Network"
              return-object
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
        <v-col cols="1">
            <v-select
              v-model="searchDepth"
              :items="searchDepths"
              label="Search Depth"
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
       </v-row>

      <v-row v-if="elements.length != 0">
        <v-col cols="2">
          <h1 class="text-sm-h6">Transactions</h1>
          <v-switch
            v-model="paymentTransactionsVisible"
            label="Payments"
            v-on:click="togglePaymentTransactions"
          />

          <v-switch
            v-model="assetTransferTransactionsVisible"
            label="Transfers"
            v-on:click="toggleAssetTransferTransactions"
          />

          <v-switch
            v-model="applicationTransactionsVisible"
            label="Applications"
            v-on:click="toggleApplicationTransactions"
          />

          <v-switch
            v-model="groupsVisible"
            label="Groups"
            v-on:click="toggleGroups"
          />

        </v-col>
        <v-col cols="10">
          <div class="cyHolder">
            <cytoscape :config="cyConfig"
                       :afterCreated="afterCreated"/>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <vue-json-pretty :data="jsonData">
          </vue-json-pretty>
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
    buttonText: "Build Graph",
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
            "text-outline-width": "3px",
            "color": "#fff",
          }
        }, {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
          }
        }, {
        selector: 'node.root',
          style: {
            width: '100',
            height: '100',
            "background-color": 'yellow',
            'label': 'data(label)',
            'border-width': 3,
            'border-color': "#555",
            'font-size': 18
          }
        },
        {
          selector: 'node.payment-transaction',
          style: {
            'shape': 'rectangle',
            "background-color": "green",
            width: '50',
            height: '50',
          }
        },
        {
          selector: 'node.asset-transfer-transaction',
          style: {
            'shape': 'triangle',
            "background-color": "orange",
            width: '50',
            height: '50',
          }
        },
        {
          selector: 'node.application-transaction',
          style: {
            'shape': 'diamond',
            "background-color": "blue",
            width: '50',
            height: '50',
          }
        },
        {
          selector: 'node.account',
          style: {
            width: '100',
            height: '100',
            'shape': 'ellipse',
            'label': 'data(label)',
          }
        },
        {
          selector: 'node.application',
          style: {
            width: '100',
            height: '100',
            'shape': 'diamond',
            "background-color": "blue",
            'label': 'data(label)',
          }
        },
        {
          selector: 'edge.outgoing',
          style: {
            "line-color": "red",
            'mid-target-arrow-shape': 'triangle',
            'mid-target-arrow-color': 'red',
          }
        },
        {
          selector: 'edge.application-call',
          style: {
            "line-color": "lightblue",
          }
        },
        {
          selector: 'edge.incoming',
          style: {
            "line-color": "green",
            'mid-target-arrow-shape': 'triangle',
            'mid-target-arrow-color': 'green',
          }
        },
        {
          selector: 'node.group',
          style: {
            "background-color": "lightgray",
            "shape": "round-rectangle",
            "text-valign": "top",
            "text-halign": "center",
            "text-outline-width": "0px",
            "color": "gray",
            "font-size": "8px",
            'label': 'data(label)',
          }
        }
      ]
    },
    paymentTransactionsVisible: true,
    assetTransferTransactionsVisible: true,
    applicationTransactionsVisible: true,
    groupsVisible: true,
    jsonData: ""
  }),
  methods: {
    async search() {
      let api = new AlgorandGraphAPI(this.selectedNetwork.domain)
      this.searching = true;
      this.buttonText = "Searching"

      this.elements = await api.accountIDGraphForRootAccountID(this.accountID)

      if(!(this.cy == undefined)) {
        this.cy.removeData()
        this.cy.add(this.elements)
        this.cy.layout({ name: "concentric",
          spacingFactor: 2,
          concentric: function( node ){ // returns numeric value for each node, placing higher nodes in levels towards the centre
            return node.data().distanceFromCenter
          }}).run()
      }
      this.buttonText = "Build Graph"
      this.searching = false
    },
    preConfig(cytoscape) {
      console.log("")
    },
    afterCreated(cy) {
      this.cy = cy
      this.addInitialNodes()
      this.cy.on('tap', 'node', function(evt){
        var node = evt.target;
        if(node.data().json != null) {
          this.jsonData = node.data().json
        } else {
          this.jsonData = node.data()
        }
      }.bind(this))
    },
    addInitialNodes() {
      this.cy.add(this.elements);
      this.cy.layout({ name: "circle" }).run();
    },
    togglePaymentTransactions() {
      if(!this.paymentTransactionsVisible) {
        this.cy.$('.payment-transaction').style("display","none");
      } else {
        this.cy.$('.payment-transaction').style("display","element");
      }
    },
    toggleAssetTransferTransactions() {
      if(!this.assetTransferTransactionsVisible) {
        this.cy.$('.asset-transfer-transaction').style("display","none");
      } else {
        this.cy.$('.asset-transfer-transaction').style("display","element");
      }
    },
    toggleApplicationTransactions() {
      if(!this.applicationTransactionsVisible) {
        this.cy.$('.application-transaction').style("display","none");
      } else {
        this.cy.$('.application-transaction').style("display","element");
      }
    },
    toggleGroups() {
      if(!this.groupsVisible) {
        this.cy.$('.group').style("display","none");
      } else {
        this.cy.$('.group').style("display","element");
      }
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
  height: 100%;
  display: block;
  border: 1px solid #ccc;
}
</style>
