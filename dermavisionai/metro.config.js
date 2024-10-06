const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };

  config.resolver = {
    ...resolver,
    assetExts: [...resolver.assetExts, 'tflite'],
    sourceExts: [...resolver.sourceExts, 'js', 'json', 'ts', 'tsx', 'jsx'],
  };

  return config;
})();
