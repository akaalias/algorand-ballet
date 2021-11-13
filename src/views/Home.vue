<template>
  <account-i-d-form></account-i-d-form>
</template>

<script lang="ts">
import Vue from "vue";
import AccountIDForm from "@/components/AccountIDForm.vue";

export default Vue.extend({
  name: "Home",

  components: {
    AccountIDForm,
  },
});
</script>
