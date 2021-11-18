<template>
    <v-container id="container" fluid>
      <v-form v-if="apiKey === ''">
          <v-row align="center">
            <v-col cols="4">
            </v-col>
            <v-col cols="4">
              <h1 class="text-h6">Please configure your API Key</h1>
              <p>
                Hi there!

                To use the explorer you need access to Algorand's data via an API key.
              </p>

              <p>
                I've gotten my key at Purestake: It works really well, it's free for personal use and was easy to get via their <a href="https://developer.purestake.io/">Developer Portal</a>. (I have no affiliation with Purestake)
              </p>

              <p>
                After signing up, please copy and paste your key below. It will be stored locally for the duration of your session.
              </p>

              <v-divider>
              </v-divider>
              <v-row class="light-blue lighten-5">
                <v-col cols="9">
                  <v-text-field
                    v-model="userAPIKey"
                    :rules="userAPIKeyRules"
                    :counter="40"
                    label="My API Key"
                    required
                    @keydown.enter.prevent="setAPIKey"
                  ></v-text-field>
                </v-col>
                  <v-col cols="3">
                    <v-btn :disabled="!isAPIKeyValid" @click="setAPIKey" primary>Set Key</v-btn>
                  </v-col>
              </v-row>
            </v-col>
            <v-col cols="4">
            </v-col>
          </v-row>
      </v-form>

      <v-form v-if="!!apiKey">
        <v-row>
          <v-col cols="1">
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
          <v-col cols="2">
            <v-btn
              color="primary"
              elevation="2"
              large
              v-on:click="search"
              :disabled="searching"
              block
            >
              {{ buttonText }}
            </v-btn>
            <small class="align-center">
            API Key: {{apiKey.substring(0, 8) + "..." + apiKey.substring(32, 39)}}
            </small>
          </v-col>
        </v-row>
      </v-form>

      <v-row>
        <v-col cols="12" class="cyHolder" v-if="elements.length !== 0">
            <cytoscape :config="cyConfig" :afterCreated="afterCreated" />
        </v-col>
      </v-row>

      <v-row v-if="elements.length !== 0">
        <v-col cols="2">
          <v-row>
            <v-col cols="6">
              <h1 class="text-body-1">Nodes</h1>
              <v-switch
                v-model="rootNodeVisible"
                label="Target"
                class="text-body-1"
                v-on:click="toggleRootNode"
              />

              <v-switch
                v-model="accountNodesVisible"
                label="Accounts"
                v-on:click="toggleAccountNodes"
              />

              <v-switch
                v-model="applicationNodesVisible"
                label="Apps"
                v-on:click="toggleApplicationNodes"
              />
            </v-col>
            <v-col cols="6">
              <h1 class="text-body-1">Transactions</h1>
              <v-switch
                v-model="paymentTransactionsVisible"
                label="Payments"
                class="text-sm-body-1"
                v-on:click="togglePaymentTransactions"
              />

              <v-switch
                v-model="assetTransferTransactionsVisible"
                label="Assets"
                v-on:click="toggleAssetTransferTransactions"
              />

              <v-switch
                v-model="applicationTransactionsVisible"
                label="Apps"
                v-on:click="toggleApplicationTransactions"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="1">
        </v-col>
        <v-col cols="9">
          <h1 class="text-body-1">Element JSON</h1>

          <vue-json-pretty :data="jsonData">
          </vue-json-pretty>
        </v-col>
      </v-row>
    </v-container>
</template>

<script>
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import { AlgorandGraphAPI } from "@/models/AlgorandGraphAPI";

export default {
  name: "AccountIDForm",
  data: () => ({
    apiKey: "",
    userAPIKey: "",
    userAPIKeyRules: [
      (v) => !!v || "API Key is required",
      (v) => v.length == 40 || "API Key must be exactly 40 characters",
    ],
    accountID: "A3XVEBGTEN6ZKUC3UO3BZ3BMVXCZ6TA4LO6R2LLYRYIRU5IHORXDJJVIOE",
    accountIDRules: [
      (v) => !!v || "AccountID is required",
      (v) => v.length == 58 || "AccountID must be exactly 58 characters long",
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
          selector: ':parent',
          style: {
            'border-width': 1,
            "background-color": "white",
            "shape": "roundrectangle",
            "label": ""
          }
        }
      ]
    },
    concentricOptions: {
      name: 'concentric',
      // fit: true, // whether to fit the viewport to the graph
      padding: 30, // the padding on fit
      startAngle: 3 / 2 * Math.PI, // where nodes start in radians
      sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
      clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
      equidistant: false, // whether levels have an equal radial distance betwen them, may cause bounding box overflow
      minNodeSpacing: 50, // min spacing between outside of nodes (used for radius adjustment)
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
      nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
      width: "100%", // width of layout area (overrides container width)
      spacingFactor: 1, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
      concentric: function( node ){ // returns numeric value for each node, placing higher nodes in levels towards the centre
        return node.degree()
      },
      levelWidth: function( nodes ){ // the variation of concentric values in each level
        return nodes.maxDegree() / 4;
      },
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop
      transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
    },
    paymentTransactionsVisible: true,
    assetTransferTransactionsVisible: true,
    applicationTransactionsVisible: true,
    groupNodesVisible: true,
    accountNodesVisible: true,
    applicationNodesVisible: true,
    rootNodeVisible: true,
    jsonData: "",
    dialog: false,
  }),
  methods: {
    async search() {
      let api = new AlgorandGraphAPI(this.selectedNetwork.domain)
      this.searching = true;
      this.elements = []
      this.buttonText = "Searching"

      this.elements = await api.accountIDGraphForRootAccountID(this.accountID)
      this.buttonText = "Build Graph"
      this.searching = false

      if(!(this.cy == undefined)) {
        this.cy.add(this.elements);
        this.cy.layout(this.concentricOptions).run();
        // this.cy.resize();
        this.cy.fit();
      }
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
      this.cy.layout(this.concentricOptions).run();
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
    toggleAccountNodes() {
      if(!this.accountNodesVisible) {
        this.cy.$('.account').style("display","none");
      } else {
        this.cy.$('.account').style("display","element");
      }
    },
    toggleApplicationNodes() {
      if(!this.applicationNodesVisible) {
        this.cy.$('.application').style("display","none");
      } else {
        this.cy.$('.application').style("display","element");
      }
    },
    toggleGroupNodes() {
      if(!this.groupNodesVisible) {
        this.cy.$('.group').style("display","none");
      } else {
        this.cy.$('.group').style("display","element");
      }
    },
    toggleRootNode() {
      if(!this.rootNodeVisible) {
        this.cy.$('.root').style("display","none");
      } else {
        this.cy.$('.root').style("display","element");
      }
    },
    setAPIKey() {
      if(this.userAPIKey.length == 40) {
        this.apiKey = this.userAPIKey
      }
    }
  },
  computed: {
    isAPIKeyValid() {
      return this.userAPIKey.length == 40
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
  border: 1px solid #ccc;
  background-color: aliceblue;
}

#searchForm {
  margin-bottom: 20px;
}

#container {
  height: 100%;
}
</style>
