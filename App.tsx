import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './contexts/AuthContext';
import { RootNavigator } from './navigation/RootNavigator';
import './services/firebase';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}
