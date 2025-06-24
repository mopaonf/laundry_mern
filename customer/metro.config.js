// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Customize the resolver to help with module resolution issues
config.resolver = {
   ...config.resolver,
   // Ensure proper resolution of node_modules
   extraNodeModules: {
      // Add any aliases here if needed
   },
   // Modules to exclude from bundling
   blacklistRE: config.resolver.blacklistRE || /\.git\/.*/,
   // Reset the cache for fresh rebuilds
   resetCache: true,
};

module.exports = config;
