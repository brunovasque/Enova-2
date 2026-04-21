<!-- =====================================================================
     ENOVA 2 — PR TEMPLATE
     Body da PR é gate real de governança.
     Não abrir PR com template vazio, comentário HTML puro ou checklist solto.
     Campos mínimos obrigatórios com valor real:
       - Contrato ativo
       - Próximo passo autorizado
       - Objetivo
       - Classificação da tarefa
       - Escopo
       - Fora de escopo
       - Arquivos vivos atualizados
       - Testes / Validação
       - Plano de rollback
     Se "Contrato encerrado nesta PR?" = sim, o bloco completo
     --- ENCERRAMENTO DE CONTRATO ---
     passa a ser obrigatório e bloqueante.
     Fonte de verdade: arquivos vivos em schema/status/, schema/handoffs/, schema/contracts/
     ===================================================================== -->

## Contrato ativo
<!-- OBRIGATÓRIO — valor real, não placeholder -->
<!-- Copiar do arquivo vivo: schema/contracts/_INDEX.md -->

## Próximo passo autorizado
<!-- OBRIGATÓRIO — valor real, não placeholder -->
<!-- Copiar do handoff/status vivo da frente -->

## Objetivo
<!-- OBRIGATÓRIO — objetivo claro e verificável desta PR -->

## Classificação da tarefa
<!-- OBRIGATÓRIO — contratual | governança | fora_de_contrato | correcao_incidental | hotfix | diagnostico -->

## Última PR relevante
<!-- Número e título da última PR que afetou esta frente -->

## Objetivo imutável do contrato
<!-- Transcrição literal do objetivo do contrato ativo. Se nenhum contrato: "N/A" -->

## Recorte executado nesta PR
<!-- Qual parte do contrato ativo esta PR executa? -->
<!-- Se esta PR não executa contrato: "N/A" -->

## O que esta PR fecha do contrato
<!-- Lista objetiva dos itens do contrato concluídos por esta PR -->

## O que esta PR NÃO fecha do contrato
<!-- Lista dos itens do contrato que permanecem abertos após esta PR -->

## Houve desvio de contrato?
<!-- não | sim -->

## Contrato encerrado nesta PR?
<!-- não | sim -->
<!-- Se sim, o bloco abaixo é obrigatório e bloqueante -->

--- ENCERRAMENTO DE CONTRATO ---
Contrato encerrado:
Contrato encerrado com sucesso?:
Objetivo do contrato cumprido?:
Critérios de aceite cumpridos?:
Fora de escopo respeitado?:
Pendências remanescentes:
Evidências / provas do encerramento:
Data de encerramento:
PR que encerrou:
Destino do contrato encerrado:
Próximo contrato autorizado:

## Item do A01
<!-- Qual fase/prioridade/item exato do A01 esta PR atende? -->

## Estado herdado
<!-- O que a última PR fechou, o que não fechou, por que esta PR existe, se está dentro/fora do contrato -->

## Escopo
<!-- OBRIGATÓRIO — o que está incluído exatamente nesta PR -->

## Fora de escopo
<!-- OBRIGATÓRIO — o que NÃO está incluído nesta PR -->

## Mudanças em dados persistidos (Supabase)
<!-- OBRIGATÓRIO em toda PR — inclusive quando não houver mudança -->
<!-- Se não houver mudança: "Mudanças em dados persistidos (Supabase): nenhuma" -->

## Permissões Cloudflare necessárias
<!-- OBRIGATÓRIO em toda PR — inclusive quando não houver necessidade nova -->
<!-- Se não houver necessidade nova: "Permissões Cloudflare necessárias: nenhuma adicional" -->

## O que esta PR fecha
<!-- Lista objetiva do que foi concluído e fechado nesta PR -->

## O que esta PR NÃO fecha
<!-- Lista do que continua pendente após esta PR -->

## Estado atual da frente
<!-- Em que fase/estado a frente se encontra após esta entrega? -->

## Arquivos vivos atualizados
<!-- OBRIGATÓRIO — listar os arquivos vivos realmente alterados no diff -->
<!-- Se nenhum: "nenhuma atualização viva necessária" -->

## Referência de precedência
<!-- Confirmar: A00 > A01 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato ativo da frente > documentos legados aplicáveis -->

## Testes / Validação
<!-- OBRIGATÓRIO — comandos e resultado objetivo -->

## Plano de rollback
<!-- OBRIGATÓRIO — como reverter com segurança em caso de problema -->

## Riscos
<!-- Riscos conhecidos e mitigação -->

## Evidências
<!-- Links, logs, diffs, capturas, PRs, commits, smoke etc. -->

## Disciplina de request e modelo
<!-- Complexidade da tarefa: baixa | média | alta -->
<!-- Modelo utilizado: Sonnet | modelo mais caro (justificar se mais caro) -->
<!-- Automação introduzida: nenhuma | sim — descrição e justificativa -->
