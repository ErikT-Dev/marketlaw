import React from 'react';
import { StatusBar } from 'react-native';
import { MenuProvider } from 'react-native-popup-menu';
import FlashMessage from 'react-native-flash-message';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { store, persistor } from './src/store';
import LoadingScreen from './src/tsx/Screens/LoadingScreen';
import MainMenu from './src/tsx/Screens/MainMenu';
import GameWindow from './src/tsx/Screens/GameWindow';
import Rules from './src/tsx/Screens/Rules';
import HighScores from './src/tsx/Screens/HighScores';

export type RootStackNavigatorParamsList = {
  Loading: undefined;
  MainMenu: undefined;
  GameWindow: undefined;
  Rules: undefined;
  HighScores: undefined;
};
const Stack = createNativeStackNavigator<RootStackNavigatorParamsList>();

export default function App() {
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <MenuProvider>
            <NavigationContainer>
              <Stack.Navigator initialRouteName='Loading' screenOptions={{ headerShown: false }}>
                <Stack.Screen name='Loading' component={LoadingScreen} />
                <Stack.Screen name='MainMenu' component={MainMenu} />
                <Stack.Screen name='GameWindow' component={GameWindow} />
                <Stack.Screen name='Rules' component={Rules} />
                <Stack.Screen name='HighScores' component={HighScores} />
              </Stack.Navigator>
            </NavigationContainer>
          </MenuProvider>
        </PersistGate>
      </Provider>
      <StatusBar hidden={true} />
      <FlashMessage position="top" />
    </>
  );
}