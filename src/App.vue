<template>
  <v-app>
    <v-app-bar app dense>
      <div class="">
        <v-img
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="32"
        />
      </div>

      <v-spacer></v-spacer>

      <br/>
      <v-switch
        v-model="$vuetify.theme.dark"
        single-line
        label="Dark Mode"
        class="pt-5"
      ></v-switch>
    </v-app-bar>

    <v-main>
      <!-- Here, the page is injected -->
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "App",
  data: () => ({
    //
  }),
});
</script>
