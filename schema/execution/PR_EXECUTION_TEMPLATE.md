# PR_EXECUTION_TEMPLATE — Template Canônico de Abertura de PR — ENOVA 2

> **Uso obrigatório.** Toda nova PR da implantação macro deve abrir-se com este
> bloco no body da PR (em complemento ao `.github/PULL_REQUEST_TEMPLATE.md`).
>
> Sem este bloco preenchido com valores reais (não placeholders), a PR é considerada
> não conforme e o PR Governance Gate deve barrá-la (ver `schema/CODEX_WORKFLOW.md` §20).
>
> Este template implementa a **Regra Q** de `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`:
> nenhuma PR pode ser aberta no escuro.

---

## Bloco obrigatório de abertura — DECLARAÇÃO CANÔNICA

> Mencionar o agente conforme `schema/CODEX_WORKFLOW.md` §18: `@copilot+claude-sonnet-4.6`
> (ou modelo escalado com justificativa explícita).

* **Macro lido:** `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — sim/não — seções/blocos:
* **Bíblia de PRs lida:** `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` — sim/não — seção da PR:
* **Fase ativa do macro:** T0 | T1 | T2 | T3 | T4 | T5 | T6 | T7 | Pré-T0 | Pós-go-live
* **Épico/microetapa do mestre:** (citar literalmente a microetapa que esta PR executa)
* **PR atual — ID lógico da Bíblia:** PR-... (deve coincidir com a "Próxima PR autorizada" do handoff anterior)
* **PR anterior — ID lógico da Bíblia + número/título no GitHub:** PR-... — #... — "..."
* **Handoff que estou seguindo (link):** `schema/handoffs/<FASE>_LATEST.md` (caminho exato)
* **Gate de entrada:** (qual gate da fase anterior está aprovado para autorizar esta PR; ou "pré-gate" se intermediária)
* **Gate de saída esperado para esta PR:** (qual sub-gate ou pré-readiness esta PR pretende atingir; "G_n aprovado" só se for a PR-Tn.R)

## Recorte executável

* **O que esta PR FECHA:**
  - ...
* **O que esta PR explicitamente NÃO FECHA:**
  - ...

## Vínculo contratual

* **Contrato ativo (do `schema/contracts/_INDEX.md`):** `schema/contracts/active/...`
* **Recorte executado do contrato:**
* **Houve abertura de novo contrato nesta PR?** não | sim — se sim, justificar

## Bloqueios herdados (do handoff anterior)

* **Riscos herdados que esta PR aceita carregar abertos:**
  - ...
* **Bloqueios formais que esta PR respeita** (Ex.: "T1 ainda fechada porque G0 não aprovado"):
  - ...

## Mudanças sensíveis declaradas

* **Mudanças em dados persistidos (Supabase):** nenhuma | sim — se sim, citar `DATA_CHANGE_PROTOCOL.md` §4.2
* **Permissões Cloudflare necessárias:** nenhuma adicional | sim — se sim, citar `CLOUDFLARE_PERMISSION_PROTOCOL.md` §4.2

## Continuidade obrigatória ao final

* Compromisso explícito: ao concluir esta PR, será produzido handoff em
  `schema/handoffs/<FASE>_LATEST.md` conforme `schema/handoffs/PR_HANDOFF_TEMPLATE.md`,
  declarando a **Próxima PR autorizada** segundo a Bíblia.

---

## Campos mínimos exigidos pelo PR Governance Gate

(Manter conforme `.github/PULL_REQUEST_TEMPLATE.md` — esses campos são bloqueantes do gate
e devem refletir os arquivos vivos do repo, ver `schema/CODEX_WORKFLOW.md` §20.)

* **Contrato ativo:** (caminho real do contrato em `schema/contracts/active/`)
* **Próximo passo autorizado:** (texto extraído de `schema/handoffs/<FASE>_LATEST.md` —
  deve coincidir com o ID lógico da próxima PR desta Bíblia)
