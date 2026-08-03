# Firestore Schema — Uber Faturamento

Schema definitivo usado por todas as telas e cálculos do app.

## Visão geral

```
users/{uid}
  config: UserConfig

users/{uid}/registrosDiarios/{YYYY-MM-DD}
  RegistroDiario
```

Cada usuário autenticado (`uid` do Firebase Auth) possui um documento em `users/{uid}` com configurações fixas e uma subcoleção `registrosDiarios` com um registro por dia.

> **Nota:** o path `users/{uid}/_smoke/ping` existe apenas para smoke test de conectividade e **não faz parte** do modelo de negócio.

---

## `users/{uid}`

Documento do usuário. Contém apenas o campo `config`.

### `config` — `UserConfig`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `valorLitroCombustivel` | `number` | Preço do litro de combustível (R$). Editável a qualquer momento. |
| `kmPorLitro` | `number` | Consumo médio do veículo (km/L). |
| `custoManutencaoDia` | `number` | Rateio diário fixo de manutenção (ex.: custo mensal ÷ 30). |
| `custoSeguroDia` | `number` | Rateio diário fixo de seguro (ex.: custo mensal ÷ 30). |

### Exemplo

```json
{
  "config": {
    "valorLitroCombustivel": 5.89,
    "kmPorLitro": 12.5,
    "custoManutencaoDia": 16.67,
    "custoSeguroDia": 10.00
  }
}
```

---

## `users/{uid}/registrosDiarios/{YYYY-MM-DD}`

Um documento por dia. O **ID do documento é a data** no formato `YYYY-MM-DD` (ex.: `2026-07-27`).

### Por que usar a data como ID?

Salvar novamente no mesmo dia funciona como **upsert** (`setDoc` com merge ou overwrite), evitando registros duplicados. Nunca usar `addDoc` com ID automático para esta subcoleção.

### Campos — `RegistroDiario`

| Campo | Tipo | Origem | Descrição |
|-------|------|--------|-----------|
| `data` | `string` | Input | Data do registro (`YYYY-MM-DD`). Deve coincidir com o ID do documento. |
| `kmRodado` | `number` | Input | Quilometragem rodada no dia. |
| `faturamento` | `number` | Input | Receita bruta do dia (R$). |
| `custoCombustivel` | `number` | Input | Custo de combustível digitado manualmente no fechamento do dia. |
| `custoManutencao` | `number` | Snapshot | Copiado de `config.custoManutencaoDia` no momento do save. |
| `custoSeguro` | `number` | Snapshot | Copiado de `config.custoSeguroDia` no momento do save. |
| `gastoTotal` | `number` | Calculado | `custoCombustivel + custoManutencao + custoSeguro` |
| `lucroLiquido` | `number` | Calculado | `faturamento - gastoTotal` |
| `mediaRsPorKm` | `number` | Calculado | `faturamento / kmRodado` (0 se `kmRodado === 0`) |
| `timestamp` | `Timestamp` | Sistema | Momento do último save (`serverTimestamp()` na escrita). |

### Regras de negócio

1. **Snapshot de custos fixos:** `custoManutencao` e `custoSeguro` são copiados do `config` no momento do registro, não referenciados. Isso preserva o histórico correto mesmo se o usuário alterar o rateio depois.

2. **Campos calculados persistidos:** `gastoTotal`, `lucroLiquido` e `mediaRsPorKm` são calculados no client e salvos prontos no documento. Evita recálculo repetido nas telas de listagem e agregação.

3. **Upsert por data:** reabrir o fechamento do mesmo dia sobrescreve o documento existente (mesmo ID).

### Fórmulas

```
gastoTotal    = custoCombustivel + custoManutencao + custoSeguro
lucroLiquido  = faturamento - gastoTotal
mediaRsPorKm  = kmRodado > 0 ? faturamento / kmRodado : 0
```

### Exemplo

```json
{
  "data": "2026-07-27",
  "kmRodado": 180,
  "faturamento": 420.50,
  "custoCombustivel": 85.00,
  "custoManutencao": 16.67,
  "custoSeguro": 10.00,
  "gastoTotal": 111.67,
  "lucroLiquido": 308.83,
  "mediaRsPorKm": 2.34,
  "timestamp": "<Firestore Timestamp>"
}
```

---

## Tipos TypeScript

Definidos em:

- `types/user.ts` — `UserConfig`, `UserDoc`
- `types/registroDiario.ts` — `RegistroDiario`, `RegistroDiarioInput`, `AgregadoPeriodo`, payloads de leitura/escrita

## Helpers

- `utils/calculos.ts` — funções puras de cálculo financeiro (`calcularGastoTotal`, `calcularLucroLiquido`, `calcularMediaRsPorKm`, `agregarPeriodo`)
- `utils/registroDiario.ts` — validação de ID, cálculo de campos derivados (via `calculos.ts`), montagem do documento
- `utils/intervaloDatas.ts` — intervalos de datas locais (`getIntervaloSemanaAtual`, `getIntervaloMesAtual`, `getIntervaloMesEspecifico`); semana = segunda→domingo; mês = dia 1º→último dia
- `services/paths.ts` — referências tipadas `userDoc(uid)`, `registroDiarioDoc(uid, data)` e `registrosDiariosCollection(uid)`
- `services/registroDiario.ts` — CRUD unitário (`getRegistroDiario`, `saveRegistroDiario`) e query por período (`buscarRegistrosPorPeriodo`)

### Query por período

`buscarRegistrosPorPeriodo(uid, dataInicio, dataFim)` consulta `registrosDiarios` com:

```
where("data", ">=", dataInicio)
where("data", "<=", dataFim)
orderBy("data")
```

Retorna `RegistroDiario[]` tipado (documentos inválidos são descartados). Use os helpers de `utils/intervaloDatas.ts` para obter `dataInicio`/`dataFim`.

### Agregação de período

Para totais semanais/mensais, use `agregarPeriodo(registros)` em `utils/calculos.ts`. A média R$/km do período é **recalculada** como `totalFaturamento / totalKm` — nunca como média das médias diárias. Se `totalKm === 0`, `mediaRsPorKm` retorna `0`.

---

## Próximos passos (fora desta task)

- Regras de segurança Firestore (`firestore.rules`) — restringir `users/{uid}` ao próprio `uid`
- CRUD nas telas (tasks 5 e 6)
- Remoção do smoke test quando auth real estiver pronta
