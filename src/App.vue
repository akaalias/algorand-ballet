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
Vue.use(VueCytoscape)

export default Vue.extend({
  name: 'App',

  data: () => ({
    //
  }),
});
</script>
