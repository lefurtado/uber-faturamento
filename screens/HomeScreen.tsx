import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { mapAuthError } from '../services/auth';
import type { AppStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { user, logOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    setLoading(true);
    setError(null);

    try {
      await logOut();
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Uber Faturamento</Text>
      <Text style={styles.subtitle}>Tela inicial (placeholder)</Text>
      {user?.email ? <Text style={styles.email}>{user.email}</Text> : null}
      <Button
        title="Fechar o dia"
        onPress={() => navigation.navigate('Fechamento')}
      />
      <Button
        title="Configuração de custos"
        onPress={() => navigation.navigate('Config')}
      />
      <Button title="Ir para Detalhes" onPress={() => navigation.navigate('Details')} />
      <Button title="Sair" onPress={handleLogout} disabled={loading} />
      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: '#444',
  },
  error: {
    color: '#cf222e',
    textAlign: 'center',
  },
});
