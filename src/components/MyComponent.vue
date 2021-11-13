<template>
  <v-container>
    <h1>HELLO</h1>
    <v-btn
      color="primary"
      elevation="2"
      large
      v-on:click="greet"
    >
      Greet Me
    </v-btn>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "MyComponent",
  data: () => ({ }),
  methods: {
    greet: function() {
      alert('Hello !')
    }
  }
});
</script>
