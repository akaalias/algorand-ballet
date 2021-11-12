<template>
  <my-component>
  </my-component>
</template>

<script lang="ts">
import Vue from "vue";
import MyComponent from "../components/MyComponent.vue"

export default Vue.extend({
  name: "Home",

  components: {
    MyComponent,
  },
});
</script>
