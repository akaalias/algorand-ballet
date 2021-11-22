<template>
  <v-container id="container" fluid>

    <APIKeyForm
      v-if="apiKey === ''"
      @apiKeySet="setMyAPIKey($event)"
    />

    <div class="cyHolder" v-if="apiKey !== ''">

      <SearchForm :accountID="accountID" @searchReady="startSearch($event)"/>

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
                :items="layoutConfigurationKeys"
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
import cola from "cytoscape-cola";
import "vue-json-pretty/lib/styles.css";
import { AlgorandGraphAPI } from "@/models/AlgorandGraphAPI";
import { CytoscapeConfig } from "@/models/CytoscapeConfig";
import { AlgorandAPIConfig } from "@/models/AlgorandAPIConfig";
import { QualitativeResearchApproach } from "@/models/QualitativeResearchApproach";
import APIKeyForm from "@/components/APIKeyForm";
import SearchForm from "@/components/SearchForm";

export default {
  name: "AccountIDForm",
  data: () => ({
    apiKey: "",
    accountID: "Y74RXNAUAZT2U5PD57Y22NVU6UPW5WNLRLHA763EE5IJSLSJXRAX6YY4OE",
    selectedNetwork: AlgorandAPIConfig.defaultNetwork,

    focuses: QualitativeResearchApproach.researchApproaches,
    selectedFocus: QualitativeResearchApproach.defaultResearchApproach,

    selectedLayout: CytoscapeConfig.defaultLayoutName,
    cyConfig: CytoscapeConfig.cyConfig,
    layoutConfigurations: CytoscapeConfig.layoutConfigurations,
    elements: [],
    paymentTransactionsVisible: true,
    assetTransferTransactionsVisible: true,
    applicationTransactionsVisible: true,
    groupNodesVisible: true,
    accountNodesVisible: true,
    applicationNodesVisible: true,
    rootNodeVisible: true,
    assetNodesVisible: true,
    algorandAPI: null,
    transactionGroupsVisible: true,
    deepLinkID: "",
    doubleClickDelayMs: 350,
    previousTapStamp: 0,
  }),
  methods: {
    async updateGraph() {
      this.algorandAPI = new AlgorandGraphAPI(this.selectedNetwork.domain);
      if (this.selectedFocus.focus === "network") {
        this.elements = [];
        this.elements = await this.algorandAPI.networkForRootAccountID(
          this.accountID
        );
      } else if (this.selectedFocus.focus === "graph") {
        this.elements = [];
        this.elements = await this.algorandAPI.graphForRootAccountID(
          this.accountID
        );
      }

      this.searching = false;
    },
    async search() {
      this.buttonText = "Searching";
      await this.updateGraph();
      this.buttonText = "Build Graph";
    },
    preConfig(cytoscape) {
      cytoscape.use(cola);
    },
    async afterCreated(cy) {
      this.cy = cy;
      this.cy.add(this.elements);
      this.cy.on(
        "doubleTap",
        "node",
        function (evt) {
          let node = evt.target;
          if (node.data().type === "account-node") {
            this.accountID = node.data().id;
          } else {
            console.log("Unsure how to handle taphold for this node");
          }
        }.bind(this)
      );

      // handle double click node info on algoexplorer
      this.cy.on(
        "tap",
        "node",
        function (evt) {
          const currentTapStamp = evt.timeStamp;
          const msFromLastTap = currentTapStamp - this.previousTapStamp;
          if (msFromLastTap < this.doubleClickDelayMs) {
            evt.target.trigger("doubleTap", evt);
          }
          this.previousTapStamp = currentTapStamp;
        }.bind(this)
      );

      this.cy.on(
        "taphold",
        "node",
        function (event, orignalEvent) {
          let node = event.target;
          let url = "https://" + this.selectedNetwork.algoExplorerDomain;

          const type = node.data().type;
          // Account Node
          if (type === "account-node") {
            url = url + "/address/" + node.data().id;
          } else if (type === "application-node") {
            url = url + "/application/" + node.data().id;
          } else if (type === "asset-node") {
            url = url + "/asset/" + node.data().id;
          } else if (
            type === "payment-transaction-node" ||
            type === "asset-transfer-transaction-node" ||
            type === "application-transaction-node"
          ) {
            url = url + "/tx/" + node.data().id;
          } else {
            console.log("Unsure how to handle this node");
          }
          console.log(url);
          window.open(url, "_blank", "minimizable=false").focus();
        }.bind(this)
      );

      this.cy.layout(this.layoutConfigurations[this.selectedLayout]).run();
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
        this.cy
          .$(".payment-transaction, .payment-relationship")
          .style("display", "none");
      } else {
        this.cy
          .$(".payment-transaction, .payment-relationship")
          .style("display", "element");
      }
    },
    toggleAssetTransferTransactions() {
      if (!this.assetTransferTransactionsVisible) {
        this.cy
          .$(".asset-transfer-transaction, .asset-relationship")
          .style("display", "none");
      } else {
        this.cy
          .$(".asset-transfer-transaction, .asset-relationship")
          .style("display", "element");
      }
    },
    toggleApplicationTransactions() {
      if (!this.applicationTransactionsVisible) {
        this.cy
          .$(".application-transaction, .application-relationship")
          .style("display", "none");
      } else {
        this.cy
          .$(".application-transaction, .application-relationship")
          .style("display", "element");
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
    setMyAPIKey(key) {
      console.log("News from sub-component!");
      this.apiKey = key;
    },
    startSearch(event) {
      this.accountID = event.accountID;
      this.selectedNetwork = event.network;
      this.search();
    },
    toggleTransactionGroups() {
      if (!this.transactionGroupsVisible) {
        this.cy.$(":parent").style("border-opacity", "0");
      } else {
        this.cy.$(":parent").style("border-opacity", "1");
      }
    },
    changeLayout() {
      this.cy.layout(this.layoutConfigurations[this.selectedLayout]).run();
      this.cy.resize();
      this.cy.fit();
    },
    async exportPNG() {
      Promise.resolve(this.cy.png({ output: "blob-promise" })).then(
        (result) => {
          var image = new Image();
          image.src = URL.createObjectURL(result);

          window.open(image.src, "_blank");
        }
      );
    },
  },
  computed: {
    layoutConfigurationKeys() {
      return Object.keys(this.layoutConfigurations);
    },
  },
  components: {
    SearchForm,
    VueJsonPretty,
    APIKeyForm,
  },
};
</script>

<style scoped>
.cyHolder {
  min-height: 700px;
}

#graphMenuCard {
  position: absolute;
  top: 90px;
  left: 25px;
  z-index: 100;
  width: 180px;
}

#graphMenuCard .rootNodeVisible {
  max-height: 30px;
  border-left: 2px solid #ffa600;
}

#graphMenuCard .accountNodesVisible {
  max-height: 30px;
  border-left: 2px solid #ff7c43;
}

#graphMenuCard .applicationNodesVisible {
  max-height: 30px;
  border-left: 2px solid #2f4b7c;
}

#graphMenuCard .paymentTransactionsVisible {
  max-height: 30px;
  border-left: 2px solid #f95d6a;
}

#graphMenuCard .assetTransferTransactionsVisible {
  max-height: 30px;
  border-left: 2px solid #a05195;
}

#graphMenuCard .applicationTransactionsVisible {
  max-height: 30px;
  border-left: 2px solid #2f4b7c;
}

#graphMenuCard .transactionGroupsVisible {
  max-height: 30px;
  border-left: 2px solid #333;
}

#graphMenuCard .assetNodesVisible {
  max-height: 30px;
  border-left: 2px solid #a05195;
}

#graphMenuCard .v-list-item {
  max-height: 30px;
}

#graphMenuCard .v-subheader {
  max-height: 30px;
}

.top-z {
  z-index: 101;
}
</style>
