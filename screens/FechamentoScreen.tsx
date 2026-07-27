import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
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
import {
  getRegistroDiario,
  mapRegistroDiarioError,
  saveRegistroDiario,
} from '../services/registroDiario';
import { getUserConfig } from '../services/userConfig';
import type { AppStackParamList } from '../types/navigation';
import type { UserConfig } from '../types/user';
import { calcularCamposDerivados, getDataLocalHoje } from '../utils/registroDiario';
import {
  emptyRegistroDiarioFormValues,
  hasRegistroDiarioFormErrors,
  registroToFormValues,
  validateRegistroDiarioForm,
  type RegistroDiarioFormValues,
} from '../utils/registroDiarioValidation';
import { formatConfigValue } from '../utils/userConfigValidation';

type Props = NativeStackScreenProps<AppStackParamList, 'Fechamento'>;

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export function FechamentoScreen({ navigation }: Props) {
  const { user } = useAuth();
  const dataHoje = getDataLocalHoje();

  const [values, setValues] = useState<RegistroDiarioFormValues>(emptyRegistroDiarioFormValues);
  const [config, setConfig] = useState<UserConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegistroDiarioFormValues, string>>
  >({});

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const uid = user.uid;
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [userConfig, registro] = await Promise.all([
          getUserConfig(uid),
          getRegistroDiario(uid, dataHoje),
        ]);

        if (cancelled) {
          return;
        }

        setConfig(userConfig);

        if (registro) {
          setValues(registroToFormValues(registro));
        }
      } catch (err) {
        if (!cancelled) {
          setError(mapRegistroDiarioError(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [user, dataHoje]);

  const preview = useMemo(() => {
    if (!config) {
      return null;
    }

    const { input } = validateRegistroDiarioForm(values, dataHoje);
    if (!input) {
      return null;
    }

    return calcularCamposDerivados({
      faturamento: input.faturamento,
      kmRodado: input.kmRodado,
      custoCombustivel: input.custoCombustivel,
      custoManutencao: config.custoManutencaoDia,
      custoSeguro: config.custoSeguroDia,
    });
  }, [values, config, dataHoje]);

  function updateField(field: keyof RegistroDiarioFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSuccess(null);
    setError(null);
  }

  async function handleSave() {
    const { errors, input } = validateRegistroDiarioForm(values, dataHoje);

    if (hasRegistroDiarioFormErrors(errors)) {
      setFieldErrors(errors);
      setError(null);
      setSuccess(null);
      return;
    }

    if (!user || !config || !input) {
      setError('Usuário não autenticado ou configuração ausente.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    try {
      await saveRegistroDiario(user.uid, input, config);
      setSuccess('Fechamento salvo.');
    } catch (err) {
      setError(mapRegistroDiarioError(err));
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

  if (!config) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Fechamento do dia</Text>
        <Text style={styles.subtitle}>
          Configure os custos fixos antes de registrar o fechamento diário.
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.button} onPress={() => navigation.navigate('Config')}>
          <Text style={styles.buttonText}>Ir para configuração</Text>
        </Pressable>
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
        <Text style={styles.title}>Fechamento do dia</Text>
        <Text style={styles.subtitle}>Data: {dataHoje}</Text>

        <View style={styles.rateioBox}>
          <Text style={styles.rateioTitle}>Rateios automáticos (do config)</Text>
          <Text style={styles.rateioItem}>
            Manutenção: {formatCurrency(config.custoManutencaoDia)}
          </Text>
          <Text style={styles.rateioItem}>Seguro: {formatCurrency(config.custoSeguroDia)}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Km rodado</Text>
          <TextInput
            style={styles.input}
            value={values.kmRodado}
            onChangeText={(text) => updateField('kmRodado', text)}
            placeholder="Ex.: 180"
            keyboardType="decimal-pad"
            editable={!saving}
          />
          {fieldErrors.kmRodado ? (
            <Text style={styles.fieldError}>{fieldErrors.kmRodado}</Text>
          ) : null}

          <Text style={styles.label}>Faturamento (R$)</Text>
          <TextInput
            style={styles.input}
            value={values.faturamento}
            onChangeText={(text) => updateField('faturamento', text)}
            placeholder="Ex.: 420,50"
            keyboardType="decimal-pad"
            editable={!saving}
          />
          {fieldErrors.faturamento ? (
            <Text style={styles.fieldError}>{fieldErrors.faturamento}</Text>
          ) : null}

          <Text style={styles.label}>Combustível (R$)</Text>
          <TextInput
            style={styles.input}
            value={values.custoCombustivel}
            onChangeText={(text) => updateField('custoCombustivel', text)}
            placeholder="Ex.: 85,00"
            keyboardType="decimal-pad"
            editable={!saving}
          />
          {fieldErrors.custoCombustivel ? (
            <Text style={styles.fieldError}>{fieldErrors.custoCombustivel}</Text>
          ) : null}

          {preview ? (
            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>Resumo calculado</Text>
              <Text style={styles.previewItem}>Gasto total: {formatCurrency(preview.gastoTotal)}</Text>
              <Text style={styles.previewItem}>
                Lucro líquido: {formatCurrency(preview.lucroLiquido)}
              </Text>
              <Text style={styles.previewItem}>
                Média R$/km: {formatConfigValue(preview.mediaRsPorKm)}
              </Text>
            </View>
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
              <Text style={styles.buttonText}>Salvar fechamento</Text>
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
    lineHeight: 22,
  },
  rateioBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    gap: 4,
    marginBottom: 8,
  },
  rateioTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
  },
  rateioItem: {
    fontSize: 14,
    color: '#555',
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
  previewBox: {
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    padding: 12,
    gap: 4,
    marginTop: 8,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a4d8f',
    marginBottom: 4,
  },
  previewItem: {
    fontSize: 14,
    color: '#333',
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
