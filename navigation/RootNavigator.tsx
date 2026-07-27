import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { AuthScreen } from '../screens/AuthScreen';
import { ConfigScreen } from '../screens/ConfigScreen';
import { DetailsScreen } from '../screens/DetailsScreen';
import { FechamentoScreen } from '../screens/FechamentoScreen';
import { HomeScreen } from '../screens/HomeScreen';
import type { AppStackParamList, AuthStackParamList } from '../types/navigation';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Auth" component={AuthScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator>
      <AppStack.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
      <AppStack.Screen
        name="Config"
        component={ConfigScreen}
        options={{ title: 'Configuração' }}
      />
      <AppStack.Screen
        name="Fechamento"
        component={FechamentoScreen}
        options={{ title: 'Fechamento' }}
      />
      <AppStack.Screen name="Details" component={DetailsScreen} options={{ title: 'Detalhes' }} />
    </AppStack.Navigator>
  );
}

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return user ? <AppNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
