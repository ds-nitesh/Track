module.exports = {
  dependencies: {
    // Fonts are linked manually from src/assets/fonts (not from node_modules).
    'react-native-vector-icons': {
      platforms: {
        ios: null,
        android: null,
      },
    },
  },
  assets: ['./src/assets/fonts'],
};
