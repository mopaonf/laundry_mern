module.exports = function (api) {
   api.cache(true);
   return {
      presets: ['babel-preset-expo'],
      plugins: [
         // Expo Router uses React Navigation under the hood
         'expo-router/babel',

         // Handle path aliases
         [
            'module-resolver',
            {
               alias: {
                  // These should match your tsconfig.json paths
                  '@': './',
                  '@components': './components',
                  '@hooks': './hooks',
                  '@utils': './utils',
                  '@store': './store',
                  '@assets': './assets',
               },
               extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
         ],
      ],
   };
};
