import React from 'react';
import {StatusBar} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider as ReduxProvider} from 'react-redux';
import {PaperProvider} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import {store} from '@/redux/store';
import {RootNavigator} from '@/navigation/RootNavigator';
import {useAppTheme} from '@/hooks/useAppTheme';

const ThemedApp = () => {
  const {paperTheme, isDark, colors} = useAppTheme();

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <RootNavigator />
      <Toast />
    </PaperProvider>
  );
};

function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ReduxProvider store={store}>
        <SafeAreaProvider>
          <ThemedApp />
        </SafeAreaProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}

export default App;
