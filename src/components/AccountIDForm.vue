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
                I've gotten mine from Purestake: It works really well, it's free for personal use and was easy to get via their <a href="https://developer.purestake.io/">Developer Portal</a>. (I have no affiliation with Purestake)
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
                    label="My API Key"
                    required
                    @keydown.enter.prevent="setAPIKey"
                  ></v-text-field>
                </v-col>
                  <v-col cols="3">
                    <v-btn :disabled="!isAPIKeyValid" @click="setAPIKey" color="primary"
                    >Set Key</v-btn>
                  </v-col>
              </v-row>
            </v-col>
            <v-col cols="4">
            </v-col>
          </v-row>
      </v-form>
      <div class="cyHolder" v-if="!!apiKey">
        <v-form v-if="!!apiKey" class="pl-4 pr-4">
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
                v-on:click="search"
                :disabled="searching"
                block
              >
                {{ buttonText }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
        <cytoscape :config="cyConfig" :afterCreated="afterCreated" v-if="elements.length !== 0"/>
        <v-card
          style="position: absolute; top: 100px; left: 25px; z-index: 10000; width: 200px;"
          tile
          v-if="elements.length !== 0"
        >
            <v-list>
              <v-subheader>LAYOUTS</v-subheader>
              <v-list-item-group
                color="primary"
              >
                <v-list-item>
                <v-select
                  v-model="selectedLayout"
                  :items="layouts"
                  single-line
                  v-on:change="changeLayout"
                >
                </v-select>
                </v-list-item>
              </v-list-item-group>

              <v-subheader>PARTICIPANTS</v-subheader>
              <v-list-item-group
                color="primary"
              >
              <v-list-item>
                <v-switch
                  v-model="rootNodeVisible"
                  inset
                  label="Target"
                  v-on:click="toggleRootNode"
                />
              </v-list-item>
                <v-list-item>
                    <v-switch
                      v-model="accountNodesVisible"
                      label="Accounts"
                      inset
                      v-on:click="toggleAccountNodes"
                    />
                </v-list-item>
                <v-list-item>
                  <v-switch
                    v-model="applicationNodesVisible"
                    label="Apps"
                    inset
                    v-on:click="toggleApplicationNodes"
                  />
                </v-list-item>
              </v-list-item-group>
              <v-subheader>TRANSACTIONS</v-subheader>
              <v-list-item-group
                color="secondary"
              >
                <v-list-item>
                  <v-switch
                    v-model="paymentTransactionsVisible"
                    label="Payments"
                    inset
                    v-on:click="togglePaymentTransactions"
                  />
                </v-list-item>
                <v-list-item>
                  <v-switch
                    v-model="assetTransferTransactionsVisible"
                    label="Assets"
                    inset
                    v-on:click="toggleAssetTransferTransactions"
                  />
                </v-list-item>
                <v-list-item>
                  <v-switch
                    v-model="applicationTransactionsVisible"
                    label="Apps"
                    inset
                    v-on:click="toggleApplicationTransactions"
                  />
                </v-list-item>
                <v-list-item>
                  <v-switch
                    v-model="transactionGroupsVisible"
                    label="Groups"
                    inset
                    v-on:click="toggleTransactionGroups"
                  />
                </v-list-item>

              </v-list-item-group>
            </v-list>
        </v-card>
      </div>
    </v-container>
</template>

<script>
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import { AlgorandGraphAPI } from "@/models/AlgorandGraphAPI";

export default {
  name: "AccountIDForm",
  data: () => ({
    apiKey: "pksIgccdqX9ADKvMLfVhf3hZqClM949951K9966v",
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
    layouts: ['grid', 'random', 'circle', 'concentric', 'breadthfirst', 'cose'],
    selectedLayout: 'concentric',
    searching: false,
    buttonText: "Build Graph",
    requestURL: "",
    elements: [],
    cyConfig: {
      style: [
        {
          selector: 'node',
          style: {
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
            'border-width': 2,
            'border-color': '#ccc',
            "shape": "roundrectangle",
            "label": "",
            "background-opacity": 0
          }
        }
      ]
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
    persistentAPI: null,
    transactionGroupsVisible: true
  }),
  methods: {
    async search() {
      this.persistentAPI = new AlgorandGraphAPI(this.selectedNetwork.domain)
      this.searching = true;
      this.rootNodeVisible = true
      this.accountNodesVisible = true
      this.applicationNodesVisible = true
      this.applicationTransactionsVisible = true
      this.paymentTransactionsVisible = true
      this.assetTransferTransactionsVisible = true
      this.transactionGroupsVisible = true

      this.elements = []
      this.buttonText = "Searching"
      this.elements = await this.persistentAPI.accountIDGraphForRootAccountID(this.accountID)
      this.buttonText = "Build Graph"
      this.searching = false
    },
    preConfig(cytoscape) {
      console.log("")
    },
    async afterCreated(cy) {
      this.cy = cy
      this.cy.add(this.elements);

      this.cy.on('taphold', 'node', function(evt){
        let node = evt.target;
        console.log(node);
        if(node.data().type == "account-node") {
          this.accountID = node.data().id
        }
      }.bind(this));

      this.cy.layout({name: this.selectedLayout}).run();
      document.getElementById("cytoscape-div").style.minHeight="680px";
      this.cy.resize();
      this.cy.fit();
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
    },
    toggleTransactionGroups() {
      if(!this.transactionGroupsVisible) {
        this.cy.$(':parent').style("border-opacity", "0")
      } else {
        this.cy.$(':parent').style("border-opacity", "1")
      }
    },
    changeLayout() {
      this.cy.layout({name: this.selectedLayout}).run();
      this.cy.resize();
      this.cy.fit();
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
  min-height: 700px;
}
</style>
