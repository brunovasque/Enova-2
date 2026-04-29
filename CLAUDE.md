# Instruções para Claude Code — Enova-2

## Permissões automáticas
Todas as operações git e filesystem estão pré-aprovadas neste repo:
- git add, commit, push, checkout, branch, merge
- Criação e edição de arquivos
- Comandos compostos com cd && git

Não peça confirmação para operações git. Execute diretamente.

## Leitura obrigatória no início de cada sessão
Antes de qualquer ação, leia nesta ordem:
1. schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md
2. schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md
3. schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
4. schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md
5. schema/ADENDO_CANONICO_SOBERANIA_IA.md
6. schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md
7. schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md
8. schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T7_2026-04-29.md
9. schema/implantation/READINESS_G7.md

Se não conseguir ler qualquer arquivo obrigatório, pare e reporte bloqueio.

## Loop obrigatório de execução por PR

Toda sessão do Claude Code deve seguir este ciclo antes de qualquer alteração:

1. Ler CLAUDE.md.
2. Ler o contrato ativo em schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md.
3. Ler schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md.
4. Ler schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md.
5. Identificar a última PR concluída e a próxima PR autorizada.
6. Ler no contrato T8 a seção específica da próxima PR antes de iniciar.
7. Declarar o tipo da PR: PR-DIAG, PR-IMPL ou PR-PROVA.
8. Confirmar que a PR anterior exigida está concluída.
9. Se for PR-IMPL, confirmar que existe PR-DIAG anterior da mesma frente.
10. Se for fechamento de frente, confirmar que existe PR-PROVA.
11. Executar apenas o escopo da PR autorizada.
12. Atualizar obrigatoriamente:
    - schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md
    - schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
    - schema/contracts/_INDEX.md quando houver mudança de fase/estado
13. Atualizar ou criar a PR com o body padrão obrigatório.
14. Fazer commit e push no mesmo branch.
15. Responder com WORKFLOW_ACK: ok, resumo, branch, commit, rollback, testes, provas e push.

## Regras de bloqueio

- Se não conseguir ler o contrato ativo, parar.
- Se não conseguir identificar a próxima PR autorizada, parar.
- Se a PR solicitada não for a próxima autorizada, parar.
- Se for PR-IMPL sem PR-DIAG anterior, parar.
- Se tentar mexer fora do escopo da PR, parar.
- Se faltar atualização do STATUS ou LATEST, a tarefa está incompleta.

## Regras de execução
- Siga o contrato e a Bíblia Canônica sem desviar
- Não feche etapa sem evidência real de conclusão
- Toda PR da T8 deve declarar tipo: PR-DIAG, PR-IMPL ou PR-PROVA
- Nenhuma PR-IMPL pode iniciar sem PR-DIAG anterior da mesma frente
- Nenhuma frente pode ser considerada pronta sem PR-PROVA
- Nenhum cliente real, WhatsApp real ou go-live real pode ser ativado sem autorização expressa de Vasques
- Execute até concluir ou até bloqueio contratual real
- Responda sempre em português
