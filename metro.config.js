const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// expo-sqlite's existing web worker imports its bundled wa-sqlite.wasm asset.
config.resolver.assetExts.push('wasm');

module.exports = config;
