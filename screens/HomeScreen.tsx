import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';

import {
  runFirebaseSmokeTest,
  signOutSmokeUser,
  type SmokeTestResult,
} from '../services/firebaseSmokeTest';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmokeTestResult | null>(null);

  async function handleSmokeTest() {
    setLoading(true);
    setResult(null);
    const next = await runFirebaseSmokeTest();
    setResult(next);
    setLoading(false);
  }

  async function handleSignOut() {
    setLoading(true);
    const next = await signOutSmokeUser();
    setResult(next);
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Uber Faturamento</Text>
      <Text style={styles.subtitle}>Tela inicial (placeholder)</Text>
      <Button title="Ir para Detalhes" onPress={() => navigation.navigate('Details')} />

      <View style={styles.smokeBox}>
        <Text style={styles.smokeTitle}>Smoke test Firebase (temporário)</Text>
        <Button title="Rodar auth + Firestore" onPress={handleSmokeTest} disabled={loading} />
        <Button title="Logout" onPress={handleSignOut} disabled={loading} />
        {loading ? <ActivityIndicator /> : null}
        {result ? (
          <Text style={result.ok ? styles.ok : styles.error}>{result.message}</Text>
        ) : null}
      </View>
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
  smokeBox: {
    marginTop: 24,
    width: '100%',
    gap: 12,
    alignItems: 'center',
  },
  smokeTitle: {
    fontSize: 14,
    color: '#888',
  },
  ok: {
    color: '#1a7f37',
    textAlign: 'center',
  },
  error: {
    color: '#cf222e',
    textAlign: 'center',
  },
});
