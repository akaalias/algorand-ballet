<template>
  <MainResearchView></MainResearchView>
</template>

<script lang="ts">
import Vue from "vue";
import MainResearchView from "@/components/MainResearchView.vue";

export default Vue.extend({
  name: "Home",
  components: {
    MainResearchView,
  },
});
</script>
