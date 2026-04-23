# HANDOFF — Core Mecânico 2 — ENOVA 2

## Aviso de rebase canonico — 2026-04-22

Este arquivo preserva o historico tecnico/local do recorte anterior. Apos o rebase canonico, ele nao deve ser lido como prova de implantacao macro concluida. A base macro soberana passou a ser `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`; a fase real atual e T0/G0, conforme `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.


| Campo                                      | Valor |
|--------------------------------------------|-------|
| Frente                                     | Core Mecânico 2 |
| Data                                       | 2026-04-21T01:10:53Z |
| Estado da frente                           | concluída — Core completo do topo ao handoff e contrato encerrado formalmente |
| Classificação da tarefa                    | governança — closeout formal do contrato + endurecimento do PR Governance Gate |
| Última PR relevante                        | PR 23 — L17: Final operacional, docs, visita e handoff |
| Contrato ativo                             | Nenhum — contrato anterior encerrado em 2026-04-21 |
| Recorte executado do contrato              | closeout formal do contrato do Core Mecânico 2 |
| Pendência contratual remanescente          | nenhuma |
| Houve desvio de contrato?                  | não |
| Contrato encerrado nesta PR?               | sim |
| Item do A01 atendido                       | Fase 2 — Prioridade 1 concluída para o Core Mecânico 2 |
| Próximo passo autorizado                   | abrir o Contrato do Speech Engine e Surface Única |
| Próximo passo foi alterado?                | sim |
| Tarefa fora de contrato?                   | não |
| Mudanças em dados persistidos (Supabase)   | nenhuma |
| Permissões Cloudflare necessárias          | nenhuma adicional |
| Fontes de verdade consultadas              | contrato ativo, closeout protocol, status, handoff, PR template, validator, PRs 17–23 |

---

## 1. Contexto curto

A PR 23 fechou a última pendência técnica do contrato do Core Mecânico 2: L17 — final operacional, docs, visita e handoff. Após o merge, restavam dois movimentos formais:
1. aplicar o closeout oficial do contrato;
2. endurecer o workflow de governança para evitar novamente PR com descrição/body insuficiente ou frouxo.

Os dois movimentos foram executados diretamente no repositório.

## 2. Classificação da tarefa

**governança**

## 3. Última PR relevante

PR 23 — L17: Final operacional, docs, visita e handoff.

## 4. O que a PR anterior fechou

- L17 no Core real
- prova ponta a ponta via Worker
- correção do P1 de recusa explícita de visita
- smoke topo → final

## 5. O que a PR anterior NÃO fechou

- encerramento formal do contrato
- arquivamento do contrato ativo
- endurecimento do gate de governança do body da PR

## 6. Diagnóstico confirmado

- o contrato do Core estava tecnicamente completo após a PR 23
- status e handoff ainda marcavam closeout pendente
- o erro recorrente de body frouxo continuava pouco amarrado no workflow porque o gate bloqueava só o mínimo de 2 campos
- o repositório precisava exigir mais corpo real e exigir bloco formal de encerramento quando uma PR disser que encerra contrato

## 7. O que foi feito

- contrato ativo do Core foi encerrado formalmente e arquivado em `schema/contracts/archive/CONTRATO_CORE_MECANICO_2_2026-04-21.md`
- `schema/contracts/_INDEX.md` foi atualizado para remover contrato ativo do Core e registrar o arquivo arquivado
- `schema/status/CORE_MECANICO_2_STATUS.md` foi atualizado para estado encerrado/concluído
- `schema/handoffs/CORE_MECANICO_2_LATEST.md` foi atualizado para refletir closeout formal e próximo passo
- `.github/PULL_REQUEST_TEMPLATE.md` foi endurecido para deixar explícitos os blocos mínimos obrigatórios e o bloco obrigatório de closeout quando aplicável
- `scripts/validate_pr_governance.js` foi endurecido para bloquear body incompleto em campos centrais e validar o bloco de closeout quando `Contrato encerrado nesta PR? = sim`
- `.github/workflows/pr-governance-check.yml` foi ajustado para refletir esse endurecimento no próprio workflow

## 8. O que não foi feito

- não abriu o contrato do Speech ainda
- não mexeu em Worker funcional, Speech, Supabase, Meta/WhatsApp ou telemetria
- não alterou lógica do produto fora do necessário para o closeout e governança

## 9. O que esta tarefa fecha

- encerramento formal do contrato do Core Mecânico 2
- arquivamento do contrato
- amarração obrigatória do body de PR no workflow de governança

## 10. O que continua pendente

- abertura do contrato do Speech Engine e Surface Única

## 11. Esta tarefa foi fora de contrato?

**não**

Foi governança de encerramento e continuidade, explicitamente prevista pelo `CONTRACT_CLOSEOUT_PROTOCOL.md`.

## 12. Arquivos relevantes

- `schema/contracts/_INDEX.md`
- `schema/contracts/archive/CONTRATO_CORE_MECANICO_2_2026-04-21.md`
- `schema/status/_INDEX.md`
- `schema/status/CORE_MECANICO_2_STATUS.md`
- `schema/handoffs/_INDEX.md`
- `schema/handoffs/CORE_MECANICO_2_LATEST.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/workflows/pr-governance-check.yml`
- `scripts/validate_pr_governance.js`

## 13. Item do A01 atendido

- **Fase 2**
- **Prioridade 1**
- **Item**: Core Mecânico 2 encerrado formalmente

## 14. Estado atual da frente

**concluída**

## 15. Próximo passo autorizado

**Abrir o Contrato do Speech Engine e Surface Única.**

## 16. Riscos

- se alguém tentar fechar contrato em PR futura sem bloco formal de closeout, o workflow agora deve reprovar
- o próximo risco natural não é técnico no Core; é abrir a próxima frente sem contrato

## 17. Provas

- PRs 17, 18, 19, 20, 21, 22 e 23 cobrem a execução do contrato do Core
- PR 23 entregou L17 e smoke topo → final
- closeout formal aplicado em arquivo arquivado + índice/status/handoff sincronizados
- gate de governança endurecido em template + validator + workflow

## 18. Mudanças em dados persistidos (Supabase)

Mudanças em dados persistidos (Supabase): nenhuma

## 19. Permissões Cloudflare necessárias

Permissões Cloudflare necessárias: nenhuma adicional

## 20. Fontes consultadas como fonte de verdade

Fontes de verdade consultadas:
- `schema/contracts/_INDEX.md`
- `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`
- `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
- `schema/status/CORE_MECANICO_2_STATUS.md`
- `schema/handoffs/CORE_MECANICO_2_LATEST.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/workflows/pr-governance-check.yml`
- `scripts/validate_pr_governance.js`
- PRs 17, 18, 19, 20, 21, 22 e 23
