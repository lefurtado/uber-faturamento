import { useEffect, useState } from 'react';
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
import { getUserConfig, mapUserConfigError, saveUserConfig } from '../services/userConfig';
import {
  emptyUserConfigFormValues,
  hasUserConfigFormErrors,
  userConfigToFormValues,
  validateUserConfigForm,
  type UserConfigFormValues,
} from '../utils/userConfigValidation';

export function ConfigScreen() {
  const { user } = useAuth();
  const [values, setValues] = useState<UserConfigFormValues>(emptyUserConfigFormValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UserConfigFormValues, string>>>(
    {},
  );

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const uid = user.uid;
    let cancelled = false;

    async function loadConfig() {
      setLoading(true);
      setError(null);

      try {
        const config = await getUserConfig(uid);
        if (cancelled) {
          return;
        }

        if (config) {
          setValues(userConfigToFormValues(config));
        }
      } catch (err) {
        if (!cancelled) {
          setError(mapUserConfigError(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadConfig();

    return () => {
      cancelled = true;
    };
  }, [user]);

  function updateField(field: keyof UserConfigFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSuccess(null);
    setError(null);
  }

  async function handleSave() {
    const { errors, config } = validateUserConfigForm(values);

    if (hasUserConfigFormErrors(errors)) {
      setFieldErrors(errors);
      setError(null);
      setSuccess(null);
      return;
    }

    if (!user || !config) {
      setError('Usuário não autenticado.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    try {
      await saveUserConfig(user.uid, config);
      setSuccess('Configuração salva.');
    } catch (err) {
      setError(mapUserConfigError(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Configuração de custos</Text>
        <Text style={styles.subtitle}>
          Valores usados nos cálculos do fechamento diário. Você pode ajustá-los a qualquer momento.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Preço do litro (R$)</Text>
          <TextInput
            style={styles.input}
            value={values.valorLitroCombustivel}
            onChangeText={(text) => updateField('valorLitroCombustivel', text)}
            placeholder="Ex.: 5,89"
            keyboardType="decimal-pad"
            editable={!saving}
          />
          {fieldErrors.valorLitroCombustivel ? (
            <Text style={styles.fieldError}>{fieldErrors.valorLitroCombustivel}</Text>
          ) : null}

          <Text style={styles.label}>Consumo médio (km/L)</Text>
          <TextInput
            style={styles.input}
            value={values.kmPorLitro}
            onChangeText={(text) => updateField('kmPorLitro', text)}
            placeholder="Ex.: 12,5"
            keyboardType="decimal-pad"
            editable={!saving}
          />
          {fieldErrors.kmPorLitro ? (
            <Text style={styles.fieldError}>{fieldErrors.kmPorLitro}</Text>
          ) : null}

          <Text style={styles.label}>Manutenção por dia (R$)</Text>
          <TextInput
            style={styles.input}
            value={values.custoManutencaoDia}
            onChangeText={(text) => updateField('custoManutencaoDia', text)}
            placeholder="Ex.: 16,67"
            keyboardType="decimal-pad"
            editable={!saving}
          />
          <Text style={styles.hint}>Valor diário (ex.: mensal ÷ 30)</Text>
          {fieldErrors.custoManutencaoDia ? (
            <Text style={styles.fieldError}>{fieldErrors.custoManutencaoDia}</Text>
          ) : null}

          <Text style={styles.label}>Seguro por dia (R$)</Text>
          <TextInput
            style={styles.input}
            value={values.custoSeguroDia}
            onChangeText={(text) => updateField('custoSeguroDia', text)}
            placeholder="Ex.: 10,00"
            keyboardType="decimal-pad"
            editable={!saving}
          />
          <Text style={styles.hint}>Valor diário (ex.: mensal ÷ 30)</Text>
          {fieldErrors.custoSeguroDia ? (
            <Text style={styles.fieldError}>{fieldErrors.custoSeguroDia}</Text>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}

          <Pressable
            style={[styles.button, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Salvar</Text>
            )}
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
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 16,
    lineHeight: 22,
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
  hint: {
    fontSize: 12,
    color: '#888',
    marginTop: -4,
  },
  fieldError: {
    color: '#cf222e',
    fontSize: 13,
  },
  error: {
    color: '#cf222e',
    fontSize: 14,
    marginTop: 8,
  },
  success: {
    color: '#1a7f37',
    fontSize: 14,
    marginTop: 8,
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
});
