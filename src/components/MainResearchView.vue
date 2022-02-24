<template>
  <v-container id="container" fluid>
    <v-progress-linear
      indeterminate
      color="purple darken-2"
      v-if="searching"
      class="searchingProgressIndicator"
    ></v-progress-linear>
    <div id="home" v-if="elements.length == 0 && searching != true">
      <v-row id="landingpage">
        <v-col cols="12" class="hero">
          <h1>
            Qualitative Blockchain Analysis for Algorand Investors
          </h1>

          <v-row>
            <v-col cols="2"></v-col>
            <v-col cols="8">
              <p>
                Make your best-informed decision before interacting with an untrusted wallet.
                Get a sense of a wallet's "personality" based on their track-record of past transactions and relationships
                with other wallets, ASAs and applications.
              </p>

              <p>
                <v-btn class="cta"
                       href="?deeplink=true&network=main&accountid=YHFIMNQB2HSDWPH3LKMGZK7TTSVWPS44RBLKFBO5JAUD52EXPGTQGICWZY&focus=graph&layout=concentric"
                       color="primary"
                       elevation="5"
                >
                  Jump right in with this example!
                </v-btn>
                &nbsp; or &nbsp;
                <v-btn
                  @click="dialog = true"
                  outlined
                  plain
                >
                  Learn more about Ballet
                </v-btn>

              </p>
            </v-col>
            <v-col cols="2"></v-col>
          </v-row>
        </v-col>
      </v-row>
      <div class="demo">
        <img src="https://raw.githubusercontent.com/akaalias/algorand-ballet/main/public/img/algorand-ballet-example-account-concentric-layout.png"/>
      </div>
    </div>
    <SearchForm :parentAccountID="accountID"
                @searchReady="startSearch($event)"
                @showInformationOverlay="popupDialog($event)"
                v-bind:class="getSearchFormClass()"
    />
    <div class="cyHolder" v-if="elements.length > 0">
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
    </div>
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
          <v-toolbar-title>
            Algorand Ballet: Qualitative Blockchain Analysis for Algorand Investors
          </v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>

        <v-tabs
        >
          <v-tab>About Algorand Ballet</v-tab>
          <v-tab>Thank you</v-tab>
          <v-tab>How To Navigate</v-tab>
          <v-tab>Appearance Settings</v-tab>

          <v-tab-item :key="1">
            <v-row>
              <v-col cols="3">
              </v-col>
              <v-col cols="6">
                <h1 class="heading">Oh, hi there!</h1>
                <p>
                  Great to meet you.
                  My name is <a href="https://publish.obsidian.md/alexisrondeau" target="_blank">Alexis</a> and I am a researcher, product manager, developer and Algorand enthusiast. I wanted to share a research project I've been working on with you.
                </p>

                <h2>
                  Qualitative Blockchain Analysis
                </h2>
                <p>
                  Ballet is an interactive qualitative analysis tool for the Algorand blockchain. "Qualitative" in that it gives you a glimpse into a wallet's "personality" based on their past track-record with other wallets, ASAs and Applications.
                </p>
                <p>
                  Ideally, Ballet is a qualitative extension to your existing quantitative blockchain wallet analysis, auditing and diligence workflow.
                </p>

                <h2>Your Benefits</h2>
                <h3>1. Get Decision Support</h3>
                <p>
                  For when you have an Account ID (also often called Wallet address) and you want to get a better picture of who they are, what they do, with whom and how often.
                </p>
                <p>
                  Ballet gives you a qualitative "smell-test", an extra data-point to make your best-informed decision before interacting with an untrusted wallet. By looking at their qualitative track-record, there is no need for "official identity" to get that sense of "personality" in the same way I can get a first impression of a person by looking at them without the need to know their name or see their passport. I think that's really cool.
                </p>

                <h3>2. Find Better Questions</h3>
                <p>
                  This is when you don't yet know what you're looking for or you just want to get to better understand how Algorand works (technically) and how it's going (ecologically) by taking a stroll down main street.
                </p>
                <p>
                  Ballet supports this kind of inductive observation and experimentation by simply diving in with a random Account ID, even your own, switching between focuses and layouts, untangling some knots and clicking on other nodes.
                </p>
                <p>
                  By just futzing around I've had several moments of "Heh!?" that piqued my curiosity and led me to asking much more specific, and frankly, more interesting questions
                </p>

                <h2>The benefit to the ecosystem</h2>
                <p>
                  Ballet gives us an additional, more qualitative, window to have "more eyes on the sidewalk"[1] in an effort to make Algorand a safe place for its inhabitants and visitors alike. Just like the eyes of neighbors, shop-keepers and even visitors keep a sidewalk safe by simply being there.
                </p>
                <p>
                  But why should you personally care about the safety of the ecosystem?
                </p>
                <p>
                  Let's say you want to invest into the biggest ROI artistic NFT collection today, and if we imagine Algorand (eventually) being like a big city very much like New York City:
                </p>
                <p>
                  I believe you shouldn't be looking for NFTs at all. You should be looking to meet Andy Warhol in 1951, when he was designing shoes for Miller, and a year before his first solo-show.
                </p>
                <p>
                  Now, for Andy Warhol's print-work (and anything else he touched really, including payments slips, scribbles and letters) to eventually become "A Warhol", it required New York City to be in its best shape, flush with post-war cash and rock-and-roll hitting the airwaves.
                </p>
                <p>
                  You needed a (relatively) safe city for artists like Andy Warhol to settle and take liberty to produce their best work.
                </p>
                <p>
                  That's why you should care about the safety of the ecosystem.
                </p>
                <p>
                  Because only then will the true heir to Andy Warhol settle in and grow his work.
                </p>
                <p>
                  And only then will you be there, on June 16th 1952, at Hugo Gallery, on East 55th Street and Madison Avenue, at Andy's first show. To build meaningful relationships, to witness history and, yes, to buy the first Warhols for a penny and a dime.
                </p>

                <h2>Yes, AND...</h2>

                <p>
                  I believe, all benefits stated above re-inforce each other: What's good for you personally is also good for the ecosystem. And vice-versa.
                </p>
                <p>
                  I also believe it's using "qualitative AND quantitative" methods equally to have your "eyes on the sidewalk" and "your ears to the ground". That's why you can click-hold on any Account, Asset, Application, Group and Transaction inside Ballet to open its information on AlgoExplorer in a new window.
                </p>

                <h2>PS</h2>
                <p>
                  1. Just to make it clear, this is a personal project of mine. I built it because, after going on an actual adventure and wanting to spend a few Algos on NFTs, I felt deeply unsettled how much overt scamming and how little transparency there was. I did NOT FEEL SAFE while trying to buy a single NFT for fun because I had no way of understanding WHO the person (or group) behind the artwork really is. And I had no way to verify if the story they're telling me (The art-market is a great example of how important the authenticity of the story is for its value-creation[^3]) is actually true. And I had no way to know the people running the "gallery" itself.
                </p>
                <p>
                  2. I decided to release the application <a href="https://github.com/akaalias/algorand-ballet" target="_blank">fully open-source and under a permissive license</a> for you to futz around with it and to allow for any ad-hoc security review in case you are unsure if you can trust the website or app.
                </p>

                <h2>Why "Ballet"?</h2>
                <p>
                  The inspiration came from Jane Jacobs, who keenly observed that when New York sidewalks were safe, they gave stage for an...
                  <em>
                    "intricate ballet in which the individual dancers and ensembles all have distinctive parts which miraculously reinforce each other and compose an orderly whole."
                  </em>
                </p>

                <h2>Questions?</h2>
                <p>
                  Let's talk
                  If you have questions the best way to reach me is to talk in person:

                  In person, let's get a coffee and take a walk!
                  or via video/audio call on Zoom
                  To make that easy, <a href="https://calendly.com/alexis-rondeau" target="_blank">here's my Calendly where you can book a time for us to talk</a>.
                </p>

              </v-col>

              <v-col cols="3">
              </v-col>
            </v-row>
          </v-tab-item>
          <v-tab-item :key="2">
            <v-row>
              <v-col cols="3">
              </v-col>
              <v-col cols="6">
                <h1 class="heading">Many thanks go out to</h1>

                <h2>PureStake</h2>
                <p>
                  PureStake have enabled me to iterate incredibly fast by <a href="https://www.purestake.com/technology/algorand-api/">providing their API to the Algorand blockchain</a>.
                  It's been a bliss to work with it and I couldn't have done it without them. And I would immediately use their API again for any new project and recommend you try it out as well.
                  (Please note that I am not affiliated with PureStake.)
                </p>

                <h2>Algorand Foundation</h2>
                <p>
                  Thank you <a href="https://algorand.foundation/about-us/who-we-are">Addie at the Algorand Foundation</a> for your review and positive feedback!
                </p>
              </v-col>
            </v-row>
            <v-col cols="3">
            </v-col>
          </v-tab-item>
          <v-tab-item :key="2">
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
          </v-tab-item>
          <v-tab-item :key="4">

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
                  thumb-label="always"
                  max="1280"
                  min="500"
                  v-on:change="search"
                ></v-slider>
              </v-list-item>
            </v-list>
          </v-tab-item>
        </v-tabs>
      </v-card>
    </v-dialog>
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
    popupDialog(event) {
      console.log("In main...");
      this.dialog = true;
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
      // const min = Math.ceil(1);
      // const max = Math.floor(7);
      // const idx = Math.floor(Math.random() * (max - min) + min);
      const idx = "5"
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

#landingpage h1 {
  margin-top: 100px;
  font-size: 36pt;
  text-align: center;
}

#landingpage p {
  margin-top: 20px;
  margin-bottom: 40px;
  font-size: 20pt;
  text-align: center;
}

h1.heading {
  font-size: 36pt;
  margin-top: 50px;
  margin-bottom: 50px;
}
</style>
