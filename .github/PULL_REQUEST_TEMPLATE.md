## Objetivo
<!-- Qual objetivo desta PR? -->

## Classificação da tarefa
<!-- contratual | governança | fora_de_contrato | correcao_incidental | hotfix | diagnostico -->
<!-- Ver definições completas em schema/TASK_CLASSIFICATION.md -->
<!-- Se fora_de_contrato ou hotfix: incluir justificativa abaixo -->

## Última PR relevante
<!-- Número e título da última PR que afetou esta frente -->

## Contrato ativo
<!-- Qual contrato da frente está ativo nesta PR? Se nenhum: "Nenhum contrato ativo" -->

## Item do A01
<!-- Qual fase/prioridade/item exato do A01 esta PR atende? -->

## Estado herdado
<!-- O que você herdou da última PR? -->
<!-- O que a última PR fechou: -->
<!-- O que a última PR NÃO fechou: -->
<!-- Por que esta PR existe (justificativa operacional): -->
<!-- Esta tarefa está dentro ou fora do contrato ativo: -->

## Escopo
<!-- O que está incluído exatamente nesta PR? -->

## Fora de escopo
<!-- O que NÃO está incluído nesta PR? -->

## Mudanças em dados persistidos (Supabase)
<!-- OBRIGATÓRIO em toda PR — inclusive quando não houver mudança -->
<!-- Se não houver mudança: "Mudanças em dados persistidos (Supabase): nenhuma" -->
<!-- Se houver mudança, preencher o bloco abaixo para CADA tabela afetada: -->
<!--
Mudanças em dados persistidos (Supabase): sim

  Tabela afetada:
  Tipo de mudança:          (create_table | alter_table | add_column | alter_column | drop_column | drop_table | add_index | drop_index | add_constraint | drop_constraint | alter_relationship | backfill | migration)
  Coluna(s) afetada(s):
  Motivo da mudança:
  Impacto esperado:
  Compatibilidade retroativa: (sim | não | parcial)
  Necessidade de migração:
  Necessidade de backfill:
  Risco:                     (baixo | médio | alto)
  Rollback:
-->
<!-- Ver schema/DATA_CHANGE_PROTOCOL.md para referência completa -->

## Permissões Cloudflare necessárias
<!-- OBRIGATÓRIO em toda PR — inclusive quando não houver necessidade nova -->
<!-- Se não houver necessidade nova: "Permissões Cloudflare necessárias: nenhuma adicional" -->
<!-- Se houver necessidade nova, preencher o bloco abaixo para CADA recurso afetado: -->
<!--
Permissões Cloudflare necessárias: sim

  Recurso Cloudflare afetado:          (Workers Script | KV | R2 | D1 | Queues | Routes | Service Binding | Secrets | Vars | Observability | Outro)
  Ação pretendida:
  Permissões atuais suficientes?        (sim | não | incerto)
  Permissões adicionais necessárias:
  Motivo:
  Impacto se não ampliar permissões:
  Pode prosseguir sem ampliar?          (sim | não — justificativa)
  Onde ajustar:                         (token Cloudflare | GitHub Secrets | wrangler.toml bindings | Cloudflare Dashboard | outro)
-->
<!-- Ver schema/CLOUDFLARE_PERMISSION_PROTOCOL.md para referência completa -->

## O que esta PR fecha
<!-- Lista objetiva do que foi concluído e fechado nesta PR -->

## O que esta PR NÃO fecha
<!-- Lista do que continua pendente após esta PR -->

## Estado atual da frente
<!-- Em que fase/estado a frente se encontra após esta entrega? -->

## Próximo passo autorizado após esta PR
<!-- Qual é o próximo passo explicitamente autorizado pelo A01 e pelo contrato ativo? -->
<!-- Este passo foi preservado ou alterado em relação ao que estava antes desta PR? -->

## Arquivos vivos atualizados
<!-- Lista dos arquivos de status/handoff/contrato efetivamente atualizados nesta PR -->
<!-- Ex: schema/status/CORE_MECANICO_2_STATUS.md, schema/handoffs/CORE_MECANICO_2_LATEST.md -->

## Referência de precedência
<!-- Confirmar: A00 > A01 > A02 > contrato específico da frente ativa > documentos legados aplicáveis -->

## Testes / Validação
<!-- Quais validações foram executadas? -->

## Plano de rollback
<!-- Como reverter com segurança em caso de problema? -->
<!-- Se houve mudança em dados persistidos (Supabase), o plano de rollback de dados deve estar incluído aqui -->

## Riscos
<!-- Riscos conhecidos e mitigação -->

## Evidências
<!-- Links, capturas, logs, diffs, etc. -->
