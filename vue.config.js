module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/algorand-ballet/'
    : '/',
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
          // ,
          // target: {
          //   target: 'default',
          //   arch: [
          //     'x64',
          //     'arm64'
          //   ]
          // }
        },
        "dmg": {
          "sign": false
        }
      }
    }
  }
}
