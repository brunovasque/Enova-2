# CONTRATO TÉCNICO — Módulo E1 — Memória, Base Normativa, Regras Comerciais e Aprendizado Operacional — ENOVA 2

| Campo | Valor |
|---|---|
| Tipo | Artefato técnico canônico — PR2 do Contrato Extraordinário E1 |
| Módulo | Memória, Base Normativa, Regras Comerciais e Aprendizado Operacional |
| Identificador canônico | E1 |
| Contrato extraordinário de origem | `schema/contracts/extraordinary/active/CONTRATO_EXTRAORDINARIO_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL.md` |
| Fase | PR2 — contrato técnico (sem runtime) |
| Status | fechado — contrato técnico completo |
| Criado em | 2026-04-22 |
| Última atualização | 2026-04-22 |

---

> **AVISO CANÔNICO — LEITURA OBRIGATÓRIA ANTES DE QUALQUER USO DESTE ARTEFATO**
>
> Este arquivo é o contrato técnico do módulo E1. Ele **fecha** shapes, vínculos, regras de leitura/escrita e regras de evidência **para consumo pela PR3 (runtime mínimo)**.
>
> **Esta PR2 NÃO implementa runtime.**
> **Esta PR2 NÃO mexe em `src/`.**
> **Esta PR2 NÃO altera CRM ou camada cognitiva de forma funcional.**
> **Esta PR2 NÃO ingere normativos reais.**
>
> Qualquer PR que tente executar runtime antes de PR3 viola este contrato.

---

## 1. Finalidade deste artefato

Este artefato técnico canônico define com precisão o shape de dados, as regras de leitura/escrita, as regras de evidência e os vínculos técnicos das 4 camadas do módulo E1 — sem qualquer implementação de runtime.

Ele serve como:

- **Contrato técnico** que a PR3 (runtime mínimo) deve implementar fielmente.
- **Referência de shapes** para toda integração futura com CRM, atendimento e camada cognitiva.
- **Linha de base** do que é proibido mesmo após a PR3.

---

## 2. Contexto herdado

| Ponto | Estado |
|---|---|
| Macro ENOVA 2 | Encerrado na Frente 8 |
| Contrato extraordinário E1 | Aberto na PR1 |
| Status do contrato | aberto — aguardando PR2 (esta PR) |
| Próximo passo após esta PR2 | PR3 — runtime mínimo do módulo |
| Mudanças em `src/` nesta PR2 | **zero** |
| Mudanças em CRM nesta PR2 | **zero** |
| Ingestão de normativos reais nesta PR2 | **zero** |

---

## 3. As 4 camadas do módulo — visão técnica

```
CAMADA A — Base Normativa Consultiva
  └─ ItemNormativo (somente leitura + consulta ancorada)

CAMADA B — Regras Comerciais Operacionais
  └─ RegraComercial (leitura/escrita com versionamento obrigatório)

CAMADA C — Memória e Aprendizado Operacional
  ├─ MemoriaPorLead        (leitura/escrita + evidência obrigatória)
  ├─ MemoriaPorAtendimento (append-only + evidência obrigatória)
  ├─ Sinal                 (inferência marcada + evidência mínima)
  ├─ PadraoDetectado       (inferência + n_minimo_evidencias)
  ├─ ObjecaoProvavel       (predição marcada + evidência mínima)
  └─ OutcomeReal           (somente via CRM/Supabase — não inferido)

CAMADA D — Memória Manual / Diretiva Operacional
  └─ DiretivaMannual       (append+versão + autor + auditoria)
```

---

## 4. CAMADA A — Shape de Item Normativo Consultivo

### 4.1 Shape completo

```typescript
interface ItemNormativo {
  // === CAMPOS OBRIGATÓRIOS ===
  id: string;                        // UUID único do item normativo
  source_type: ItemNormativoSourceType; // tipo da fonte (ver 4.2)
  source_name: string;               // nome legível da fonte (ex: "Normativo CEF 2024-03")
  title: string;                     // título ou cabeçalho da norma
  excerpt: string;                   // trecho textual exato da norma (sem paráfrase)
  effective_date: string;            // data de vigência (ISO 8601: YYYY-MM-DD)
  scope: string;                     // escopo de aplicação (ex: "MCMV Faixa 1 e 2, todo o Brasil")
  confidence: ItemNormativoConfidence; // nível de confiança (ver 4.3)
  citation_ref: string;              // referência de citação (ex: "CEF-2024-03 §4.2.1")
  status: ItemNormativoStatus;       // ver 4.4

  // === CAMPOS OPCIONAIS ===
  tags?: string[];                   // etiquetas para busca/filtragem
  expiry_date?: string;              // data de expiração/revisão programada (ISO 8601)
  superseded_by?: string;            // ID do item normativo que substitui este (se desatualizado)
  conflict_ids?: string[];           // IDs de normas conflitantes conhecidas
  notes?: string;                    // notas internas de contexto (não expostas ao cliente)

  // === CAMPOS DE AUDITORIA ===
  created_at: string;                // timestamp de registro (ISO 8601)
  created_by: string;                // ID do operador/sistema que registrou
  updated_at?: string;               // timestamp de última atualização
  updated_by?: string;               // ID de quem atualizou
}
```

### 4.2 Enum: `ItemNormativoSourceType`

```typescript
type ItemNormativoSourceType =
  | 'cef_normativo'          // normativo CEF oficial
  | 'mcmv_regulamento'       // regulamento MCMV
  | 'politica_credito'       // política de crédito interna
  | 'documento_produto'      // documento de produto interno
  | 'playbook_operacional'   // playbook de operação
  | 'regra_elegibilidade'    // critério de elegibilidade formal
  | 'manual_atendimento'     // manual de atendimento interno
  | 'outro_oficial';         // outro documento oficial identificado
```

### 4.3 Enum: `ItemNormativoConfidence`

```typescript
type ItemNormativoConfidence =
  | 'alta'        // fonte direta, trecho exato, data de vigência confirmada
  | 'media'       // fonte identificada mas trecho extraído/parafraseado com nota
  | 'baixa'       // fonte identificada mas conteúdo incerto ou possivelmente desatualizado
  | 'expirada';   // item sabidamente desatualizado — mantido apenas para histórico
```

### 4.4 Enum: `ItemNormativoStatus`

```typescript
type ItemNormativoStatus =
  | 'ativo'         // vigente e aplicável
  | 'desatualizado' // data de vigência expirada ou substituído
  | 'suspenso'      // em revisão — não deve ser consultado até revisão
  | 'arquivado';    // encerrado formalmente — somente histórico
```

### 4.5 Regras obrigatórias da Camada A

| # | Regra |
|---|-------|
| A.1 | `excerpt` deve ser o trecho **exato** da norma — paráfrase só permitida em `notes`, nunca em `excerpt`. |
| A.2 | `confidence = 'alta'` exige: `source_name` identificável + `citation_ref` com seção exata + `effective_date` confirmada. |
| A.3 | Item com `status = 'desatualizado'` pode ser lido mas **não pode ser aplicado** — deve retornar aviso ao consumidor. |
| A.4 | Item com `status = 'suspenso'` é bloqueado para consulta até revisão humana. |
| A.5 | Conflito entre dois itens ativos deve ser declarado via `conflict_ids` — **nunca resolvido silenciosamente**. |
| A.6 | Norma **não pode ser sobrescrita** por Camada B, C ou D — em conflito, Camada A prevalece. |
| A.7 | Toda consulta normativa devolvida ao cliente/atendente deve incluir `citation_ref` e `source_name`. |

---

## 5. CAMADA B — Shape de Regra Comercial Operacional

### 5.1 Shape completo

```typescript
interface RegraComercial {
  // === CAMPOS OBRIGATÓRIOS ===
  id: string;                           // UUID único da regra
  origin: RegraComercialOrigin;         // origem da regra (ver 5.2)
  scope: string;                        // escopo de aplicação (ex: "leads com renda familiar < 3 SM")
  priority: RegraComercialPriority;     // prioridade de aplicação (ver 5.3)
  rule_type: RegraComercialType;        // tipo da regra (ver 5.4)
  activation_context: string;          // quando esta regra deve ser ativada (ex: "lead questiona valor antes de visita")
  guidance: string;                     // instrução de condução para a atendente
  restrictions: string[];               // lista do que esta regra **não pode fazer**
  conflict_policy: RegraComercialConflictPolicy; // como agir se conflitar (ver 5.5)
  status: RegraComercialStatus;         // ver 5.6
  updated_at: string;                   // timestamp da última atualização (ISO 8601)

  // === CAMPOS OPCIONAIS ===
  version: number;                      // versão numérica (1, 2, 3...) — começa em 1
  previous_version_id?: string;         // ID da versão anterior desta regra
  supersedes?: string;                  // ID de regra que esta substitui
  tags?: string[];                      // etiquetas para filtragem
  examples?: string[];                  // exemplos de aplicação (texto livre)
  normativo_conflict_ids?: string[];    // IDs de itens normativos que conflitam com esta regra
  notes?: string;                       // notas internas

  // === CAMPOS DE AUDITORIA ===
  created_at: string;                   // timestamp de criação (ISO 8601)
  created_by: string;                   // ID do operador que criou
  updated_by?: string;                  // ID de quem atualizou
}
```

### 5.2 Enum: `RegraComercialOrigin`

```typescript
type RegraComercialOrigin =
  | 'playbook_oficial'      // playbook operacional documentado
  | 'treinamento_registrado' // treinamento com registro formal
  | 'diretriz_operador'     // diretriz registrada por operador com autoridade
  | 'empirico_validado';    // heurística empírica com evidência mínima confirmada (ver regra B.6)
```

### 5.3 Enum: `RegraComercialPriority`

```typescript
type RegraComercialPriority =
  | 'critica'  // deve ser aplicada sempre que o contexto bater — sem exceção
  | 'alta'     // deve ser aplicada salvo conflito com regra crítica
  | 'media'    // aplicada quando não houver regra de maior prioridade no mesmo contexto
  | 'baixa';   // sugestiva — atendente pode escolher não aplicar
```

### 5.4 Enum: `RegraComercialType`

```typescript
type RegraComercialType =
  | 'abordagem_comercial'  // como conduzir a conversa
  | 'objecao'              // como tratar objeção específica
  | 'fechamento'           // estratégia de fechamento
  | 'timing'               // quando não falar algo / quando introduzir algo
  | 'restricao'            // o que nunca fazer ou prometer
  | 'composicao'           // regra de composição familiar/renda
  | 'documentacao'         // quando pedir ou não pedir docs
  | 'visita'               // quando e como puxar visita
  | 'fallback';            // instrução de fallback para situações não mapeadas
```

### 5.5 Enum: `RegraComercialConflictPolicy`

```typescript
type RegraComercialConflictPolicy =
  | 'norma_prevalece'           // Camada A vence — regra suspensa automaticamente
  | 'core_prevalece'            // decisão do Core Mecânico vence
  | 'operador_decide'           // conflito vai para revisão humana
  | 'regra_mais_alta_prevalece'; // regra de maior prioridade vence entre B's
```

### 5.6 Enum: `RegraComercialStatus`

```typescript
type RegraComercialStatus =
  | 'ativa'     // aplicável
  | 'suspensa'  // conflito detectado — não aplicar até revisão
  | 'obsoleta'  // substituída por versão mais recente
  | 'arquivada'; // encerrada formalmente
```

### 5.7 Regras obrigatórias da Camada B

| # | Regra |
|---|-------|
| B.1 | `guidance` é instrução de **condução** — nunca decisão final. |
| B.2 | `restrictions` deve listar explicitamente o que a regra **não autoriza**. |
| B.3 | `activation_context` deve ser testável — evitar "sempre" ou "nunca" sem contexto. |
| B.4 | Regra com `origin = 'empirico_validado'` exige `normativo_conflict_ids` declarados (mesmo que vazio). |
| B.5 | Qualquer conflito com item normativo ativo resulta em `status = 'suspensa'` automático. |
| B.6 | Atualização de regra cria **nova versão** — não sobrescreve. `previous_version_id` deve ser linkado. |
| B.7 | `created_by` e `updated_by` são obrigatórios — sem trilha anônima. |

---

## 6. CAMADA C — Shapes de Memória e Aprendizado Operacional

### 6.1 Shape: Memória por Lead

```typescript
interface MemoriaPorLead {
  // === CAMPOS OBRIGATÓRIOS ===
  id: string;                          // UUID único desta memória
  lead_id: string;                     // ID do lead no CRM (fonte de verdade)
  tipo: MemoriaPorLeadTipo;            // ver 6.1.1
  conteudo: string;                    // conteúdo estruturado ou textual da memória
  evidencia_tipo: EvidenciaTipo;       // classificação da evidência (ver 6.5)
  origem: MemoriaOrigem;               // de onde veio (ver 6.6)
  status: MemoriaStatus;               // ver 6.7
  created_at: string;                  // timestamp de criação (ISO 8601)
  created_by: string;                  // ID do sistema/operador que criou

  // === CAMPOS OPCIONAIS ===
  atendimento_id?: string;             // ID do atendimento de origem (se aplicável)
  confianca?: MemoriaConfianca;        // nível de confiança (ver 6.8)
  validade_ate?: string;               // data de expiração desta memória (ISO 8601)
  tags?: string[];
  notas?: string;
  updated_at?: string;
  updated_by?: string;
}
```

**6.1.1 Enum: `MemoriaPorLeadTipo`**

```typescript
type MemoriaPorLeadTipo =
  | 'preferencia_declarada'   // preferência que o lead declarou explicitamente
  | 'historico_objecao'       // objeção já levantada em atendimento anterior
  | 'dado_financeiro_extra'   // dado financeiro mencionado não coletado via slot formal
  | 'contexto_familiar'       // informação sobre composição familiar relevante
  | 'historico_visitas'       // visitas realizadas e reações observadas
  | 'sinal_risco'             // sinal de risco de abandono detectado anteriormente
  | 'nota_operacional'        // nota livre de atendente com evidência
  | 'outro';
```

### 6.2 Shape: Memória por Atendimento

```typescript
interface MemoriaPorAtendimento {
  // === CAMPOS OBRIGATÓRIOS ===
  id: string;                          // UUID único desta memória de atendimento
  atendimento_id: string;              // ID do atendimento (fonte de verdade)
  lead_id: string;                     // ID do lead no CRM
  abordagens_usadas: string[];         // IDs ou descrições de abordagens aplicadas
  objecoes_encontradas: string[];      // objeções que apareceram durante o atendimento
  sinais_emitidos: string[];           // sinais detectados durante o atendimento (IDs de Sinal)
  decisoes_tomadas: string[];          // decisões operacionais tomadas (ex: "puxou visita")
  outcome_id?: string;                 // ID do OutcomeReal vinculado (nullable até closeout)
  evidencia_tipo: EvidenciaTipo;       // ver 6.5 — sempre 'real_crm' ou 'real_atendimento'
  status: MemoriaStatus;               // ver 6.7
  created_at: string;
  created_by: string;                  // sistema que registrou

  // === CAMPOS OPCIONAIS ===
  duracao_minutos?: number;
  canal?: string;                      // ex: "whatsapp", "telefone"
  fase_funil?: string;                 // stage do funil no momento do atendimento
  notas?: string;
  tags?: string[];
}
```

**Regra C.Atendimento.1:** `MemoriaPorAtendimento` é **append-only** — não pode ser editado após fechamento do atendimento. Apenas `outcome_id` pode ser vinculado posteriormente.

### 6.3 Shape: Sinal

```typescript
interface Sinal {
  // === CAMPOS OBRIGATÓRIOS ===
  id: string;                          // UUID único do sinal
  atendimento_id: string;              // atendimento onde o sinal foi detectado
  lead_id: string;
  sinal_tipo: SinalTipo;               // ver 6.3.1
  descricao: string;                   // descrição textual do sinal
  evidencia_tipo: EvidenciaTipo;       // ver 6.5 — 'inferencia' é válida aqui, mas marcada
  confianca: MemoriaConfianca;         // ver 6.8 — obrigatório para sinais
  marcado_como_inferencia: boolean;    // true se é inferência (não observação direta)
  status: SinalStatus;                 // ver 6.3.2
  created_at: string;

  // === CAMPOS OPCIONAIS ===
  contexto?: string;                   // trecho ou momento do atendimento onde o sinal apareceu
  validado_por?: string;               // ID do operador que validou (se validação humana ocorreu)
  validado_em?: string;
  tags?: string[];
}
```

**6.3.1 Enum: `SinalTipo`**

```typescript
type SinalTipo =
  | 'objecao_ativa'        // objeção em curso no atendimento
  | 'hesitacao_detectada'  // hesitação verbal/comportamental observada
  | 'pergunta_financeira'  // pergunta sobre valor, renda, parcela antes do momento certo
  | 'sinal_abandono'       // comportamento de abandono iminente
  | 'sinal_engajamento'    // comportamento de alto interesse
  | 'dado_conflitante'     // dado declarado conflita com dado anterior ou de CRM
  | 'perfil_atipico'       // perfil fora dos padrões usuais do funil
  | 'outro';
```

**6.3.2 Enum: `SinalStatus`**

```typescript
type SinalStatus =
  | 'detectado'   // detectado mas não confirmado
  | 'confirmado'  // confirmado por evidência adicional ou validação humana
  | 'descartado'  // descartado após revisão
  | 'arquivado';
```

### 6.4 Shape: Padrão Detectado

```typescript
interface PadraoDetectado {
  // === CAMPOS OBRIGATÓRIOS ===
  id: string;
  padrao_tipo: PadraoTipo;             // ver 6.4.1
  descricao: string;
  n_evidencias: number;                // número de evidências que sustentam este padrão
  n_minimo_exigido: number;            // limiar mínimo para considerar válido (ver regra C.Padrao.1)
  valido: boolean;                     // true somente se n_evidencias >= n_minimo_exigido
  evidencia_ids: string[];             // IDs de atendimentos/sinais que fundamentam
  confianca: MemoriaConfianca;
  status: PadraoStatus;                // ver 6.4.2
  created_at: string;

  // === CAMPOS OPCIONAIS ===
  escopo_perfil?: string;              // perfil de lead ao qual este padrão se aplica
  outcome_correlacionado?: string;     // ID de outcome correlacionado
  tags?: string[];
  notas?: string;
  updated_at?: string;
}
```

**6.4.1 Enum: `PadraoTipo`**

```typescript
type PadraoTipo =
  | 'abordagem_eficaz'     // abordagem correlacionada com conversão
  | 'abordagem_ineficaz'   // abordagem correlacionada com abandono
  | 'objecao_recorrente'   // objeção que aparece em alto % de um perfil
  | 'perfil_alto_risco'    // combinação de sinais que prediz desqualificação
  | 'perfil_alto_potencial' // combinação que prediz conversão
  | 'timing_critico'       // momento do funil com maior taxa de abandono
  | 'outro';
```

**6.4.2 Enum: `PadraoStatus`**

```typescript
type PadraoStatus =
  | 'hipotese'    // n_evidencias < n_minimo_exigido — só hipótese, não pode ser aplicado
  | 'valido'      // n_evidencias >= n_minimo_exigido — pode ser aplicado como sugestão
  | 'invalidado'  // evidências contradizem o padrão
  | 'arquivado';
```

**Regra C.Padrao.1 (CRÍTICA):** `PadraoDetectado` com `valido = false` **não pode ser usado como sugestão operacional**. Deve ser exposto apenas como hipótese interna, nunca como recomendação à atendente.

### 6.5 Shape: Objeção Provável

```typescript
interface ObjecaoProvavel {
  // === CAMPOS OBRIGATÓRIOS ===
  id: string;
  lead_id: string;
  objecao_descricao: string;           // descrição da objeção prevista
  probabilidade_estimada: number;      // 0.0 a 1.0 — estimativa baseada em evidências
  n_evidencias_base: number;           // evidências que fundamentam a estimativa
  marcado_como_predicao: boolean;      // SEMPRE true — objeção provável é predição, não certeza
  status: ObjecaoProvavelStatus;       // ver 6.5.1
  created_at: string;

  // === CAMPOS OPCIONAIS ===
  padrao_id?: string;                  // ID do PadraoDetectado que originou esta predição
  escopo?: string;                     // contexto específico onde esta objeção é esperada
  abordagem_sugerida_id?: string;      // ID de RegraComercial sugerida para tratar
  tags?: string[];
}
```

**6.5.1 Enum: `ObjecaoProvavelStatus`**

```typescript
type ObjecaoProvavelStatus =
  | 'ativa'        // predição ativa para o atendimento
  | 'confirmada'   // a objeção de fato ocorreu
  | 'nao_ocorreu'  // atendimento encerrado e objeção não ocorreu
  | 'expirada';    // predição vencida por encerramento do atendimento sem dados
```

### 6.6 Shape: Outcome Real

```typescript
interface OutcomeReal {
  // === CAMPOS OBRIGATÓRIOS ===
  id: string;
  lead_id: string;                     // ID no CRM — FONTE DE VERDADE
  atendimento_id: string;              // atendimento que gerou este outcome
  outcome_tipo: OutcomeTipo;           // ver 6.6.1
  rastreavel_no_crm: boolean;          // DEVE ser true — outcome não rastreável é inválido
  crm_referencia: string;              // referência direta ao registro no CRM
  evidencia_tipo: EvidenciaTipo;       // DEVE ser 'real_crm' para OutcomeReal
  status: OutcomeStatus;               // ver 6.6.2
  registrado_em: string;               // timestamp do registro no CRM (ISO 8601)
  registrado_por: string;              // sistema ou operador

  // === CAMPOS OPCIONAIS ===
  notas?: string;
  abordagem_ids?: string[];            // abordagens usadas — para correlação futura
  sinal_ids?: string[];                // sinais detectados — para correlação futura
  tags?: string[];
}
```

**6.6.1 Enum: `OutcomeTipo`**

```typescript
type OutcomeTipo =
  | 'conversao'              // lead converteu (assinou/contratou)
  | 'perda'                  // lead saiu definitivamente do funil
  | 'retorno_agendado'       // lead agendou retorno explícito
  | 'desqualificacao'        // lead desqualificado por critério formal
  | 'em_espera'              // lead em espera ativa (ex: lista de espera)
  | 'abandono_silencioso'    // lead parou de responder sem encerramento formal
  | 'outro';
```

**6.6.2 Enum: `OutcomeStatus`**

```typescript
type OutcomeStatus =
  | 'registrado'    // registrado e rastreável
  | 'em_revisao'    // rastreabilidade incompleta — aguardando confirmação no CRM
  | 'invalido'      // não rastreável ou inferido sem evidência — bloqueado
  | 'arquivado';
```

**Regra C.Outcome.1 (CRÍTICA):** `OutcomeReal` com `rastreavel_no_crm = false` **não pode ser registrado** — deve ser recusado pelo sistema e retornar erro. Outcome só existe se rastreável no CRM.

### 6.7 Enum compartilhado: `MemoriaStatus`

```typescript
type MemoriaStatus =
  | 'ativa'      // em uso
  | 'expirada'   // passou da validade
  | 'bloqueada'  // requer revisão humana antes de uso
  | 'arquivada'; // encerrada
```

### 6.8 Enum compartilhado: `MemoriaConfianca`

```typescript
type MemoriaConfianca =
  | 'alta_evidencia'      // múltiplas evidências, consistentes
  | 'evidencia_limitada'  // poucas evidências, ainda válido
  | 'inferencia'          // deduzido — DEVE ser marcado explicitamente como inferência
  | 'hipotese';           // insuficiente — não pode ser aplicado como sugestão
```

### 6.9 Enum compartilhado: `EvidenciaTipo`

```typescript
type EvidenciaTipo =
  | 'real_crm'           // evidência direta do CRM
  | 'real_atendimento'   // evidência direta do atendimento (log, transcript)
  | 'inferencia'         // inferência com base em dados — DEVE ser marcada
  | 'operador_validado'  // validação explícita por operador humano
  | 'diretiva_manual';   // input manual direto de operador (Camada D)
```

### 6.10 Enum compartilhado: `MemoriaOrigem`

```typescript
type MemoriaOrigem =
  | 'crm'                // lido diretamente do CRM
  | 'atendimento_log'    // lido do log do atendimento
  | 'extracao_llm'       // extraído por LLM de texto — SEMPRE marcado como inferência
  | 'operador_manual'    // inserido manualmente por operador
  | 'sistema_automatico'; // gerado automaticamente por regra do sistema
```

---

## 7. CAMADA D — Shape de Diretiva Manual / Memória Manual

### 7.1 Shape completo

```typescript
interface DiretivaMannual {
  // === CAMPOS OBRIGATÓRIOS ===
  id: string;                           // UUID único da diretiva
  author: string;                       // ID do autor (operador/diretor) — obrigatório
  created_at: string;                   // timestamp de criação (ISO 8601)
  scope: DiretivaMannualScope;          // ver 7.2
  priority: DiretivaMannualPriority;    // ver 7.3
  directive_type: DiretivaMannualType;  // ver 7.4
  content: string;                      // texto da diretiva — claro e direto
  rationale: string;                    // justificativa da diretiva (por que foi criada)
  status: DiretivaMannualStatus;        // ver 7.5
  audit_ref: string;                    // referência de auditoria — log ou ticket de origem
  version: number;                      // versão (começa em 1, incrementa a cada atualização)

  // === CAMPOS OPCIONAIS ===
  supersedes?: string;                  // ID de diretiva que esta substitui
  previous_version_id?: string;         // ID da versão anterior desta diretiva
  expiry_date?: string;                 // data de expiração (ISO 8601) — se temporária
  escopo_perfil?: string;               // perfil de lead ao qual se aplica (se scope = 'por_perfil')
  escopo_stage?: string;                // stage do funil ao qual se aplica (se scope = 'por_stage')
  normativo_conflict_check: boolean;    // flag indicando se conflito com Camada A foi verificado
  conflict_ids?: string[];              // IDs de normas ou regras que conflitam
  tags?: string[];
  notas?: string;
  updated_at?: string;
  updated_by?: string;
}
```

### 7.2 Enum: `DiretivaMannualScope`

```typescript
type DiretivaMannualScope =
  | 'global'        // aplica a todos os atendimentos
  | 'por_frente'    // aplica a uma frente específica do funil
  | 'por_stage'     // aplica a um stage específico
  | 'por_perfil'    // aplica a um perfil de lead específico
  | 'por_canal'     // aplica a um canal específico (ex: WhatsApp)
  | 'temporaria';   // aplica por período definido (exige `expiry_date`)
```

### 7.3 Enum: `DiretivaMannualPriority`

```typescript
type DiretivaMannualPriority =
  | 'critica'  // deve ser sempre observada dentro do escopo
  | 'alta'
  | 'media'
  | 'baixa';   // sugestiva
```

### 7.4 Enum: `DiretivaMannualType`

```typescript
type DiretivaMannualType =
  | 'ajuste_abordagem'     // ajuste na forma de conduzir
  | 'excecao_operacional'  // exceção explícita a uma regra padrão
  | 'observacao_estrategica' // contexto estratégico que a atendente deve ter em mente
  | 'cuidado_operacional'  // alerta para situação de risco operacional
  | 'lembrete_sistema'     // lembrete de comportamento esperado
  | 'restricao_temporaria'; // restrição com prazo definido
```

### 7.5 Enum: `DiretivaMannualStatus`

```typescript
type DiretivaMannualStatus =
  | 'ativa'     // em uso
  | 'suspensa'  // conflito com norma detectado — aguarda revisão humana
  | 'obsoleta'  // substituída por versão mais recente
  | 'expirada'  // data de expiração atingida
  | 'arquivada'; // encerrada formalmente
```

### 7.6 Regras obrigatórias da Camada D

| # | Regra |
|---|-------|
| D.1 | `author`, `rationale` e `audit_ref` são **obrigatórios** — diretiva anônima ou sem justificativa é recusada. |
| D.2 | Toda atualização cria nova versão — `version` incrementa, `previous_version_id` é preenchido. |
| D.3 | `directive_type = 'restricao_temporaria'` exige `expiry_date` preenchida. |
| D.4 | `scope = 'temporaria'` exige `expiry_date` preenchida. |
| D.5 | `normativo_conflict_check` deve ser `true` antes de `status = 'ativa'` — nunca ativar sem verificar conflito com Camada A. |
| D.6 | Diretiva com conflito com norma vai para `status = 'suspensa'` — não pode ser aplicada até revisão humana. |
| D.7 | Acúmulo de diretivas sem revisão periódica é proibido — protocolo de limpeza deve ser definido antes da PR4. |

---

## 8. Regras de leitura e escrita por camada

### 8.1 Camada A — Base Normativa

| Operação | Permitido | Restrição |
|----------|-----------|-----------|
| **Leitura** | qualquer componente autorizado do sistema | itens com `status = 'suspenso'` são bloqueados para leitura operacional |
| **Escrita (criação)** | operador autorizado via interface de administração | somente com todos os campos obrigatórios preenchidos |
| **Escrita (atualização)** | operador autorizado | cria nova versão — não sobrescreve `excerpt` original |
| **Deleção** | proibida | somente `status = 'arquivado'` via operação formal |
| **Inferência LLM** | **proibida** | camada A não aceita item normativo gerado por LLM sem revisão humana |

### 8.2 Camada B — Regras Comerciais

| Operação | Permitido | Restrição |
|----------|-----------|-----------|
| **Leitura** | qualquer componente autorizado | itens com `status = 'suspensa'` retornam aviso |
| **Escrita (criação)** | operador autorizado | exige `created_by` válido e `restrictions` declaradas |
| **Escrita (atualização)** | operador autorizado | cria nova versão — `previous_version_id` obrigatório |
| **Deleção** | proibida | somente `status = 'arquivada'` via operação formal |
| **Escrita automática (sistema)** | **proibida** | sistema não cria regra comercial — somente operador humano |

### 8.3 Camada C — Memória e Aprendizado

| Operação | Tipo | Permitido | Restrição |
|----------|------|-----------|-----------|
| **Leitura de MemoriaPorLead** | leitura | componente de atendimento autorizado | `status = 'bloqueada'` exige revisão humana |
| **Escrita de MemoriaPorLead** | escrita | sistema + operador | exige `evidencia_tipo` e `origem` declarados |
| **Leitura de MemoriaPorAtendimento** | leitura | componente de atendimento | qualquer status exceto `bloqueada` |
| **Escrita de MemoriaPorAtendimento** | append-only | sistema durante atendimento | não editável após closeout do atendimento |
| **Escrita de OutcomeReal** | escrita | somente via Supabase Adapter (Frente 4) | `rastreavel_no_crm = false` bloqueia criação |
| **Escrita de PadraoDetectado** | inferência | sistema de aprendizado | `valido = false` bloqueia uso operacional |
| **Escrita de Sinal** | inferência | sistema durante atendimento | `marcado_como_inferencia` obrigatório se inferido |
| **Escrita de ObjecaoProvavel** | predição | sistema de aprendizado | `marcado_como_predicao = true` sempre |

### 8.4 Camada D — Memória Manual

| Operação | Permitido | Restrição |
|----------|-----------|-----------|
| **Leitura** | qualquer componente autorizado | itens `suspensa` retornam aviso; `arquivada` não retorna |
| **Escrita (criação)** | somente operador humano autorizado | exige `author`, `rationale`, `audit_ref` |
| **Escrita (atualização)** | somente operador humano | cria nova versão |
| **Deleção** | proibida | somente `status = 'arquivada'` |
| **Escrita por sistema automático** | **proibida** | diretiva manual não pode ser criada por automação |

---

## 9. Regras de evidência — fechamento técnico

### 9.1 O que conta como evidência válida

| Tipo | Descrição | `evidencia_tipo` aplicável |
|------|-----------|---------------------------|
| Registro direto do CRM | Dado rastreável no CRM com ID de referência | `real_crm` |
| Log de atendimento | Transcript ou log estruturado do atendimento | `real_atendimento` |
| Validação por operador | Operador humano confirmou explicitamente | `operador_validado` |
| Diretiva manual com trilha | Criada por operador com `author` + `audit_ref` | `diretiva_manual` |

### 9.2 O que é evidência insuficiente

| Situação | Por quê é insuficiente |
|----------|------------------------|
| Inferência LLM sobre texto livre sem confirmação | Não rastreável — é hipótese, não evidência |
| Amostra única de atendimento | Insuficiente para padrão — `n_evidencias < n_minimo_exigido` |
| Outcome deduzido sem registro no CRM | `rastreavel_no_crm = false` — bloqueado |
| Memória oral / "foi sempre assim" | Sem `created_by`, `audit_ref` — inválida |
| Memória com `confidence = 'hipotese'` | Pode existir como registro interno, não pode ser aplicada |

### 9.3 Quando algo vira aprendizado

```
Dado bruto coletado
  └─ evidencia_tipo: real_crm OU real_atendimento
  └─ n_evidencias >= n_minimo_exigido (definido pelo sistema na PR3)
  └─ confianca != 'hipotese'
  └─ valido = true (para PadraoDetectado)
  └─ NÃO conflita com Camada A
  ↓
PODE ser aplicado como sugestão operacional (não como decisão)
```

### 9.4 Quando algo continua só hipótese

```
Dado coletado
  └─ evidencia_tipo: inferencia OU origem: extracao_llm
  └─ n_evidencias < n_minimo_exigido
  └─ confianca = 'hipotese'
  ↓
STATUS: hipotese
  └─ NÃO pode ser sugestão à atendente
  └─ NÃO pode influenciar decisão do Core
  └─ PODE ser armazenado para acumulação futura de evidências
```

### 9.5 Quando outcome pode ser marcado como real

```
OutcomeReal é válido se e somente se:
  ✓ rastreavel_no_crm = true
  ✓ crm_referencia preenchido
  ✓ evidencia_tipo = 'real_crm'
  ✓ atendimento_id existente e vinculado
  ✓ lead_id coincide com o CRM

OutcomeReal é INVÁLIDO se:
  ✗ rastreavel_no_crm = false
  ✗ outcome inferido de texto livre sem registro formal
  ✗ outcome "estimado" sem confirmação no CRM
```

### 9.6 Quando memória deve ficar bloqueada

```
MemoriaStatus = 'bloqueada' quando:
  - evidência de inconsistência com CRM detectada
  - conflito com Camada A detectado (para memória que cita norma)
  - operador marcou explicitamente para revisão
  - dado sensível identificado sem protocolo de consentimento
  - dado desatualizado com expiração atingida sem renovação
```

---

## 10. Integração técnica com CRM, atendimento e camada cognitiva

### 10.1 Integração com CRM

| Aspecto | Definição técnica |
|---------|-------------------|
| **CRM como fonte de verdade** | `lead_id`, `atendimento_id` e `outcome_id` vêm sempre do CRM — o módulo E1 **não cria** esses IDs |
| **Leitura do CRM** | O módulo lê dados do CRM via Supabase Adapter (Frente 4) — não acessa CRM diretamente |
| **Escrita no CRM** | O módulo **não escreve** no CRM — toda escrita passa obrigatoriamente pelo Supabase Adapter |
| **OutcomeReal** | Só pode ser criado com `rastreavel_no_crm = true` — a rastreabilidade vem do CRM |
| **MemoriaPorLead** | `lead_id` deve ser validado contra o CRM antes de persistir memória |
| **Enriquecimento** | O módulo pode enriquecer contexto do lead na camada E1 — não altera o CRM |

### 10.2 Integração com atendimento

| Aspecto | Definição técnica |
|---------|-------------------|
| **O módulo lê** | contexto do atendimento em curso (sinais, fase do funil, abordagem atual) |
| **O módulo pode sugerir** | abordagem baseada em `RegraComercial` ativa e `PadraoDetectado` válido |
| **O módulo pode alertar** | `ObjecaoProvavel` como predição marcada — nunca como certeza |
| **O módulo não pode** | interferir na decisão do Core Mecânico sobre stage/gate |
| **O módulo não pode** | reescrever a `surface final` da Speech Engine sem autorização explícita do contrato de surface |
| **O módulo não pode** | puxar slot de atendimento fora do que o stage permite |
| **MemoriaPorAtendimento** | append-only durante o atendimento — fecha com o `atendimento_id` |

### 10.3 Integração com camada cognitiva (LLM/cérebro)

| Aspecto | Definição técnica |
|---------|-------------------|
| **O módulo fornece** | contexto enriquecido: normas relevantes, regras comerciais ativas, memória do lead, sinais detectados |
| **A camada cognitiva pode** | consumir `ItemNormativo` (com `status = 'ativo'`), `RegraComercial` (com `status = 'ativa'`), `MemoriaPorLead` (com `status = 'ativa'`) |
| **A camada cognitiva não pode** | sobrescrever `ItemNormativo.excerpt` com inferência LLM |
| **A camada cognitiva não pode** | criar `RegraComercial` a partir de contexto livre — somente operador humano cria |
| **A camada cognitiva não pode** | registrar `OutcomeReal` diretamente — somente via Supabase Adapter |
| **A camada cognitiva não pode** | elevar `PadraoDetectado` com `valido = false` para sugestão operacional |
| **Separação de soberania** | LLM é auxiliar na aplicação contextual — o módulo E1 é a fonte estruturada. Decisão de stage permanece no Core Mecânico (Frente 1). |

---

## 11. O que a PR3 poderá implementar

### 11.1 Autorizado para PR3

| Item | Detalhe |
|------|---------|
| Estruturas mínimas de dados | Types/interfaces TypeScript em `src/memory/` (ou equivalente) conforme shapes desta PR2 |
| Hooks mínimos de integração | Funções de leitura/escrita mínimas para cada camada (sem automação completa) |
| Base consultiva mínima (Camada A) | Estrutura de dados + função de consulta de `ItemNormativo` |
| Regras comerciais mínimas (Camada B) | Estrutura de dados + função de leitura de `RegraComercial` ativa |
| Memória por lead mínima (Camada C) | Estrutura de dados + leitura/escrita básica de `MemoriaPorLead` |
| Memória por atendimento mínima (Camada C) | Append-only de `MemoriaPorAtendimento` durante atendimento |
| Memória manual mínima (Camada D) | Estrutura de dados + leitura de `DiretivaMannual` ativa |
| Smoke mínimo da PR3 | Testes que provam funcionamento básico de cada camada sem violação de regras |
| Integração mínima com Supabase Adapter | Leitura de `lead_id` do CRM para vincular memórias |

### 11.2 PR3 não pode implementar

| Item proibido | Motivo |
|---------------|--------|
| Aprendizado automático completo (Camada C plena) | Requer validação de padrões com evidências reais — complexidade de PR4+ |
| Motor de inferência automático | Risco de gerar memória sem evidência — violação do contrato |
| Automação de criação de `RegraComercial` | Somente operador humano cria regras comerciais |
| Ingestão de normativos externos reais | Exige protocolo de validação humana — não autorizado em PR3 |
| UI/painel de administração de memória | Fora de escopo desta sequência de PRs |
| Dashboard de aprendizado | Fora de escopo |
| Integração externa nova | Não autorizada — somente via Supabase Adapter existente (Frente 4) |
| Alteração funcional no CRM | Proibido — CRM é fonte de verdade imutável pelo módulo E1 |
| Alteração funcional na Speech Engine | Módulo E1 não altera surface final sem autorização do contrato de surface |

---

## 12. O que continua proibido mesmo após a PR3

Os itens abaixo **não mudam com a PR3** e **não podem ser alterados** sem revisão contratual formal:

| Proibição permanente | Base contratual |
|----------------------|-----------------|
| Módulo E1 decidir stage ou gate | Core Mecânico (Frente 1) é soberano |
| Módulo E1 reescrever surface final | Speech Engine (Frente 2) é soberana na surface |
| Módulo E1 escrever no CRM diretamente | Supabase Adapter (Frente 4) é o único adaptador autorizado |
| LLM criar `ItemNormativo` sem revisão humana | Norma nunca pode ser inferida |
| LLM criar `RegraComercial` autonomamente | Somente operador humano cria regras comerciais |
| `OutcomeReal` sem `rastreavel_no_crm = true` | Outcome inferido é inválido |
| `PadraoDetectado` com `valido = false` como sugestão | Hipótese não vira recomendação |
| Memória anônima (sem `created_by` ou `author`) | Toda memória tem trilha de proveniência |
| Diretiva manual por automação | Camada D é exclusivamente humana |
| Norma sobrescrita por heurística ou diretiva manual | Camada A prevalece sempre |
| Coleta de dados sensíveis sem protocolo de consentimento | Privacidade e LGPD |
| Generalização de padrão com amostra única | `n_minimo_exigido` protege contra isso |

---

## 13. Loop obrigatório antes de qualquer tarefa do módulo E1

*Reproduzido aqui para facilitar leitura — fonte canônica: seção 15 do contrato extraordinário ativo.*

Antes de qualquer execução neste módulo:

1. Ler `schema/contracts/_INDEX.md`
2. Ler `schema/contracts/extraordinary/_INDEX.md`
3. Ler contrato extraordinário ativo
4. Ler status vivo (`EXTRA_..._STATUS.md`)
5. Ler handoff vivo (`EXTRA_..._LATEST.md`)
6. Confirmar ordem PR1/PR2/PR3/PR4 e próximo passo
7. Confirmar limites do módulo (seção 3 do contrato ativo)
8. Confirmar regras de evidência (seção 7 do contrato ativo)
9. Confirmar regras de consulta normativa (seção 8 do contrato ativo)
10. Confirmar regras comerciais operacionais (seção 9 do contrato ativo)
11. Confirmar regras de memória manual (seção 12 do contrato ativo)

---

## 14. Critérios de aceite desta PR2

Esta PR2 só está completa se:

- [x] O contrato técnico existir neste arquivo com shapes completos das 4 camadas
- [x] Camada A: `ItemNormativo` com todos os campos obrigatórios/opcionais e enums definidos
- [x] Camada B: `RegraComercial` com todos os campos obrigatórios/opcionais e enums definidos
- [x] Camada C: `MemoriaPorLead`, `MemoriaPorAtendimento`, `Sinal`, `PadraoDetectado`, `ObjecaoProvavel`, `OutcomeReal` definidos
- [x] Camada D: `DiretivaMannual` com todos os campos obrigatórios/opcionais e enums definidos
- [x] Regras de leitura/escrita fechadas por camada
- [x] Regras de evidência fechadas (válida / insuficiente / aprendizado / hipótese / outcome / bloqueio)
- [x] Integração com CRM tecnicamente definida (leitura, escrita, fonte de verdade)
- [x] Integração com atendimento tecnicamente definida
- [x] Integração com camada cognitiva tecnicamente definida
- [x] O que PR3 pode implementar está fechado
- [x] O que continua proibido mesmo após PR3 está fechado
- [x] Nenhuma implementação de runtime criada
- [x] Nenhum arquivo em `src/` alterado
- [x] Vivos (status, handoff, _INDEX) apontam PR3 como próximo passo autorizado

---

## 15. Próximo passo autorizado após esta PR2

**PR3 — Runtime mínimo do módulo E1**

Conforme seção 11 deste artefato — somente o que está autorizado pode ser implementado.
