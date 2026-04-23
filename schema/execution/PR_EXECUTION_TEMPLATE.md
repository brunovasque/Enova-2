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

## Exceção contratual (obrigatório — ver Bíblia §S)

> **Regra padrão:** seguir o contrato literalmente. Nenhuma quebra, flexibilização,
> suspensão parcial, "atalho útil" ou "quebra benéfica" pode ser feita por
> interpretação do executor. **Somente o Vasques pode autorizar manualmente uma
> exceção contratual**, de forma explícita, específica, temporária e registrada.
> Limites duros nunca exceptuáveis: soberania da IA na fala (A00-ADENDO-01),
> regras de negócio MCMV, gates G0..G7, mudanças Supabase silenciosas, encerramento
> implícito de contrato.

* **Exceção contratual autorizada pelo Vasques?:** não | sim | pendente — aguardando autorização
* **Motivo específico da exceção:** (preencher apenas se sim/pendente)
* **Benefício esperado ao contrato/projeto:** (preencher apenas se sim/pendente)
* **Escopo exato da quebra:** (preencher apenas se sim/pendente — nada além disso)
* **Duração da exceção (esta PR / até qual PR):** (preencher apenas se sim/pendente)
* **Condição objetiva de retorno à normalidade contratual:** (preencher apenas se sim/pendente)
* **Evidência da autorização do Vasques:** (link/quote do registro explícito — apenas se sim)
* **Esta PR introduz fala mecânica, surface engessada, fallback dominante ou desvio da soberania da IA?:** não (declaração obrigatória; "sim" é proibido por §S.3 mesmo sob autorização)

## Continuidade obrigatória ao final

* Compromisso explícito: ao concluir esta PR, será produzido handoff em
  `schema/handoffs/<FASE>_LATEST.md` conforme `schema/handoffs/PR_HANDOFF_TEMPLATE.md`,
  declarando a **Próxima PR autorizada** segundo a Bíblia.

## Fechamento por prova — Bloco E (obrigatório se esta PR tenta fechar etapa, gate ou contrato)

> **Este bloco é obrigatório** em toda PR que tente fechar etapa, gate, contrato, ou avançar
> a "Próxima PR autorizada" para uma fase diferente.
> Ver `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03) e
> `schema/CODEX_WORKFLOW.md` §21 para o protocolo completo.
>
> **Regra:** Se `Fechamento permitido nesta PR?` for `NÃO`, esta PR **não pode** ser declarada
> encerrada, o gate permanece aberto e a próxima PR = continuidade desta etapa.

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

---

## Campos mínimos exigidos pelo PR Governance Gate

(Manter conforme `.github/PULL_REQUEST_TEMPLATE.md` — esses campos são bloqueantes do gate
e devem refletir os arquivos vivos do repo, ver `schema/CODEX_WORKFLOW.md` §20.)

* **Contrato ativo:** (caminho real do contrato em `schema/contracts/active/`)
* **Próximo passo autorizado:** (texto extraído de `schema/handoffs/<FASE>_LATEST.md` —
  deve coincidir com o ID lógico da próxima PR desta Bíblia)
