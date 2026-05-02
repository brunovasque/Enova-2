# Instruções para Claude Code — Enova-2

## Permissões automáticas
Todas as operações git e filesystem estão pré-aprovadas neste repo:
- git add, commit, push, checkout, branch, merge
- Criação e edição de arquivos
- Comandos compostos com cd && git

Não peça confirmação para operações git. Execute diretamente.

## Leitura obrigatória no início de cada sessão
Antes de qualquer ação, leia nesta ordem:
1. schema/contracts/_INDEX.md — identifica o contrato macro ativo atual
2. O contrato ativo listado em schema/contracts/active/ (conforme _INDEX.md — atualmente CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md)
3. schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md
4. schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
5. schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md
6. schema/ADENDO_CANONICO_SOBERANIA_IA.md
7. schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md
8. schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md

Se não conseguir ler qualquer arquivo obrigatório, pare e reporte bloqueio.

## Loop obrigatório de execução por PR

Toda sessão do Claude Code deve seguir este ciclo antes de qualquer alteração:

1. Ler CLAUDE.md.
2. Ler schema/contracts/_INDEX.md para identificar o contrato macro ativo.
3. Ler o contrato ativo em schema/contracts/active/ (conforme _INDEX.md).
4. Ler schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md.
5. Ler schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md.
6. Identificar a última PR concluída e a próxima PR autorizada.
7. Ler no contrato ativo a seção específica da próxima PR antes de iniciar.
8. Declarar o tipo da PR: PR-DIAG, PR-IMPL, PR-PROVA ou PR-DOC.
9. Confirmar que a PR anterior exigida está concluída.
10. Se for PR-IMPL, confirmar que existe PR-DIAG anterior da mesma frente.
11. Se for fechamento de frente, confirmar que existe PR-PROVA.
12. Executar apenas o escopo da PR autorizada.
13. Atualizar obrigatoriamente:
    - schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md
    - schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
    - schema/contracts/_INDEX.md quando houver mudança de fase/estado
14. Atualizar ou criar a PR com o body padrão obrigatório.
15. Fazer commit e push no mesmo branch.
16. Responder com WORKFLOW_ACK: ok, resumo, branch, commit, rollback, testes, provas e push.

## Regras de bloqueio

- Se não conseguir ler o contrato ativo, parar.
- Se não conseguir identificar a próxima PR autorizada, parar.
- Se a PR solicitada não for a próxima autorizada, parar.
- Se for PR-IMPL sem PR-DIAG anterior, parar.
- Se tentar mexer fora do escopo da PR, parar.
- Se faltar atualização do STATUS ou LATEST, a tarefa está incompleta.

## Regras de execução
- Siga o contrato ativo (via _INDEX.md) e a Bíblia Canônica sem desviar
- Não feche etapa sem evidência real de conclusão
- Toda PR deve declarar tipo: PR-DIAG, PR-IMPL, PR-PROVA ou PR-DOC
- Nenhuma PR-IMPL pode iniciar sem PR-DIAG anterior da mesma frente
- Nenhuma frente pode ser considerada pronta sem PR-PROVA
- Nenhum cliente real, WhatsApp real ou go-live real pode ser ativado sem autorização expressa de Vasques
- Execute até concluir ou até bloqueio contratual real
- Responda sempre em português
