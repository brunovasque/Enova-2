# ADENDO CANÔNICO — FECHAMENTO POR PROVA — ENOVA 2

> **Identificador canônico:** A00-ADENDO-03
> **Status:** Adendo canônico ativo — vigência imediata e transversal a todas as frentes, PRs e handoffs.
> **Precedência:** Complementa e aprofunda o A00-ADENDO-01 e A00-ADENDO-02. Posição na cadeia:
> `LEGADO_MESTRE > A00 > A01 > A00-ADENDO-01 > A00-ADENDO-02 > A00-ADENDO-03 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato ativo`
> **Leitura obrigatória:** Em toda tarefa/PR que tente fechar etapa, gate, contrato, ou avançar próxima PR autorizada.
> Este adendo é leitura obrigatória complementar ao `schema/CODEX_WORKFLOW.md` — não substitui, acrescenta restrição formal.

---

## 1. Fundamento — por que este adendo existe

A ENOVA 2 vivenciou o padrão de erro de **fechamento precoce de etapa**: uma PR foi declarada encerrada, o handoff foi avançado e a próxima PR autorizada foi promovida — mas o documento-base da evidência ainda continha lacunas, itens parciais, inconclusivos ou prova insuficiente.

Esse padrão é estruturalmente perigoso porque:
- Cria falsa segurança de que uma etapa foi concluída.
- Propaga o estado incorreto para os arquivos vivos (status, handoff, contrato).
- Autoriza a próxima PR a partir de uma base não verificada.
- Torna o erro invisível até que ele cause dano real em fases posteriores.

Este adendo institui a trava canônica que impede esse padrão em toda PR futura.

---

## 2. Regra central: "Evidência manda no estado"

> **A evidência-base de uma entrega prevalece sobre qualquer intenção, declaração ou pressão de fechamento.**

Se o documento-base da evidência ainda contiver **qualquer** marcador equivalente a:

- `parcial estrutural`
- `inconclusivo`
- `lacuna remanescente`
- `pendente de prova`
- `prova parcial`
- `não fechado`
- `critério não verificado`
- `smoke não executado`
- `evidência ausente`

ou qualquer equivalente semântico de **insuficiência de prova**, então é **proibido**:

- Declarar PR/etapa encerrada.
- Avançar próxima PR autorizada.
- Fechar gate (G0-G7).
- Atualizar contrato, status ou handoff como se a etapa estivesse concluída.
- Mover contrato para `archive/` como se o closeout fosse completo.

### 2.1 Estado obrigatório quando há insuficiência de prova

Nesses casos, o estado **obrigatório** deve permanecer:

- PR atual: **aberta / em execução** (não encerrada).
- Gate atual: **aberto** (não fechado).
- Próxima PR: **continuidade da mesma etapa** (não avanço de fase).
- Arquivos vivos: devem refletir a insuficiência, não ignorá-la.

---

## 3. Checklist obrigatório de evidência — "Bloco E"

Toda PR que tente fechar etapa, gate, contrato ou avançar próxima PR **deve incluir** o seguinte bloco:

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           <caminho do arquivo que contém a prova da entrega>
Estado da evidência:                   completa | parcial | incompleta | ausente
Há lacuna remanescente?:               não | sim — <descrição da lacuna>
Há item parcial/inconclusivo bloqueante?: não | sim — <descrição do item>
Fechamento permitido nesta PR?:        sim | NÃO — BLOQUEADO por insuficiência de evidência
Estado permitido após esta PR:         encerrada | em execução (continua aberta)
Próxima PR autorizada:                 <ID lógico da próxima PR> | continuação desta etapa
```

**Regra de bloqueio:**
- Se `Estado da evidência` for `parcial`, `incompleta` ou `ausente` → `Fechamento permitido nesta PR?: NÃO`
- Se `Há lacuna remanescente?` for `sim` → `Fechamento permitido nesta PR?: NÃO`
- Se `Há item parcial/inconclusivo bloqueante?` for `sim` → `Fechamento permitido nesta PR?: NÃO`
- Se `Fechamento permitido nesta PR?: NÃO` → `Estado permitido após esta PR: em execução (continua aberta)`
- Se `Fechamento permitido nesta PR?: NÃO` → `Próxima PR autorizada: continuação desta etapa`

**Bloco incompleto ou com contradição interna = PR não conforme.**

---

## 4. Obrigações por tipo de artefato

### 4.1 PR de execução contratual

- Deve incluir o Bloco E (seção 3) no body da PR e no ESTADO ENTREGUE.
- `Fechamento permitido nesta PR?: NÃO` bloqueia: mover contrato para archive, atualizar status para "concluído", declarar gate aprovado, promover próxima PR.
- Melhora parcial de evidência **não** autoriza avanço de estado. Apenas evidência completa autoriza fechamento.
- Todo claim de fechamento deve citar explicitamente o documento-base e o estado da evidência.

### 4.2 Handoff de PR

- O handoff deve declarar explicitamente um dos três estados:
  - `continuidade de etapa` — PR ainda em execução, lacuna remanescente declarada
  - `fechamento válido` — evidência completa, fechamento autorizado
  - `bloqueado por prova insuficiente` — fechamento tentado, impedido por este adendo
- O campo "Próxima PR autorizada" só pode avançar fase se o estado for `fechamento válido`.

### 4.3 Encerramento de contrato (closeout)

- Critério adicional obrigatório: o documento-base da evidência **não pode** conter insuficiência declarada.
- A checagem do Bloco E deve constar do checklist de encerramento (`CONTRACT_CLOSEOUT_PROTOCOL.md` seção 4).
- "Critérios de aceite cumpridos: sim" só é válido se cada critério tiver evidência completa, não parcial.

### 4.4 Atualização de arquivos vivos

- Se a PR não pode encerrar (Bloco E = `NÃO`), os arquivos vivos (status, handoff, contrato) **não podem** indicar encerramento, gate fechado ou próxima fase autorizada.
- Status vivo deve conter: `Estado da frente: em execução` (não `concluída`).
- Handoff vivo deve conter: `Continuidade de etapa` (não `fechamento`).

---

## 5. Proibições formais (não conformidade grave)

As seguintes situações são proibidas por este adendo:

- Declarar PR encerrada com evidência parcial no documento-base.
- Avançar "Próxima PR autorizada" quando o documento-base ainda tem lacuna declarada.
- Fechar gate com critério de aceite "parcial" no closeout.
- Escrever `Contrato encerrado com sucesso?: sim` quando o documento-base ainda contém insuficiência.
- Atualizar handoff/status como encerrado quando o Bloco E indica `NÃO`.
- Omitir o Bloco E de uma PR que tenta fechar etapa ou avançar gate.
- Interpretar melhora incremental de evidência como prova suficiente de fechamento.

---

## 6. Precedência em conflito

Se houver conflito aparente entre este adendo e qualquer contrato de frente individual, o adendo **prevalece**.

Se houver conflito aparente entre este adendo e qualquer interpretação de que "a PR está quase pronta" ou "a maioria dos itens foi feita", o adendo **prevalece**.

A única exceção explicitamente autorizada é a **exceção contratual manual do Vasques** (conforme `schema/CODEX_WORKFLOW.md` §8.4 e `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` §S), que deve ser registrada nos mesmos campos de exceção do template.

---

## 7. Integração com o CODEX_WORKFLOW

Este adendo se integra ao CODEX_WORKFLOW da seguinte forma:

| Etapa do CODEX_WORKFLOW | Impacto deste adendo |
|-------------------------|----------------------|
| Etapa 12 — Execução | Antes de declarar entrega, verificar documento-base |
| Etapa 13 — ESTADO ENTREGUE | Incluir Bloco E obrigatório |
| Etapa 14 — Atualização viva | Só atualizar como encerrado se Bloco E = `sim` |
| Etapa 15 — Closeout | Bloco E é pré-requisito do checklist de encerramento |
| §8.3 — Fechamento obrigatório de PR | Handoff deve declarar estado de evidência |
| §8.7 — Checagem final de coerência | Incluir verificação do Bloco E |

---

## 8. Critério de conformidade

Esta regra está **ativa e obrigatória** a partir da data de commit deste adendo.

Toda tarefa futura, toda PR, todo handoff e toda decisão de fechamento estão sujeitos a este adendo.

Não há período de transição. A insuficiência de prova bloqueia o fechamento — sempre.

**Este adendo foi instituído para tornar impossível documentalmente o padrão:**
> "evidência parcial + arquivos vivos avançados como se a etapa estivesse encerrada"
