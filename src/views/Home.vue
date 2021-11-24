<template>
  <main-research-view></main-research-view>
</template>

<script lang="ts">
  import Vue from 'vue'
  import MainResearchView from "@/components/MainResearchView.vue";

  document.title = "Algorand Ballet";
  
  export default Vue.extend({
    name: 'Home',

    components: {
      MainResearchView,
    },
  })
</script>
