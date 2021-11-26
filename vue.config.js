module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        "appId": "com.alexisrondeau.algorand-ballet",
        "afterSign": "build/notarize.js",
        "mac": {
          "category": "public.app-category.developer-tools",
          "hardenedRuntime": true,
          "gatekeeperAssess": false,
          "entitlements": "build/entitlements.plist",
          "entitlementsInherit": "build/entitlements.plist"
        },
        "dmg": {
          "sign": false
        }
      }
    }
  }
}
