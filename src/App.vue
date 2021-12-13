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

Vue.use(VueCytoscape)
Vue.use(Clipboard)

export default Vue.extend({
  name: 'App',

  data: () => ({
    //
  }),
});
</script>
