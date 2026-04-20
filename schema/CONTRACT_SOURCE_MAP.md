# CONTRACT_SOURCE_MAP — Mapa de Fontes e Ponte Documental Operacional — ENOVA 2

> **Este documento é a ponte explícita entre o contrato ativo, o legado operacional, o PDF mestre, o status vivo e o handoff.**
> Todo agente deve consultar este documento ao iniciar qualquer tarefa para entender qual fonte de verdade usar e quando.
> Este documento não substitui nenhum artefato — ele conecta e esclarece a relação entre eles.

---

## 1. Mapa de fontes de verdade

| Artefato | Caminho canônico | Papel | Precedência | Quando consultar |
|----------|-----------------|-------|-------------|-----------------|
| Índice de contratos | `schema/contracts/_INDEX.md` | Registro canônico de qual contrato está ativo por frente | 4ª — após A00, A01, A02 | **Sempre** — primeira leitura de qualquer execução contratual |
| Contrato ativo da frente | `schema/contracts/active/<NOME>.md` | Autorização formal de execução — define objetivo, escopo, critérios e blocos legados | 5ª | **Sempre** — antes de qualquer execução técnica; ausência = condição de parada |
| Status vivo da frente | `schema/status/<FRENTE>_STATUS.md` | Estado atual persistido da frente — o que foi feito, o que está pendente, próximo passo | Complementar ao contrato | **Sempre** — leitura obrigatória antes de executar (Etapa 5 do CODEX_WORKFLOW) |
| Handoff da frente | `schema/handoffs/<FRENTE>_LATEST.md` | Contexto narrativo para continuidade — o que a PR anterior fechou/não fechou | Complementar ao contrato | **Sempre** — leitura obrigatória antes de executar (Etapa 6 do CODEX_WORKFLOW) |
| Índice do legado mestre | `schema/legacy/INDEX_LEGADO_MESTRE.md` | Painel operacional do legado — qual bloco lida com o quê, quais frentes consomem, ordem de leitura | Legado — subordinado ao contrato ativo | **Sempre** — para identificar quais blocos L/C são aplicáveis à frente ativa |
| Legado mestre markdown | `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` | Blocos transcritos do PDF à medida que são incorporados — fonte operacional derivada | Legado — subordinado ao contrato ativo | Quando o bloco necessário estiver com status `Transcrito` ou `Revisado e validado` |
| PDF mestre (fonte bruta) | `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` | Documento original — prevalece sobre derivações em caso de conflito | Fonte bruta — prevalece sobre o markdown em conflito | Quando o bloco necessário **não estiver transcrito** no markdown; quando houver conflito entre markdown e regra de negócio esperada |

---

## 2. Precedência entre fontes

```
A00 > A01 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato ativo da frente
    > INDEX_LEGADO_MESTRE (blocos aplicáveis identificados)
    > LEGADO_MESTRE_ENOVA1_ENOVA2.md (blocos transcritos)
    > LEGADO_MESTRE_ENOVA1_ENOVA2.pdf (fonte bruta — prevalece sobre markdown em conflito)
```

**Regra de conflito:**
- Se o markdown (`LEGADO_MESTRE_ENOVA1_ENOVA2.md`) e o PDF (`LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`) divergirem: **o PDF prevalece**.
- Se o contrato ativo e o legado divergirem: **o contrato ativo prevalece** (o legado alimenta o contrato, não o contradiz).
- Se o A00/A01/A02 e o contrato ativo divergirem: **A00/A01/A02 prevalecem** — o contrato não pode contradizer o plano macro.

---

## 3. Fluxo de descoberta contratual — passo a passo

O agente deve percorrer este fluxo **em ordem**, sem pular etapas:

### Passo 1 — Localizar o índice de contratos
```
schema/contracts/_INDEX.md
```
- Ler a tabela "Contratos ativos por frente".
- Identificar a linha correspondente à frente desta tarefa.
- Verificar se há contrato ativo (coluna "Contrato ativo").

### Passo 2 — Verificar existência do contrato ativo
- **Se houver contrato ativo**: o arquivo está em `schema/contracts/active/<NOME>.md`.
  → Ler o contrato antes de qualquer execução.
- **Se NÃO houver contrato ativo**: ver Regra de ausência abaixo (Seção 4).

### Passo 3 — Localizar o status vivo da frente
```
schema/status/<FRENTE>_STATUS.md
```
- Exemplos: `CORE_MECANICO_2_STATUS.md`, `SPEECH_ENGINE_STATUS.md`.
- O índice de status está em `schema/status/_INDEX.md`.

### Passo 4 — Localizar o handoff da frente
```
schema/handoffs/<FRENTE>_LATEST.md
```
- Exemplos: `CORE_MECANICO_2_LATEST.md`, `SPEECH_ENGINE_LATEST.md`.
- O índice de handoffs está em `schema/handoffs/_INDEX.md`.

### Passo 5 — Identificar blocos legados aplicáveis
```
schema/legacy/INDEX_LEGADO_MESTRE.md  ← primeiro
```
- Consultar a tabela "Amarração por frente" para identificar os blocos L/C obrigatórios e complementares da frente ativa.
- Os blocos declarados no contrato ativo prevalecem sobre este índice (o contrato é mais específico).

### Passo 6 — Acessar os blocos legados

Para cada bloco identificado:
1. Verificar o status de incorporação no `INDEX_LEGADO_MESTRE.md`.
2. Se status = `Transcrito` ou `Revisado e validado`:
   → Navegar ao bloco no `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.
3. Se status = `Identificado estruturalmente — não transcrito` ou `Estrutura reservada — não confirmado`:
   → Referenciar diretamente o PDF: `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`.
   → Declarar explicitamente que o PDF foi consultado e em qual seção.

### Passo 7 — Declarar as fontes consultadas (obrigatório)
Ver Seção 5 abaixo.

---

## 4. Regra de ausência de contrato ativo

> **Ausência de contrato ativo NÃO autoriza improvisação contratual.**

Se `schema/contracts/_INDEX.md` indicar "*(nenhum — aguardando abertura)*" para a frente:

1. **Parar** — não iniciar execução contratual.
2. **Reportar** — declarar explicitamente no ESTADO HERDADO: `Contrato ativo: Nenhum — ausência é condição de parada para execução contratual`.
3. **Não improvisar** — nenhum escopo, objetivo ou critério pode ser inventado ou presumido.
4. **Autorização necessária** — a abertura de contrato é uma tarefa de governança separada, autorizada pelo A01.
5. **Exceção única** — tarefas classificadas como `governança`, `diagnostico` ou `correcao_incidental` podem prosseguir sem contrato ativo, desde que **não abram execução contratual de negócio** e declarem explicitamente esta condição.

---

## 5. Como o agente deve declarar as fontes lidas

Em todo `ESTADO HERDADO` e `ESTADO ENTREGUE`, o agente deve declarar:

```
Fontes de verdade consultadas:
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         schema/contracts/active/<NOME>.md | Nenhum — ausência declarada
  Status da frente lido:       schema/status/<FRENTE>_STATUS.md
  Handoff da frente lido:      schema/handoffs/<FRENTE>_LATEST.md
  Índice legado consultado:    schema/legacy/INDEX_LEGADO_MESTRE.md
  Legado markdown consultado:  schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md — blocos <lista> | N/A
  PDF mestre consultado:       schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf — seção <X> | não consultado — blocos transcritos disponíveis
```

**Regras de declaração:**
- O campo `Contrato ativo lido` é obrigatório — mesmo quando a resposta for "Nenhum".
- O campo `PDF mestre consultado` é obrigatório quando qualquer bloco legado necessário não estiver transcrito no markdown.
- Caminhos relativos à raiz do repositório, sempre explícitos.
- Nunca declarar "lido" um arquivo que não foi efetivamente consultado.

---

## 6. Quando consultar o PDF mestre

O agente **DEVE** consultar `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` quando:

1. O contrato ativo declara blocos legados obrigatórios com status `Identificado estruturalmente — não transcrito`.
2. O bloco necessário não existe ou não está completo no `LEGADO_MESTRE_ENOVA1_ENOVA2.md`.
3. Houver divergência entre o markdown e as regras de negócio esperadas — o PDF é árbitro final.
4. A tarefa envolve abertura de novo contrato que precisa definir blocos legados aplicáveis.

O agente **NÃO PRECISA** consultar o PDF quando:
1. O bloco necessário está com status `Transcrito` ou `Revisado e validado` no markdown.
2. A tarefa é de governança pura (sem consumo de regras de negócio do legado).

**Ao consultar o PDF, declarar obrigatoriamente:**
```
PDF mestre consultado: sim
  Seção/bloco consultado: <L0x | C0y | seção específica>
  Motivo: <por que o markdown não era suficiente>
```

---

## 7. Relação entre os artefatos

```
schema/contracts/_INDEX.md
      │
      ▼ identifica contrato ativo
schema/contracts/active/<NOME>.md
      │                   │
      │                   ▼ declara blocos legados obrigatórios
      │          schema/legacy/INDEX_LEGADO_MESTRE.md
      │                   │
      │          ┌────────┴────────┐
      │          ▼                 ▼
      │   LEGADO_MESTRE_   schema/source/
      │   ENOVA1_ENOVA2.md LEGADO_MESTRE_
      │   (blocos transcritos) ENOVA1_ENOVA2.pdf
      │                         (fonte bruta — árbitro em conflito)
      │
      ▼ estado atual da frente
schema/status/<FRENTE>_STATUS.md
      │
      ▼ contexto narrativo de continuidade
schema/handoffs/<FRENTE>_LATEST.md
```

---

## 8. Documentos relacionados

- `schema/contracts/_INDEX.md` — índice canônico de contratos ativos
- `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` — como executar um recorte do contrato
- `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` — como encerrar um contrato formalmente
- `schema/CONTRACT_SCHEMA.md` — formato obrigatório de qualquer contrato novo
- `schema/legacy/INDEX_LEGADO_MESTRE.md` — índice operacional do legado mestre
- `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — blocos transcritos do legado
- `schema/source/README.md` — papel e regras do PDF mestre
- `schema/CODEX_WORKFLOW.md` — protocolo de execução (seção 3, etapas 2–7)
- `schema/STATUS_SCHEMA.md` — formato de status vivo
- `schema/HANDOFF_SCHEMA.md` — formato de handoff persistido
