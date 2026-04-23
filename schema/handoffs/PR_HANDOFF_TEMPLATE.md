# PR_HANDOFF_TEMPLATE — Template Canônico de Handoff de PR — ENOVA 2

> **Uso obrigatório.** Toda PR concluída deve produzir, no repo, um handoff seguindo
> este template no arquivo correspondente em `schema/handoffs/<FASE>_LATEST.md`
> (ex.: `IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` enquanto T0 estiver ativo;
> `T1_LATEST.md`, `T2_LATEST.md`, etc., quando as fases forem abertas).
>
> **PR sem handoff conforme este template é considerada não conforme** e bloqueia a
> abertura da próxima PR. Esta regra está consolidada na seção P de
> `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`.
>
> **Objetivo:** impedir continuidade no escuro. Qualquer nova aba deve conseguir
> retomar o projeto lendo apenas: o mestre + a Bíblia + este handoff.

---

## Identificação

* **Base macro lida:** `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — sim/não — seções/blocos consultados:
* **Bíblia de PRs lida:** `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` — sim/não — seções consultadas:
* **Fase macro:** T0 | T1 | T2 | T3 | T4 | T5 | T6 | T7 | Pré-T0 (preparatória) | Pós-go-live
* **Épico/microetapa do mestre:** (citar a microetapa literal do mestre)
* **PR atual — ID lógico desta Bíblia:** PR-... (ex.: PR-T0.1)
* **PR atual — número/título no GitHub:** #... — "..."
* **Branch:** `...`
* **Commit final desta PR:** `...`
* **Data de conclusão:** YYYY-MM-DD
* **Classificação da tarefa** (ver `schema/TASK_CLASSIFICATION.md`):
  contratual | governança | fora_de_contrato | correcao_incidental | hotfix | diagnostico

## Vínculo contratual

* **Contrato ativo:** `schema/contracts/active/...` ou "Nenhum contrato ativo — declarar parada"
* **Recorte executado do contrato:**
* **Houve desvio de contrato?** não | sim — se sim, ver `CONTRACT_EXECUTION_PROTOCOL.md` §6
* **Contrato encerrado nesta PR?** não | sim — se sim, ver `CONTRACT_CLOSEOUT_PROTOCOL.md`

## Objetivo executado

(O que esta PR fez de fato — em uma frase, sem floreio.)

## Escopo

* **Escopo incluído:**
  - ...
* **Escopo proibido / explicitamente NÃO incluído:**
  - ...

## Arquivos alterados

| Arquivo | Tipo de mudança | Resumo |
|---------|-----------------|--------|
| `...`   | criado/alterado/removido | ... |

## Testes / evidências mínimas

* Smoke / bateria / casos cobertos:
* Links de evidência (logs, prints, diffs, runs de CI):

## Gates

* **Gate atual:** G0 | G1 | G2 | G3 | G4 | G5 | G6 | G7 | (pré-gate)
* **Gate atingido nesta PR?** não | sim
* **Se sim, qual gate fechou:** (citar)
* **Se não, por quê:** (citar bloqueio)

## Pendências / riscos

* **Pendências remanescentes:**
  - ...
* **Riscos remanescentes (herdados ou novos):**
  - ...
* **Mudanças em dados persistidos (Supabase):** nenhuma | sim — se sim, citar `DATA_CHANGE_PROTOCOL.md` §4.2
* **Permissões Cloudflare necessárias:** nenhuma adicional | sim — se sim, citar `CLOUDFLARE_PERMISSION_PROTOCOL.md` §4.2

## Exceção contratual (obrigatório — ver Bíblia §S)

> **Regra padrão:** seguir o contrato literalmente. Nenhuma quebra, flexibilização,
> "atalho útil" ou "quebra benéfica" pode ser feita por interpretação do executor.
> **Somente o Vasques pode autorizar manualmente uma exceção contratual**, de forma
> explícita, específica, temporária e registrada. Encerrada a causa específica, o
> projeto retorna automaticamente à normalidade. Limites duros nunca exceptuáveis:
> soberania da IA na fala (A00-ADENDO-01), regras de negócio MCMV, gates G0..G7,
> mudanças Supabase silenciosas, encerramento implícito de contrato.

* **Esta PR operou sob exceção contratual autorizada pelo Vasques?:** não | sim
* **Motivo específico da exceção:** (apenas se sim)
* **Benefício obtido para o contrato/projeto:** (apenas se sim)
* **Escopo exato da quebra realizada:** (apenas se sim)
* **Duração da exceção (esta PR / até qual PR):** (apenas se sim)
* **Condição objetiva de retorno à normalidade contratual:** (apenas se sim)
* **Evidência da autorização do Vasques:** (link/quote — apenas se sim)
* **A causa específica da exceção foi encerrada nesta PR?:** N/A | sim | não
* **A próxima PR herda exceção ativa?:** não — volta à normalidade do contrato | sim — a próxima PR deve declarar a mesma exceção e repetir todos os campos
* **Esta PR introduziu fala mecânica, surface engessada, fallback dominante ou desvio da soberania da IA?:** não (declaração obrigatória; "sim" é proibido por §S.3 mesmo sob autorização)

## Plano de rollback

(O que fazer para reverter o que esta PR introduziu — comandos, branches, contratos a reabrir.)

## O que NÃO foi feito

(Lista objetiva — itens que, se ficassem implícitos, levariam a próxima aba ao escuro.)

---

## Próxima PR (obrigatório)

* **Próxima PR autorizada — ID lógico da Bíblia:** PR-...
* **Resumo da próxima PR:** (uma a três linhas, derivadas da seção R da Bíblia)
* **Por que ela é a próxima correta segundo o macro:**
  (Citar literalmente a microetapa do mestre que ela executa.)

* **Leituras obrigatórias da próxima PR:**
  1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção/bloco aplicável
  2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` — seção da PR
  3. `schema/handoffs/<FASE>_LATEST.md` (este handoff)
  4. Contrato ativo da fase em `schema/contracts/active/`
  5. `schema/CODEX_WORKFLOW.md` (16 etapas)
  6. (Outras leituras específicas)

* **Arquivos que a próxima PR deve TOCAR:**
  - ...
* **Arquivos que a próxima PR deve EVITAR:**
  - ... (citar contratos não relacionados, runtime fora de fase, Supabase real fora de fase, etc.)

* **Riscos herdados que continuam abertos para a próxima PR:**
  - ...

* **Bloqueios formais para a próxima PR:**
  (Ex.: "Não pode abrir antes de PR-Tx.R ser merged"; "Bloqueada até G_n aprovado".)

---

## Declaração final

* `WORKFLOW_ACK: ok`
* O próximo passo único autorizado nos arquivos vivos
  (`schema/contracts/_INDEX.md`, `schema/status/<FASE>_STATUS.md`,
  `schema/handoffs/<FASE>_LATEST.md`) coincide com a **Próxima PR autorizada**
  declarada acima: sim | não — se não, **parar e revisar antes de abrir a próxima PR.**
