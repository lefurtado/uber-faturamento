import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { mapAuthError } from '../services/auth';
import { hasAuthFormErrors, validateAuthForm } from '../utils/authValidation';

type AuthMode = 'login' | 'signup';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const validationErrors = validateAuthForm(email, password);
    if (hasAuthFormErrors(validationErrors)) {
      setError(validationErrors.email ?? validationErrors.password ?? null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const trimmedEmail = email.trim();
      if (mode === 'login') {
        await signIn(trimmedEmail, password);
      } else {
        await signUp(trimmedEmail, password);
      }
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode((current) => (current === 'login' ? 'signup' : 'login'));
    setError(null);
  }

  const isLogin = mode === 'login';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Uber Faturamento</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{isLogin ? 'Entrar' : 'Criar conta'}</Text>
            )}
          </Pressable>

          <Pressable onPress={toggleMode} disabled={loading}>
            <Text style={styles.toggle}>
              {isLogin ? 'Não tem conta? Criar conta' : 'Já tem conta? Entrar'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  error: {
    color: '#cf222e',
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggle: {
    color: '#444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    textDecorationLine: 'underline',
  },
});
