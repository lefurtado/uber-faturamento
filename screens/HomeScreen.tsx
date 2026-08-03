import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { mapAuthError } from '../services/auth';
import {
  buscarRegistrosPorPeriodo,
  mapRegistroDiarioError,
} from '../services/registroDiario';
import type { AppStackParamList } from '../types/navigation';
import type { AgregadoPeriodo } from '../types/registroDiario';
import { agregarPeriodo } from '../utils/calculos';
import {
  getIntervaloMesAtual,
  getIntervaloSemanaAtual,
  type IntervaloDatas,
} from '../utils/intervaloDatas';
import { getDataLocalHoje } from '../utils/registroDiario';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

type PeriodoMode = 'diario' | 'semanal' | 'mensal';

const PERIODO_OPTIONS: { mode: PeriodoMode; label: string }[] = [
  { mode: 'diario', label: 'Diário' },
  { mode: 'semanal', label: 'Semanal' },
  { mode: 'mensal', label: 'Mensal' },
];

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function resolverIntervalo(mode: PeriodoMode): IntervaloDatas {
  if (mode === 'diario') {
    const hoje = getDataLocalHoje();
    return { dataInicio: hoje, dataFim: hoje };
  }

  if (mode === 'semanal') {
    return getIntervaloSemanaAtual();
  }

  return getIntervaloMesAtual();
}

export function HomeScreen({ navigation }: Props) {
  const { user, logOut } = useAuth();
  const [mode, setMode] = useState<PeriodoMode>('diario');
  const [agregado, setAgregado] = useState<AgregadoPeriodo | null>(null);
  const [temRegistro, setTemRegistro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const loadResumo = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { dataInicio, dataFim } = resolverIntervalo(mode);
      const registros = await buscarRegistrosPorPeriodo(user.uid, dataInicio, dataFim);
      setAgregado(agregarPeriodo(registros));
      setTemRegistro(registros.length > 0);
    } catch (err) {
      setError(mapRegistroDiarioError(err));
      setAgregado(null);
      setTemRegistro(false);
    } finally {
      setLoading(false);
    }
  }, [user, mode]);

  useFocusEffect(
    useCallback(() => {
      loadResumo();
    }, [loadResumo]),
  );

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError(null);

    try {
      await logOut();
    } catch (err) {
      setLogoutError(mapAuthError(err));
    } finally {
      setLoggingOut(false);
    }
  }

  const mostrarResumo = agregado && (mode !== 'diario' || temRegistro);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Uber Faturamento</Text>
      {user?.email ? <Text style={styles.email}>{user.email}</Text> : null}

      <View style={styles.toggleRow}>
        {PERIODO_OPTIONS.map((option) => {
          const isActive = mode === option.mode;

          return (
            <Pressable
              key={option.mode}
              style={[styles.toggleOption, isActive && styles.toggleOptionActive]}
              onPress={() => setMode(option.mode)}
            >
              <Text style={[styles.toggleText, isActive && styles.toggleTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : mode === 'diario' && !temRegistro ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Sem registro hoje</Text>
          <Text style={styles.emptyHint}>Feche o dia para ver o resumo financeiro.</Text>
        </View>
      ) : mostrarResumo ? (
        <View style={styles.resumoBox}>
          <View style={styles.resumoRow}>
            <Text style={styles.resumoLabel}>Faturamento:</Text>
            <Text style={styles.resumoValue}>{formatCurrency(agregado.totalFaturamento)}</Text>
          </View>
          <View style={styles.resumoRow}>
            <Text style={styles.resumoLabel}>Lucro líquido:</Text>
            <Text style={styles.resumoValue}>{formatCurrency(agregado.totalLucro)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.resumoRow}>
            <Text style={styles.resumoLabel}>Gastos:</Text>
            <Text style={styles.resumoValue}>{formatCurrency(agregado.totalGasto)}</Text>
          </View>
          <View style={styles.resumoRowIndented}>
            <Text style={styles.resumoSubLabel}>Combustível</Text>
            <Text style={styles.resumoSubValue}>
              {formatCurrency(agregado.totalCustoCombustivel)}
            </Text>
          </View>
          <View style={styles.resumoRowIndented}>
            <Text style={styles.resumoSubLabel}>Manutenção</Text>
            <Text style={styles.resumoSubValue}>
              {formatCurrency(agregado.totalCustoManutencao)}
            </Text>
          </View>
          <View style={styles.resumoRowIndented}>
            <Text style={styles.resumoSubLabel}>Seguro</Text>
            <Text style={styles.resumoSubValue}>{formatCurrency(agregado.totalCustoSeguro)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.resumoRow}>
            <Text style={styles.resumoLabel}>Média R$/km:</Text>
            <Text style={styles.resumoValue}>{formatCurrency(agregado.mediaRsPorKm)}</Text>
          </View>
        </View>
      ) : null}

      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('Fechamento')}
      >
        <Text style={styles.buttonText}>Fechar o dia</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Config')}>
        <Text style={styles.secondaryButtonText}>Configuração de custos</Text>
      </Pressable>

      <Pressable
        style={[styles.secondaryButton, loggingOut && styles.buttonDisabled]}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator color="#111" />
        ) : (
          <Text style={styles.secondaryButtonText}>Sair</Text>
        )}
      </Pressable>

      {logoutError ? <Text style={styles.error}>{logoutError}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  email: {
    fontSize: 14,
    color: '#444',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  toggleOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  toggleOptionActive: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  toggleTextActive: {
    color: '#fff',
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    gap: 4,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emptyHint: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  resumoBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  resumoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  resumoRowIndented: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 12,
  },
  resumoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  resumoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  resumoSubLabel: {
    fontSize: 14,
    color: '#555',
  },
  resumoSubValue: {
    fontSize: 14,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 4,
  },
  button: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  secondaryButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#cf222e',
    fontSize: 14,
    textAlign: 'center',
  },
});
