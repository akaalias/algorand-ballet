<template>
  <v-app>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import VueCytoscape from 'vue-cytoscape'
import Clipboard from 'v-clipboard'
import VueMeta from 'vue-meta'

Vue.use(VueCytoscape)
Vue.use(Clipboard)
Vue.use(VueMeta)

export default Vue.extend({
  name: 'App',
  metaInfo: {
    title: 'Algorand Ballet – Background-Checks for Wallets and Assets',
    titleTemplate: '%s',
    htmlAttrs: {
      lang: 'en-US'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'og:title', content: 'Algorand Ballet – Background-Checks for Wallets and Assets' },
      { name: 'og:description', content: 'Make your best-informed decision before interacting on the Algorand Blockchain. Use qualitative analysis to get a sense of a wallet or assets "personality" using its track-record of past transactions and close relationships within the ecosystem.' },
      { name: 'og:url', content: 'https://alexisrondeau.me/algorand-ballet/' },
      { name: 'og:image', content: 'https://raw.githubusercontent.com/akaalias/algorand-ballet/main/public/img/ballet-ui.png' },
      { name: 'og:type', content: 'Website' },
      { name: 'og:site_name', content: 'Algorand Ballet'},
      { name: 'twitter:card', content: 'Make your best-informed decision before interacting on the Algorand Blockchain. Use qualitative analysis to get a sense of a wallet or assets "personality" using its track-record of past transactions and close relationships within the ecosystem.'},
      { name: 'twitter:image', content: 'https://raw.githubusercontent.com/akaalias/algorand-ballet/main/public/img/ballet-ui.png'},
      { name: 'twitter:title', content: 'Algorand Ballet – Background-Checks for Wallets and Assets'},
      { name: 'author', content: 'Alexis Rondeau' },
    ]
  },  data: () => ({
    //
  }),
});
</script>
