<template>
  <v-form>
    <v-row align="center">
      <v-col cols="4"> </v-col>
      <v-col cols="4">
        <h1 class="text-h6">Please configure your API Key</h1>
        <p>
          Hi there! To use the explorer you need access to Algorand's data via
          an API key.
        </p>

        <p>
          I've gotten mine from Purestake: It works really well, it's free for
          personal use and was easy to get via their
          <a href="https://developer.purestake.io/">Developer Portal</a>. (I
          have no affiliation with Purestake)
        </p>

        <p>
          After signing up, please copy and paste your key below. It will be
          stored locally for the duration of your session.
        </p>

        <br />
        <v-row class="">
          <v-col cols="9">
            <v-text-field
              v-model="userAPIKey"
              :rules="userAPIKeyRules"
              label="My API Key"
              required
              @keydown.enter.prevent="setAPIKey()"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-btn
              :disabled="!isAPIKeyValid"
              @click="setAPIKey()"
              color="primary"
            >Set Key</v-btn
            >
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="4"> </v-col>
    </v-row>
  </v-form>
</template>

<script>
import { AlgorandAPIConfig } from "../models/AlgorandAPIConfig";

export default {
  name: "APIKeyForm",
  data:() => ({
    apiKey: AlgorandAPIConfig.key,
    userAPIKey: AlgorandAPIConfig.key,
    userAPIKeyRules: [
      (v) => !!v || "API Key is required",
      (v) => v.length === 40 || "API Key must be exactly 40 characters",
    ],
  }),
  methods: {
    setAPIKey() {
      if (this.userAPIKey.length == 40) {
        this.apiKey = this.userAPIKey;
        this.$emit('apiKeySet', this.apiKey);
      }
    }
  },
  computed: {
    isAPIKeyValid() {
      return this.userAPIKey.length == 40;
    }
  },
};
</script>

<style scoped>

</style>