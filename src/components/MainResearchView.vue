<template>
  <v-container id="container" fluid>
    <v-progress-linear
      indeterminate
      color="purple darken-2"
      v-if="searching"
      class="searchingProgressIndicator"
    ></v-progress-linear>

    <div class="cyHolder" v-if="apiKey !== ''">

      <SearchForm :parentAccountID="accountID"
                  @searchReady="startSearch($event)"
                  v-bind:class="getSearchFormClass()"
      />

      <div id="demoBackground"
           v-if="elements.length == 0 && searching != true"
           v-bind:style='{ backgroundImage: "url(" + this.randomDemoBackgroundImageURL + ")", }'
      >
      </div>

      <cytoscape
        :config="cyConfig"
        :preConfig="preConfig"
        :afterCreated="afterCreated"
        v-if="elements.length !== 0"
      />

      <v-card id="graphMenuCard" tile v-if="elements.length !== 0">
        <v-btn
          icon
          x-small
          @click.stop="mini = !mini"
          class="hideMenuButton"
        >
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>

        <v-list id="menuList" v-if="mini">
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
                :items="layoutConfigurations"
                item-text="display"
                item-value="name"
                single-line
                return-object
                v-on:change="changeLayout"
              >
              </v-select>
            </v-list-item>
          </v-list-item-group>

          <v-subheader>VISIBILITY</v-subheader>
          <v-list-item-group>
            <v-list-item class="rootNodeVisible">
              <v-switch
                v-model="rootNodeVisible"
                inset
                label="Target"
                v-on:click="toggleRootNode"
                color="#ffa600"
              />
            </v-list-item>
            <v-list-item class="accountNodesVisible">
              <v-switch
                v-model="accountNodesVisible"
                label="Accounts"
                inset
                v-on:click="toggleAccountNodes"
                color="#ff7c43"
              />
            </v-list-item>

            <v-list-item class="paymentTransactionsVisible">
              <v-switch
                v-model="paymentTransactionsVisible"
                label="Payments"
                inset
                v-on:click="togglePaymentTransactions"
                color="#f95d6a"
              />
            </v-list-item>
            <v-list-item class="assetNodesVisible">
              <v-switch
                v-model="assetNodesVisible"
                label="Assets"
                inset
                v-on:click="toggleAssetNodes"
                color="#a05195"
              />
            </v-list-item>
            <v-list-item class="applicationNodesVisible">
              <v-switch
                v-model="applicationNodesVisible"
                label="Apps"
                inset
                v-on:click="toggleApplicationNodes"
                color="#2f4b7c"
              />
            </v-list-item>
            <v-list-item class="transactionGroupsVisible" v-if="selectedFocus.focus === 'network'">
              <v-switch
                v-model="transactionGroupsVisible"
                label="Groups"
                inset
                v-on:click="toggleTransactionGroups"
                color="#888"
              />
            </v-list-item>

            <v-list-item class="transactionGroupsVisible" v-if="selectedFocus.focus === 'graph'">
              <v-switch
                v-model="weightLabelsVisible"
                label="Weights"
                inset
                v-on:click="toggleWeightLabels"
                color="#888"
              />
            </v-list-item>
          </v-list-item-group>

          <v-subheader>DISTRIBUTE</v-subheader>
          <v-list-item-group>
            <v-list-item class="exportPNG">
              <v-btn
                v-on:click="exportPNG"
                block
              > Export PNG </v-btn>
            </v-list-item>

            <v-list-item class="Share">
              <v-btn
                v-on:click="copyURLtoClipboard"
                block
              > {{ shareButtonLabel }} </v-btn>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-card>

      <v-dialog
        v-model="dialog"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="secondary"
            dark
            v-bind="attrs"
            v-on="on"
            id="dialogButton"
            fab
            small
          >
            <v-icon dark>
              mdi-information
            </v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-toolbar
            dark
            color="primary"
          >
            <v-btn
              icon
              dark
              @click="dialog = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>Information</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>

          <v-list
            three-line
            subheader
          >
            <v-list-item>
              You can find the project's overview and full source-code &nbsp; <a href="https://github.com/akaalias/algorand-ballet">on Github</a>
              &nbsp; For questions, please &nbsp; <a href="https://calendly.com/alexis-rondeau">book a time here and let's talk!</a>
            </v-list-item>
          </v-list>

          <v-divider></v-divider>

          <v-list
            three-line
            subheader
          >
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Moving Around</v-list-item-title>
                <v-list-item-subtitle>
                  To move a single node, click-drag it to your desired spot.
                  To move several nodes use shift-click-drag to create your selection.
                  To zoom in and out use your trackpad or mouse wheel.
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>View details on AlgoExplorer</v-list-item-title>
                <v-list-item-subtitle>
                  View details on AlgoExplorer on any Account, Asset, Application, any Group and any Transaction by click-holding.
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Trigger Search</v-list-item-title>
                <v-list-item-subtitle>
                  Trigger a new search for an Account by double-clicking on it
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Fast Layout Rotation</v-list-item-title>
                <v-list-item-subtitle>
                  For fast and animated switching between layouts use your arrow-up and arrow-down keys after selecting a new layout with your mouse.
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <v-divider></v-divider>

          <v-list
            three-line
            subheader
          >
            <v-subheader>APPEARANCE</v-subheader>
            <v-list-item>
                <v-switch
                  v-model="$vuetify.theme.dark"
                  inset
                  label="Dark Mode"
                  color="indigo"
                ></v-switch>
            </v-list-item>

            <v-subheader>GRAPH HEIGHT</v-subheader>
            <v-list-item>
              <v-slider
                v-model="graphHeight"
                :label="GraphHeight"
                :thumb-color="red"
                thumb-label="always"
                max="1280"
                min="500"
                v-on:change="search"
              ></v-slider>
            </v-list-item>
          </v-list>

        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script>
import { CytoscapeConfig } from "@/models/CytoscapeConfig";
import { EndpointDomains } from "@/models/EndpointDomains";
import { QualitativeResearchApproach } from "@/models/QualitativeResearchApproach";
import APIKeyForm from "@/components/APIKeyForm";
import SearchForm from "@/components/SearchForm";
import { CacheManager } from "@/models/CacheManager";

export default {
  name: "MainResearchView",
  data: () => ({
    accountID: "",
    apiKey: EndpointDomains.key,
    selectedNetwork: EndpointDomains.defaultNetwork,
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
    weightLabelsVisible: true,
    algorandAPI: null,
    transactionGroupsVisible: true,
    deepLinkID: "",
    doubleClickDelayMs: 350,
    previousTapStamp: 0,
    mini: true,
    searching: false,
    miniHelp: true,
    shareButtonLabel: "Share URL",
    graphHeight: 750,
    dialog: false,
  }),
  methods: {
    async setElementsFromCache() {
      this.cacheManager = new CacheManager();
      this.elements = [];
      this.elements = await this.cacheManager.get(this.selectedNetwork, this.accountID, this.selectedFocus);
    },
    async search() {
      this.searching = true;
      this.shareButtonLabel = "Share URL";
      await this.setElementsFromCache();
      this.searching = false;
    },
    preConfig(cytoscape) {

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
            this.search();
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
          } else if(type === "group-node") {
            url = url + "/tx/group/" + encodeURI(node.data().id);
          } else {
            console.log("Unsure how to handle this node");
          }
          window.open(url, "_blank", "minimizable=false").focus();
        }.bind(this)
      );

      this.cy.layout(this.selectedLayout).run();

      // The big cahuna – Setting this size...
      document.getElementById("cytoscape-div").style.minHeight = this.graphHeight + "px";

      this.toggleRootNode();
      this.toggleAccountNodes();
      this.toggleAssetNodes();
      this.toggleApplicationNodes();

      this.togglePaymentTransactions();
      this.toggleAssetTransferTransactions();
      this.toggleApplicationTransactions();
      this.toggleTransactionGroups();

      this.toggleWeightLabels();

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
        this.cy.$(".application, .application-transaction, .application-relationship").style("display", "none");
      } else {
        this.cy.$(".application, .application-transaction, .application-relationship").style("display", "element");
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
        this.cy.$(".asset, .asset-transfer-transaction, .asset-relationship").style("display", "none");
      } else {
        this.cy.$(".asset, .asset-transfer-transaction, .asset-relationship").style("display", "element");
      }
    },
    setMyAPIKey(key) {
      this.apiKey = key;
    },
    setupFromURLParams() {
      const focusParam = this.$route.query.focus;
      if(!!focusParam) {
        const focus = QualitativeResearchApproach.getResearchApproachForKey(focusParam);
        if(!!focus) {
          this.selectedFocus = focus;
        }
      }

      const layoutParam = this.$route.query.layout;
      if(!!layoutParam) {
        console.log(layoutParam);
        const layout = CytoscapeConfig.getLayoutForKey(layoutParam);
        if(!!layout) {
            this.selectedLayout = layout;
        }
      }

      this.$router.replace({'query': null});
    },
    startSearch(event) {
      this.accountID = event.accountID;
      this.selectedNetwork = event.network;
      this.setupFromURLParams();
      this.search();
    },
    toggleTransactionGroups() {
      if (!this.transactionGroupsVisible) {
        this.cy.$(":parent").style("border-opacity", "0");
      } else {
        this.cy.$(":parent").style("border-opacity", "1");
      }
    },
    toggleWeightLabels() {
      if (!this.weightLabelsVisible) {
        this.cy.$(".application-relationship, .asset-relationship, .payment-relationship").style("text-opacity", "0");
      } else {
        this.cy.$(".application-relationship, .asset-relationship, .payment-relationship").style("text-opacity", "1");
      }
    },
    changeLayout() {
      this.cy.layout(this.selectedLayout).run();
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
    copyURLtoClipboard() {
      const deeplink = this.assembleDeepLinkURL();
      this.$clipboard(deeplink);
      this.shareButtonLabel = "URL Copied";
    },
    assembleDeepLinkURL() {
      var deeplinkString = "";

      deeplinkString = window.location.href;
      deeplinkString += "?deeplink=true";
      deeplinkString += ("&network=" + this.selectedNetwork.key);
      deeplinkString += ("&accountid=" + this.accountID);
      deeplinkString += ("&focus=" + this.selectedFocus.key);
      deeplinkString += ("&layout=" + this.selectedLayout.key);

      return deeplinkString
    },
    getSearchFormClass() {
      if(this.elements.length == 0 && this.searching != true) {
        return "homepageSearchFormClass elevation-21"
      } else {
        return ""
      }
    }

  },
  components: {
    SearchForm,
    APIKeyForm,
  },
  computed: {
    randomDemoBackgroundImageURL() {
      const min = Math.ceil(1);
      const max = Math.floor(7);
      const idx = Math.floor(Math.random() * (max - min) + min);
      return "https://raw.githubusercontent.com/akaalias/algorand-ballet/main/public/img/" + String(idx) + ".png";
    }
  }
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

#graphMenuCard .toggleTheme {
  max-height: 30px;
}

#graphMenuCard .exportPNG {
}

#graphMenuCard .v-list-item {
  max-height: 30px;
}

#graphMenuCard .v-subheader, #helpMenuCard .v-subheader {
  max-height: 20px;
}

#helpMenuCard .v-list-item {
  padding: 10px;
}

.hideMenuButton {
  position: absolute;
  right: 5px;
  top: 5px;
  max-height: 10px;
}

.searchingProgressIndicator {
  width: 100%;
  height: 4px;
  position: fixed;
  top: 0px;
  left: 0px;

}

#dialogButton {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10000;
}

#demoBackground {
  position: fixed;
  z-index: 1;
  width: 100%;
  height: 100%;
  background-position: bottom;
}

.homepageSearchFormClass {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  background-color: var(--v-primary-base);
  width: 100%;
  padding: 30px !important;
  padding-left: 0px !important;
}

</style>
