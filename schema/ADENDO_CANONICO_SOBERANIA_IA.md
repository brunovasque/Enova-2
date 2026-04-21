# ADENDO CANÔNICO — SOBERANIA DA IA E PROIBIÇÃO DE PRIORIDADE DE FALA MECÂNICA — ENOVA 2

> **Status:** Adendo canônico ativo — vigência imediata e transversal a todas as frentes.
> **Precedência:** Este adendo complementa e particulariza o A00. Vale como regra-mãe canônica junto do contrato macro da ENOVA 2.
> **Leitura obrigatória:** Este adendo deve ser lido no início de toda tarefa que toque conversa, atendimento, LLM, speech, surface, fallback, multimodalidade ou fluxo cognitivo.

---

## 1. Natureza deste adendo

Este adendo não é recomendação nem diretriz de estilo. É uma **regra canônica formal**, vinculada ao A00, de cumprimento obrigatório transversal em todas as frentes da ENOVA 2. Qualquer implementação, contrato de frente, decisão arquitetural ou PR que contradiga este adendo é **não conforme** e deve ser parada, revisada e corrigida antes de seguir.

---

## 2. Fundamento — por que este adendo existe

A Enova 1 provou o limite de uma arquitetura híbrida onde o mecânico competia pela fala final: fallbacks genéricos dominavam o turno, surfaces rígidas engessavam a resposta, scripts de atendimento substituíam raciocínio, e o trilho textual mecânico ditava o que o cliente ouvia. O resultado foi uma IA que acertava a decisão de negócio mas falava como bot de regras.

A ENOVA 2 nasce para resolver essa falha de fundação. A mudança não é de wording: é de soberania. A IA é soberana na fala. O mecânico é soberano na regra. Essas duas soberanias não se confundem e não se substituem.

---

## 3. Pilares canônicos — regras permanentes e inegociáveis

### 3.1 A ENOVA 2 não é bot de regras com trilho textual rígido

A ENOVA 2 não será construída, configurada nem operada como um sistema onde scripts, templates fixos ou surface mecânica ditam o que o cliente recebe. Respostas engessadas, frases pré-montadas dominantes e trilho textual rígido são arquitetura da Enova 1 — não da ENOVA 2.

### 3.2 A ENOVA 2 é uma atendente especialista no MCMV

A ENOVA 2 deve se comportar como uma analista virtual de MCMV: natural na fala, forte em contexto, capaz de interpretar múltiplas informações no mesmo turno, apta a responder dúvidas reais e a conduzir a conversa com inteligência — dentro dos contratos duros de negócio e governança.

### 3.3 A IA é soberana em raciocínio, condução conversacional e fala

O LLM (IA) é a camada soberana de fala da ENOVA 2. Cabe ao LLM:
- Redigir a resposta final ao cliente.
- Conduzir o fluxo conversacional com naturalidade.
- Interpretar o contexto, as intenções e as ambiguidades do turno.
- Adaptar o tom, a profundidade e a estrutura da resposta ao momento da conversa.

Nenhuma outra camada pode sobrescrever, substituir ou deslocar a resposta do LLM como surface final do turno.

### 3.4 O mecânico NÃO é soberano da fala

O mecânico (Policy/Core, parser, gate, extractor, stage engine) é soberano em:
- Aplicar regras do MCMV, do funil e das microregras de negócio.
- Validar slots, gates e critérios de elegibilidade.
- Decidir o próximo objetivo operacional autorizado.
- Registrar estado, evidências e memória estrutural no Supabase.
- Bloquear execução fora de política.
- Preservar rastreabilidade e auditabilidade do fluxo.

O mecânico **não redige resposta ao cliente**. O mecânico **não determina a fala final**. O mecânico informa o LLM sobre o que é permitido, o que foi coletado e o que vem a seguir — e o LLM decide como dizer isso ao cliente.

---

## 4. Regras proibidas formais

As seguintes práticas são **explicitamente proibidas** em qualquer frente, contrato, PR ou implementação da ENOVA 2:

| # | Proibição | Classificação |
|---|-----------|---------------|
| P1 | **JAMAIS DAR AO MECÂNICO QUALQUER PRIORIDADE DE FALA** | Não conforme — parada imediata |
| P2 | Fazer o mecânico escrever ou montar a resposta final ao cliente | Não conforme |
| P3 | Transformar fallback ou surface em motor principal da conversa | Não conforme |
| P4 | Usar scripts ou templates rígidos como fala dominante de turno | Não conforme |
| P5 | Permitir que qualquer camada abaixo do LLM sobrescreva a surface final | Não conforme |
| P6 | Repetir ou reimplantar o paradigma conversacional da Enova 1 | Não conforme |
| P7 | Tratar "Speech Engine" como sinônimo de fala mecânica ou script rígido | Não conforme |
| P8 | Abrir nova frente técnica que reinstale fala mecânica como padrão | Não conforme |
| P9 | Aprovar PR que reintroduza surface engessada como camada dominante de resposta | Não conforme |

Qualquer item desta tabela identificado em PR, contrato ou implementação é **condição de parada** e deve ser reportado antes de seguir.

---

## 5. O papel legítimo do mecânico

O mecânico tem papel fundamental e insubstituível na ENOVA 2 — mas dentro de sua soberania legítima:

1. **Validar** — checar se os dados coletados são válidos segundo a política do MCMV.
2. **Registrar** — persistir estado estrutural, slots confirmados e evidências no Supabase.
3. **Bloquear** — impedir que o LLM avance para stage não autorizado pela política.
4. **Preservar estado** — manter continuidade operacional entre turnos.
5. **Informar o LLM** — passar contexto, próximo objetivo autorizado e restrições para que o LLM redija a resposta adequada.

O mecânico **entrega insumo**. O LLM **entrega fala**.

---

## 6. Regra sobre o nome "Speech Engine"

Se o nome "Speech Engine" for mantido por razões de compatibilidade com o macro (A00, A01, contratos), isso **não pode significar**:
- Fala mecânica.
- Script rígido.
- Surface engessada.
- Motor de resposta sem LLM.

"Speech Engine" na ENOVA 2 deve ser interpretado como: **a camada que entrega ao LLM o contexto, os contratos e as restrições para que o LLM monte e emita a surface final com naturalidade e inteligência**. O "engine" orquestra — o LLM fala.

---

## 7. Vigência e transversalidade

Este adendo:
- Vale imediatamente a partir de sua criação no repositório.
- É transversal a **todas as frentes**: Core, Speech Engine, Contexto, Supabase, Áudio, Meta, Telemetria e Rollout.
- Aplica-se a **toda tarefa futura** que toque conversa, atendimento, LLM, speech, surface, fallback, multimodalidade ou fluxo cognitivo.
- **A próxima frente sucessora do Core** — qualquer que seja seu nome — deve ser interpretada e contratada como **IA soberana de atendimento com governança estrutural invisível**, não como "fala mecânica melhorada".
- Nenhum contrato de frente pode ser aberto, executado ou encerrado de forma que contradiga este adendo.

---

## 8. Critério de conformidade deste adendo

Uma implementação é **conforme** a este adendo quando:
- O LLM redige e emite a surface final do turno.
- O mecânico informa e restringe, mas não fala ao cliente.
- Fallbacks e surfaces de contingência são mínimos, declarados e não dominam o fluxo.
- A conversa é conduzida com naturalidade e inteligência contextual.
- Não há trilho textual rígido ditando o que o cliente recebe.

Uma implementação é **não conforme** quando qualquer das proibições da seção 4 for identificada.

---

## 9. Referência cruzada e precedência

| Documento | Relação |
|-----------|---------|
| `schema/A00_PLANO_CANONICO_MACRO.md` | Este adendo particulariza e reforça os princípios 4.2, 4.3, 8.6 e seção 10 do A00 |
| `schema/CODEX_WORKFLOW.md` | Este adendo integra a lista de leitura obrigatória (item 27) e a cadeia de precedência |
| `.github/AGENT_CONTRACT.md` | As regras deste adendo são refletidas como regras operacionais mandatórias no contrato do agente |
| `schema/contracts/_INDEX.md` | Toda abertura de novo contrato de frente deve declarar conformidade com este adendo |

**Precedência deste adendo:** A00 > A01 > **este adendo (A00-ADENDO-01)** > A02 > contrato ativo da frente.

---

*Adendo criado em: 2026-04-21*
*Identificador canônico: A00-ADENDO-01*
*Vigência: imediata e permanente*
