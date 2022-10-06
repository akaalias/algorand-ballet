<template>
  <div id="">
    <section class="banner">
      <p class="banner">
        Hello and welcome to Ballet!
      </p>
    </section>
    <section class="main">
      <v-row class="landingpage">
        <v-col cols="12" class="hero">
          <h1>
            Background-Checks <br>for Crypto Wallets and Assets
          </h1>

          <v-row>
            <v-col cols="12">
              <p>
                <u>Make your best-informed decision before interacting on the Algorand Blockchain.</u>
              </p>
              <p>
                Use qualitative analysis to get a sense of a wallet or assets "personality" using its track-record of
                past transactions and close relationships within the ecosystem.
              </p>

              <p>
                <v-btn class="cta"
                       href="?deeplink=true&network=main&accountid=YHFIMNQB2HSDWPH3LKMGZK7TTSVWPS44RBLKFBO5JAUD52EXPGTQGICWZY&focus=graph&layout=concentric"
                       color="primary"
                       elevation="5"
                >
                  Jump right in with this example!
                </v-btn>
                <br>
                &nbsp; or
                <br>&nbsp;
                <v-btn
                  @click="showDialog"
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
    </section>

    <section>
      <v-row class="landingpage demo hero">
        <v-col cols="12">
          <img src="https://raw.githubusercontent.com/akaalias/algorand-ballet/main/public/img/ballet-ui.png" class="ui-demo"/>
        </v-col>
      </v-row>
    </section>

    <section class="gallery">
      <v-row class="landingpage demo">
        <v-col cols="4" v-for="image in galleryImageFilenames" class="gallery-image">
          <img :src="cdnURLForGalleryImage(image)" class="gallery-img"/>
        </v-col>
      </v-row>
    </section>

    <section>
      <v-row class="landingpage">
        <v-col cols="12">
          <h1 class="">Got questions? Let's talk.</h1>
          <p>
            <img src="https://raw.githubusercontent.com/akaalias/algorand-ballet/main/public/img/alexis-portrait.jpg"
                 class="portrait" />
          </p>
          <p>
            Oh, hi there!
          </p>
          <p>
            Alexis here, great to meet you.
          </p>

          <p>
            If you want to learn more about Ballet, how to integrate qualitative analysis into your existing auditing
            and diligence workflow, or just chat in general: I want to hear from you!
          </p>
          <p>
            I've found <em>the best way by far</em> is to talk personally so I've opened up office hours this week.
          </p>
          <p>
            Click on the button below and book a time right away.
          </p>
          <p>
            <v-btn class="cta"
                   href="https://calendly.com/alexis-rondeau"
                   color="primary"
                   elevation="5"
            >
              Let's talk about your questions!
            </v-btn>
          </p>
        </v-col>
      </v-row>
    </section>
    <footer>
      <p>
        Copyright 2022 –
        Made with love by <a href="https://alexisrondeau.me" target="_blank">Alexis Rondeau</a> –
        <a href="https://github.com/akaalias/algorand-ballet" target="_blank">Open Source on Github</a>
      </p>
    </footer>
  </div>
</template>

<script>
export default {
  name: "Landingpage",
  data: () => ({
    galleryImageFilenames: [
      "app-asset-family", "app-cross", "application-relationships",
      "trickle-down", "weighted-asset-transactions", "web-relationships", "asset-relationship-connection",
      "complexity", "grid-red", "strong-relationships","network",
      "incoming-outgoing-txs","cross", "inner-circle","balanced-transactions",
      "extraction", "transaction-details","centered",

    ],
  }),
  methods: {
    showDialog() {
      this.$emit('popupDialog', {});
    },
    cdnURLForGalleryImage(filename) {
      return "https://raw.githubusercontent.com/akaalias/algorand-ballet/main/public/gallery/" + filename + ".png";
    }
  }
}
</script>

<style scoped>
.landingpage h1, .contact h1 {
  margin-top: 140px;
  font-size: 48pt;
  text-align: center;
}

.landingpage p, .contact p {
  margin-top: 20px;
  margin-bottom: 40px;
  font-size: 18pt;
  text-align: center;
}

h1.heading {
  font-size: 36pt;
  margin-top: 50px;
  margin-bottom: 50px;
}

.demo {
  text-align: center;
  width: 100%;
}

.demo img {
  width: 100%;
}

.contact {
  text-align: center;
}

.banner {
  text-align: center;
  background-color: #8D3A83;
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  padding: 5px;
  font-weight: bold;
}

footer {
  border-top: 2px dotted #1e1e1e;
  padding: 40px;
  margin-top: 100px;
  font-size: 10pt;
  text-align: center;
  opacity: 0.3;
}

footer:hover {
  opacity: 1;
}

.portrait {
  width: 200px;
  height: 200px;
  border-radius: 100px;
  padding: 10px;
  background: #fff;
}

.ui-demo {
  border-radius: 10px;
  border: 10px solid #333;
  transition: border 1s ease-out 100ms;
}

.ui-demo:hover {
  border: 5px solid #fff;
  padding: 0px;
}

.gallery-img {
  border-radius: 2px;
  border: 5px solid #333;
  transition: border 0.5s ease-out 100ms;
  background-color: #1e1e1e;
}

.gallery-img:hover {
  border: 1px solid #fff;
  padding: 0px;
}
</style>