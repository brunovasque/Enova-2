# CONTRACT_CLOSEOUT_PROTOCOL — Protocolo Obrigatório de Encerramento de Contrato — ENOVA 2

> **Este protocolo é lei operacional complementar ao CODEX_WORKFLOW e ao CONTRACT_EXECUTION_PROTOCOL.**
> Nenhum contrato pode ser considerado encerrado sem cumprir integralmente este protocolo.
> Encerramento implícito de contrato é proibido.

---

## 1. Finalidade

Este protocolo define as condições obrigatórias para que um contrato de frente da ENOVA 2 possa ser formalmente encerrado.

Ele existe para impedir:
- Encerramento implícito (contrato "esquecido" sem declaração formal)
- Encerramento sem evidências
- Encerramento com critérios de aceite não verificados
- Encerramento com pendências não declaradas
- Transição para próximo contrato sem autorização explícita

---

## 2. Precedência

**schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md > A00 > A01 > A00-ADENDO-01 > A02 > CONTRACT_CLOSEOUT_PROTOCOL > CONTRACT_EXECUTION_PROTOCOL > contrato/fase ativa**

Este protocolo está subordinado ao A00, A01 e A02.
Ele tem precedência sobre o contrato individual quando o assunto é encerramento.

---

## 3. Quando um contrato pode encerrar

Um contrato só pode ser encerrado quando **todas** as condições abaixo forem verdadeiras:

1. Todos os critérios de aceite do contrato foram verificados e declarados como cumpridos
2. Todo o escopo contratado foi entregue ou explicitamente declarado como não entregue (com justificativa)
3. O "fora de escopo" do contrato foi respeitado durante toda a execução
4. Evidências mínimas de entrega foram apresentadas
5. Status e handoff da frente foram atualizados para refletir o encerramento
6. O checklist obrigatório de encerramento (seção 4) foi preenchido integralmente
7. **O documento-base da evidência não contém insuficiência declarada** — nenhum critério de aceite com status `parcial`, nenhuma lacuna remanescente, nenhum item inconclusivo (ver A00-ADENDO-03 e seção 4 abaixo)
8. **O Bloco E (`--- BLOCO E — FECHAMENTO POR PROVA ---`) foi preenchido com `Fechamento permitido nesta PR?: sim`** (ver `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`)

Se qualquer condição acima não for verdadeira, o contrato **não pode** ser encerrado.

---

## 4. Checklist obrigatório de encerramento

Toda PR que encerra um contrato deve incluir o seguinte bloco de encerramento:

```
--- ENCERRAMENTO DE CONTRATO ---
Contrato encerrado:                     <caminho do contrato>
Contrato encerrado com sucesso?:        sim | não
Objetivo do contrato cumprido?:         sim | não — <justificativa se não>
Critérios de aceite cumpridos?:         sim | não — <lista de critérios com status individual>
Fora de escopo respeitado?:             sim | não — <justificativa se não>
Pendências remanescentes:               <lista ou "nenhuma">
Evidências / provas do encerramento:    <lista de evidências: PRs, commits, diffs, smoke tests, logs>
Data de encerramento:                   <data ISO 8601>
PR que encerrou:                        <número e título da PR>
Destino do contrato encerrado:          archive (mover para schema/contracts/archive/)
Próximo contrato autorizado:            <nome do próximo contrato ou "nenhum — aguardando definição">

--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           <caminho do arquivo que contém a prova da entrega>
Estado da evidência:                   completa | parcial | incompleta | ausente
Há lacuna remanescente?:               não | sim — <descrição da lacuna>
Há item parcial/inconclusivo bloqueante?: não | sim — <descrição do item>
Fechamento permitido nesta PR?:        sim | NÃO — BLOQUEADO por insuficiência de evidência
Estado permitido após esta PR:         encerrada | em execução (continua aberta)
Próxima PR autorizada:                 <ID lógico da próxima PR> | continuação desta etapa
```

**Checklist sem todos os campos preenchidos = encerramento não aceito.**
**Bloco E com `Fechamento permitido nesta PR?: NÃO` = encerramento bloqueado — contrato permanece ativo.**
**`Critérios de aceite cumpridos?: sim` só é válido se cada critério tiver evidência completa (não parcial).**

---

## 5. Evidências mínimas de encerramento

O encerramento de um contrato deve apresentar, no mínimo:

1. **Lista de PRs** que executaram recortes do contrato, com referência a cada uma
2. **Critérios de aceite** com status individual (`cumprido` | `não cumprido` | `parcial — justificativa`)
3. **Smoke tests ou provas** que demonstrem o cumprimento dos critérios de aceite
4. **Diffs ou commits** que comprovem as entregas declaradas
5. **Declaração explícita** de pendências remanescentes (se houver)

Evidências insuficientes = encerramento não aceito.

---

## 6. Atualização obrigatória ao encerrar contrato

Ao encerrar um contrato, os seguintes artefatos devem ser atualizados obrigatoriamente:

### 6.1. `schema/contracts/_INDEX.md`

- Atualizar o status do contrato para `encerrado`
- Registrar a PR que encerrou
- Registrar o contrato anterior arquivado
- Registrar o próximo contrato esperado (se houver)

### 6.2. Contrato ativo → `archive/`

- Mover o contrato de `schema/contracts/active/` para `schema/contracts/archive/`
- Renomear com sufixo de data: `<NOME>_<YYYY-MM-DD>.md`

### 6.3. Status da frente

- Atualizar `schema/status/<FRENTE>_STATUS.md`:
  - Contrato ativo: "Nenhum — contrato anterior encerrado em <data>"
  - Estado do contrato: `encerrado`
  - Contrato encerrado: `sim`
  - Pendência contratual: `nenhuma` ou lista explícita

### 6.4. Handoff da frente

- Atualizar `schema/handoffs/<FRENTE>_LATEST.md`:
  - Registrar encerramento do contrato
  - Registrar evidências
  - Registrar próximo contrato autorizado

---

## 7. Autorização do próximo contrato

O encerramento de um contrato pode autorizar a abertura do próximo contrato da frente, desde que:

1. O contrato atual tenha sido encerrado formalmente via este protocolo
2. O próximo contrato esteja previsto no A01 (ordem executiva)
3. Gates de bloqueio do A01 estejam satisfeitos
4. O próximo contrato siga o formato definido em `schema/CONTRACT_SCHEMA.md`

Se não houver próximo contrato previsto, declarar: `Próximo contrato autorizado: nenhum — aguardando definição`.

---

## 8. Proibição de encerramento implícito

As seguintes situações são **proibidas** e constituem não conformidade:

- Considerar contrato encerrado sem checklist preenchido
- Considerar contrato encerrado sem evidências mínimas
- Considerar contrato encerrado porque "todas as PRs foram merged"
- Considerar contrato encerrado porque "a frente avançou para o próximo passo"
- Mover contrato para `archive/` sem encerramento formal
- Abrir próximo contrato sem encerrar o anterior formalmente
- Alterar status do contrato para `encerrado` sem cumprir este protocolo
- **Encerrar contrato com documento-base da evidência contendo lacuna remanescente, item parcial ou inconclusivo** (ver A00-ADENDO-03)
- **Preencher `Critérios de aceite cumpridos?: sim` quando qualquer critério tem evidência parcial** (ver A00-ADENDO-03)
- **Omitir ou deixar incompleto o Bloco E no checklist de encerramento** (ver A00-ADENDO-03)

**Encerramento implícito = não conformidade grave.**
**Encerramento com evidência insuficiente = não conformidade grave (A00-ADENDO-03).**

---

## 9. Integração com o CODEX_WORKFLOW

Quando uma PR encerra um contrato:

1. A classificação da tarefa pode ser `contratual` (se a PR encerra o contrato como parte da última entrega) ou `governança` (se a PR apenas formaliza o encerramento sem entrega técnica)
2. O ESTADO ENTREGUE deve incluir o bloco de encerramento completo (seção 4)
3. O handoff deve registrar o encerramento e o próximo contrato autorizado
4. O status deve refletir o encerramento
5. O `_INDEX.md` deve ser atualizado

---

## 10. Exemplos

### Exemplo A — Encerramento bem-sucedido

```
--- ENCERRAMENTO DE CONTRATO ---
Contrato encerrado:                     schema/contracts/active/CORE_MECANICO_2_V1.md
Contrato encerrado com sucesso?:        sim
Objetivo do contrato cumprido?:         sim
Critérios de aceite cumpridos?:         sim
  - [x] Modelo de objetivos/stages definido
  - [x] Decisão previsível por stage
  - [x] Smoke de trilho e next step autorizado
  - [x] Desacoplamento total da fala
Fora de escopo respeitado?:             sim
Pendências remanescentes:               nenhuma
Evidências / provas do encerramento:    PR #10, PR #11, PR #12 — diffs e smoke tests incluídos
Data de encerramento:                   2026-05-15T14:00:00Z
PR que encerrou:                        PR #12 — Smoke final do Core Mecânico 2
Destino do contrato encerrado:          archive (schema/contracts/archive/CORE_MECANICO_2_V1_2026-05-15.md)
Próximo contrato autorizado:            Contrato do Speech Engine (Fase 2 do A01)
```

### Exemplo B — Encerramento com pendências

```
--- ENCERRAMENTO DE CONTRATO ---
Contrato encerrado:                     schema/contracts/active/CORE_MECANICO_2_V1.md
Contrato encerrado com sucesso?:        não
Objetivo do contrato cumprido?:         não — critério de smoke de trilho não atingido
Critérios de aceite cumpridos?:         não
  - [x] Modelo de objetivos/stages definido
  - [x] Decisão previsível por stage
  - [ ] Smoke de trilho e next step autorizado (parcial — 3 de 5 cenários passando)
  - [x] Desacoplamento total da fala
Fora de escopo respeitado?:             sim
Pendências remanescentes:               2 cenários de smoke falhando (cenário de composição familiar e cenário de regime especial)
Evidências / provas do encerramento:    PR #10, PR #11 — diffs incluídos; smoke parcial em PR #11
Data de encerramento:                   (contrato NÃO encerrado — retorna para execução)
PR que encerrou:                        (N/A — contrato permanece ativo)
Destino do contrato encerrado:          permanece como ativo
Próximo contrato autorizado:            (N/A — contrato atual não encerrado)
```

---

## 11. Regra de parada

Se qualquer das condições abaixo for identificada ao tentar encerrar um contrato, parar e reportar:

- Checklist de encerramento incompleto
- Critérios de aceite não verificados
- Evidências insuficientes
- Fora de escopo violado durante a execução
- Pendências remanescentes não declaradas
- Tentativa de mover contrato para archive sem encerramento formal
- **Bloco E ausente ou com `Fechamento permitido nesta PR?: NÃO`** (A00-ADENDO-03)
- **Documento-base da evidência com lacuna remanescente, item parcial ou inconclusivo** (A00-ADENDO-03)
- **Critério de aceite com evidência parcial sendo declarado como `cumprido`** (A00-ADENDO-03)

**Regra de parada não é falha — é conformidade.**
