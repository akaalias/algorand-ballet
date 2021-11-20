<template>
  <v-container id="container" fluid>
    <v-form v-if="apiKey === ''">
      <v-row align="center">
        <v-col cols="4"> </v-col>
        <v-col cols="4">
          <h1 class="text-h6">Please configure your API Key</h1>
          <p>
            Hi there! To use the explorer you need access to Algorand's data via
            an API key.
          </p>

          <p>
            I've gotten mine from Purestake: It works really well, it's free for
            personal use and was easy to get via their
            <a href="https://developer.purestake.io/">Developer Portal</a>. (I
            have no affiliation with Purestake)
          </p>

          <p>
            After signing up, please copy and paste your key below. It will be
            stored locally for the duration of your session.
          </p>

          <br/>
          <v-row class="">
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
              <v-btn
                :disabled="!isAPIKeyValid"
                @click="setAPIKey"
                color="primary"
                >Set Key</v-btn
              >
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="4"> </v-col>
      </v-row>
    </v-form>
    <div class="cyHolder" v-if="!!apiKey">
      <v-form v-if="!!apiKey" class="pl-4 pr-4" id="searchForm">
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
              v-on:click="search"
              :disabled="searching"
              block
            >
              {{ buttonText }}
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
      <cytoscape
        :config="cyConfig"
        :preConfig="preConfig"
        :afterCreated="afterCreated"
        v-if="elements.length !== 0"
      />
      <v-card id="graphMenuCard" tile v-if="elements.length !== 0">
        <v-list>
          <v-subheader>FOCUS</v-subheader>
          <v-list-item-group color="primary">
            <v-list-item>
              <v-select
                v-model="selectedFocus"
                item-text="name"
                item-value="focus"
                :items="focuses"
                label="Focus"
                single-line
                return-object
                v-on:change="search"
              ></v-select>
            </v-list-item>
          </v-list-item-group>

          <v-subheader>LAYOUTS</v-subheader>
          <v-list-item-group color="primary">
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
          <v-list-item-group>
            <v-list-item class="rootNodeVisible">
              <v-switch
                v-model="rootNodeVisible"
                inset
                label="Target"
                v-on:click="toggleRootNode"
              />
            </v-list-item>
            <v-list-item class="accountNodesVisible">
              <v-switch
                v-model="accountNodesVisible"
                label="Accounts"
                inset
                v-on:click="toggleAccountNodes"
              />
            </v-list-item>
            <v-list-item class="assetNodesVisible">
              <v-switch
                v-model="assetNodesVisible"
                label="Assets"
                inset
                v-on:click="toggleAssetNodes"
              />
            </v-list-item>
            <v-list-item class="applicationNodesVisible">
              <v-switch
                v-model="applicationNodesVisible"
                label="Apps"
                inset
                v-on:click="toggleApplicationNodes"
              />
            </v-list-item>
          </v-list-item-group>
          <v-subheader>TRANSACTIONS</v-subheader>
          <v-list-item-group color="secondary">
            <v-list-item class="paymentTransactionsVisible">
              <v-switch
                v-model="paymentTransactionsVisible"
                label="Payments"
                inset
                v-on:click="togglePaymentTransactions"
              />
            </v-list-item>
            <v-list-item class="assetTransferTransactionsVisible">
              <v-switch
                v-model="assetTransferTransactionsVisible"
                label="Assets"
                inset
                v-on:click="toggleAssetTransferTransactions"
              />
            </v-list-item>
            <v-list-item class="applicationTransactionsVisible">
              <v-switch
                v-model="applicationTransactionsVisible"
                label="Apps"
                inset
                v-on:click="toggleApplicationTransactions"
              />
            </v-list-item>
            <v-list-item class="transactionGroupsVisible">
              <v-switch
                v-model="transactionGroupsVisible"
                label="Groups"
                inset
                v-on:click="toggleTransactionGroups"
              />
            </v-list-item>
          </v-list-item-group>

          <v-list-item class="exportPNG">
            <v-btn v-on:click="exportPNG"> Export PNG </v-btn>
          </v-list-item>
        </v-list>
      </v-card>
    </div>
  </v-container>
</template>

<script>
import VueJsonPretty from "vue-json-pretty/lib/vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import { AlgorandGraphAPI } from "@/models/AlgorandGraphAPI";
import cola from "cytoscape-cola";

export default {
  name: "AccountIDForm",
  data: () => ({
    apiKey: "pksIgccdqX9ADKvMLfVhf3hZqClM949951K9966v",
    userAPIKey: "",
    userAPIKeyRules: [
      (v) => !!v || "API Key is required",
      (v) => v.length === 40 || "API Key must be exactly 40 characters",
    ],
    accountID: "A3XVEBGTEN6ZKUC3UO3BZ3BMVXCZ6TA4LO6R2LLYRYIRU5IHORXDJJVIOE",
    accountIDRules: [
      (v) => !!v || "AccountID is required",
      (v) => v.length === 58 || "AccountID must be exactly 58 characters long",
    ],
    focuses: [{name: "Network of Transactions", focus: "network"}, {name: "Graph of Relationships", focus: "graph"}],
    selectedFocus: {name: "Network of Transactions", focus: "network"},
    networks: [
      {
        name: "MainNet",
        domain: "mainnet-algorand.api.purestake.io",
        algoExplorerDomain: "algoexplorer.io",
      },
      {
        name: "TestNet",
        domain: "testnet-algorand.api.purestake.io",
        algoExplorerDomain: "testnet.algoexplorer.io",
      },
    ],
    selectedNetwork: {
      name: "TestNet",
      domain: "testnet-algorand.api.purestake.io",
      algoExplorerDomain: "testnet.algoexplorer.io",
    },
    layouts: [
      "grid",
      "random",
      "circle",
      "concentric",
      "breadthfirst",
      "cose",
      "cola",
    ],
    selectedLayout: "concentric",
    searching: false,
    buttonText: "Build Graph",
    requestURL: "",
    elements: [],
    cyConfig: {
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            "text-outline-color": "#555",
            "text-outline-width": "3px",
            color: "#fff",
          },
        },
        {
          selector: "edge",
          style: {
            width: 3,
            "line-color": "#ccc",
          },
        },
        {
          selector: "node.root",
          style: {
            width: "150",
            height: "150",
            "background-color": "#ffa600",
            label: "data(label)",
            "font-size": 20,
          },
        },
        {
          selector: "node.account",
          style: {
            width: "100",
            height: "100",
            shape: "ellipse",
            label: "data(label)",
            "background-color": "#ff7c43",
          },
        },
        {
          selector: "node.application",
          style: {
            width: "100",
            height: "100",
            shape: "diamond",
            "background-color": "#003f5c",
            label: "data(label)",
          },
        },
        {
          selector: "node.asset",
          style: {
            width: "100",
            height: "100",
            shape: "triangle",
            "background-color": "#6e3866",
            label: "data(label)",
          },
        },
        {
          selector: "node.payment-transaction",
          style: {
            shape: "rectangle",
            "background-color": "#f95d6a",
            width: "50",
            height: "50",
          },
        },
        {
          selector: "node.asset-transfer-transaction",
          style: {
            shape: "triangle",
            "background-color": "#a05195",
            width: "50",
            height: "50",
          },
        },
        {
          selector: "node.application-transaction",
          style: {
            shape: "diamond",
            "background-color": "#2f4b7c",
            width: "50",
            height: "50",
          },
        },
        {
          selector: "edge.outgoing-payment",
          style: {
            "line-color": "#f95d6a",
            "mid-target-arrow-shape": "triangle",
            "mid-target-arrow-color": "#f95d6a",
            "arrow-scale": 1.5,
          },
        },
        {
          selector: "edge.incoming-payment",
          style: {
            "line-color": "#008a0b",
            "mid-target-arrow-shape": "triangle",
            "mid-target-arrow-color": "#008a0b",
            "arrow-scale": 1.5,
          },
        },
        {
          selector: "edge.outgoing-asset",
          style: {
            "line-color": "#800000",
            "mid-target-arrow-shape": "triangle",
            "mid-target-arrow-color": "#800000",
            "arrow-scale": 1.5,
          },
        },
        {
          selector: "edge.incoming-asset",
          style: {
            "line-color": "#008a0b",
            "mid-target-arrow-shape": "triangle",
            "mid-target-arrow-color": "#008a0b",
            "arrow-scale": 1.5,
          },
        },
        {
          selector: "edge.application-call",
          style: {
            "line-color": "#565589",
          },
        },
        {
          selector: "edge.asset-call",
          style: {
            "line-color": "#40203b",
          },
        },
        {
          selector: ":parent",
          style: {
            "border-width": 2,
            "border-color": "#333",
            shape: "roundrectangle",
            label: "",
            "background-opacity": 0,
          },
        },
        {
          selector: "edge.relationship",
          style: {
            width: "data(weight)",
            "line-color": "#008a0b",
            "curve-style": "unbundled-bezier",
            "haystack-radius": "0.4",
          },
        },
        {
          selector: "edge.loop",
          style: {
            width: "data(weight)",
            "line-color": "red",
            'curve-style': 'unbundled-bezier',
            'loop-direction': '90deg',
            'loop-sweep': '-90deg',
            'target-endpoint': '90deg',
            'source-endpoint': '105deg',
          },
        },
        {
          selector: "edge.application-relationship",
          style: {
            width: "data(weight)",
            "line-color": "#565589",
            "curve-style": "unbundled-bezier",
            "control-point-weights": [0,0.3],
            "haystack-radius": "0.2"
          },
        },
      ],
    },
    paymentTransactionsVisible: true,
    assetTransferTransactionsVisible: true,
    applicationTransactionsVisible: true,
    groupNodesVisible: true,
    accountNodesVisible: true,
    applicationNodesVisible: true,
    rootNodeVisible: true,
    assetNodesVisible: true,
    jsonData: "",
    dialog: false,
    persistentAPI: null,
    transactionGroupsVisible: true,
    deepLinkID: "",
  }),
  methods: {
    async updateGraph() {
      console.log("In updateGraph()");
      console.log("this.selectedFocus.focus: " + this.selectedFocus.focus);
      this.persistentAPI = new AlgorandGraphAPI(this.selectedNetwork.domain);
      if(this.selectedFocus.focus === "network") {
        console.log("Calling: this.persistentAPI.networkForRootAccountID");
        this.elements = [];
        this.elements = await this.persistentAPI.networkForRootAccountID(this.accountID);
      } else if (this.selectedFocus.focus === "graph") {
        this.elements = [];
        console.log("Calling: this.persistentAPI.graphForRootAccountID");
        this.elements = await this.persistentAPI.graphForRootAccountID(this.accountID);
      } else {
        console.log("No focus set...");
      }
      this.searching = false;
    },
    async search() {
      this.buttonText = "Searching";
      await this.updateGraph();
      this.buttonText = "Build Graph";
    },
    preConfig(cytoscape) {
      console.log("");
      cytoscape.use(cola);
    },
    async afterCreated(cy) {
      this.cy = cy;
      this.cy.add(this.elements);
      this.cy.on(
        "taphold",
        "node",
        function (evt) {
          let node = evt.target;
          if (node.data().type === "account-node") {
            this.accountID = node.data().id;
          }
        }.bind(this)
      );

      // open node info on algoexplorer
      this.cy.on(
        "cxttapstart",
        "node",
        function (evt) {
          let node = evt.target;
          let url = "https://" + this.selectedNetwork.algoExplorerDomain;

          const type = node.data().type;
          // Account Node
          if (type === "account-node") {
            url = url + "/address/" + node.data().id;
          }
          // App Node
          if (type === "application-node") {
            url = url + "/application/" + node.data().id;
          }
          // App Node
          if (type === "asset-node") {
            url = url + "/asset/" + node.data().id;
          }
          // TXs
          if (
            type === "payment-transaction-node" ||
            type === "asset-transfer-transaction-node" ||
            type === "application-transaction-node"
          ) {
            url = url + "/tx/" + node.data().id;
          }
          console.log(url);
          window.open(url, "_blank", "minimizable=false").focus();
        }.bind(this)
      );

      this.cy.layout({ name: this.selectedLayout }).run();
      document.getElementById("cytoscape-div").style.minHeight = "800px";

      this.toggleRootNode();
      this.toggleAccountNodes();
      this.toggleAssetNodes();
      this.toggleApplicationNodes();

      this.togglePaymentTransactions();
      this.toggleAssetTransferTransactions();
      this.toggleApplicationTransactions();
      this.toggleTransactionGroups();

      this.cy.resize();
      this.cy.fit();
    },
    togglePaymentTransactions() {
      if (!this.paymentTransactionsVisible) {
        this.cy.$(".payment-transaction").style("display", "none");
      } else {
        this.cy.$(".payment-transaction").style("display", "element");
      }
    },
    toggleAssetTransferTransactions() {
      if (!this.assetTransferTransactionsVisible) {
        this.cy.$(".asset-transfer-transaction").style("display", "none");
      } else {
        this.cy.$(".asset-transfer-transaction").style("display", "element");
      }
    },
    toggleApplicationTransactions() {
      if (!this.applicationTransactionsVisible) {
        this.cy.$(".application-transaction").style("display", "none");
      } else {
        this.cy.$(".application-transaction").style("display", "element");
      }
    },
    toggleAccountNodes() {
      if (!this.accountNodesVisible) {
        this.cy.$(".account").style("display", "none");
      } else {
        this.cy.$(".account").style("display", "element");
      }
    },
    toggleApplicationNodes() {
      if (!this.applicationNodesVisible) {
        this.cy.$(".application").style("display", "none");
      } else {
        this.cy.$(".application").style("display", "element");
      }
    },
    toggleGroupNodes() {
      if (!this.groupNodesVisible) {
        this.cy.$(".group").style("display", "none");
      } else {
        this.cy.$(".group").style("display", "element");
      }
    },
    toggleRootNode() {
      if (!this.rootNodeVisible) {
        this.cy.$(".root").style("display", "none");
      } else {
        this.cy.$(".root").style("display", "element");
      }
    },
    toggleAssetNodes() {
      if (!this.assetNodesVisible) {
        this.cy.$(".asset").style("display", "none");
      } else {
        this.cy.$(".asset").style("display", "element");
      }
    },
    setAPIKey() {
      if (this.userAPIKey.length == 40) {
        this.apiKey = this.userAPIKey;
      }
    },
    toggleTransactionGroups() {
      if (!this.transactionGroupsVisible) {
        this.cy.$(":parent").style("border-opacity", "0");
      } else {
        this.cy.$(":parent").style("border-opacity", "1");
      }
    },
    changeLayout() {
      this.cy.layout({ name: this.selectedLayout, animate: true }).run();
      this.cy.resize();
      this.cy.fit();
    },
    exportPNG() {
      const img = this.cy.png();
      window.open(img, "_blank");
    },
  },
  computed: {
    isAPIKeyValid() {
      return this.userAPIKey.length == 40;
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

.rootNodeVisible {
  max-height: 30px;
  border-left: 2px solid #ffa600;
}

.accountNodesVisible {
  max-height: 30px;
  border-left: 2px solid #ff7c43;
}

.applicationNodesVisible {
  max-height: 30px;
  border-left: 2px solid #2f4b7c;
}

.paymentTransactionsVisible {
  max-height: 30px;
  border-left: 2px solid #f95d6a;
}

.assetTransferTransactionsVisible {
  max-height: 30px;
  border-left: 2px solid #a05195;
}

.applicationTransactionsVisible {
  max-height: 30px;
  border-left: 2px solid #2f4b7c;
}

.transactionGroupsVisible {
  max-height: 30px;
  border-left: 2px solid #333;
}

.assetNodesVisible {
  max-height: 30px;
  border-left: 2px solid #a05195;
}

#graphMenuCard {
  position: absolute;
  top: 90px;
  left: 25px;
  z-index: 100;
  width: 180px;
}

.top-z {
  z-index: 101;
}
</style>
