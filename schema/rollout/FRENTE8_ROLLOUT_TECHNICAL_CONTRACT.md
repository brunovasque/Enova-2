# FRENTE 8 — ROLLOUT TECHNICAL CONTRACT (PR2)

| Campo | Valor |
|---|---|
| Frente | 8 — Rollout |
| PR de execucao | PR2 |
| Classe da tarefa | contratual |
| Contrato pai | `schema/contracts/active/CONTRATO_ROLLOUT.md` |
| Estado deste artefato | ativo (tecnico-documental) |
| Runtime implementado nesta PR? | nao |
| Ultima atualizacao | 2026-04-22 |

---

## 1. Finalidade

Fechar o contrato tecnico canonicamente executavel da Frente 8 antes de qualquer runtime/controlador de rollout.

Este documento fixa, sem ambiguidade:

1. definicao tecnica de shadow mode, canary, cutover e rollback;
2. criterios de promocao e bloqueio;
3. janelas minimas de observacao;
4. evidencias minimas por estagio;
5. fronteiras de ativacao real;
6. limites estritos da PR3.

## 2. Escopo desta PR2

Incluido:

1. definicoes tecnicas de rollout em recorte minimo;
2. matriz de promocao/bloqueio por estagio;
3. pacote minimo de sinais/evidencias exigidos para PR3;
4. separacao repo-only vs dependente de ambiente externo;
5. limites explicitos de ativacao real.

Fora de escopo:

1. implementacao em `src/`;
2. rollout real;
3. deploy manual/externo;
4. dashboard externo;
5. ferramenta externa obrigatoria;
6. secrets/bindings/vars.

## 3. Definicoes tecnicas obrigatorias

### 3.1 Shadow mode

Shadow mode e a execucao paralela controlada do trilho candidato, com comparacao contra o trilho soberano ativo, sem assumir efeito de producao.

Regra tecnica:

1. pode observar, comparar e emitir evidencia;
2. nao pode tomar posse da decisao final soberana;
3. nao pode alterar rotas/contratos ja estaveis por padrao;
4. deve manter capacidade de desligamento imediato.

Evidencia minima para shadow aceitavel:

1. comparacao de saida por lote amostral;
2. registro de divergencias relevantes;
3. prova de que nao houve quebra das rotas base (`/`, `/__core__/run`, `/__meta__/ingest`).

Bloqueios de shadow:

1. divergencia sem classificacao;
2. regressao funcional nas rotas base;
3. ausencia de trilha minima de evidencia.

### 3.2 Canary

Canary e ativacao progressiva por fatia controlada, com promocao condicionada a sinais estaveis e abort rapido.

Regra tecnica:

1. entrada por percentual/fatia/canal (nunca 100% inicial);
2. observacao ativa por janela minima;
3. promocao apenas com evidencia de estabilidade;
4. abort imediato em sintoma critico.

### 3.3 Cutover

Cutover e transicao controlada para o modo candidato com gates formais de entrada e saida.

Pre-condicoes minimas:

1. shadow aprovado;
2. canary aprovado;
3. rollback viavel e pronto;
4. evidencias minimas completas.

Criterios de abort/cancelamento:

1. regressao critica;
2. perda de rastreabilidade;
3. ausencia de sinais minimos durante janela;
4. ativacao externa fora da fronteira autorizada.

### 3.4 Rollback

Rollback e retorno controlado para estado seguro conhecido.

Tipos:

1. rollback manual: decisao operacional com checklist;
2. rollback tecnico: guard/controle tecnico acionado por criterio contratado.

Rollback bem-sucedido exige:

1. restauracao de comportamento esperado das rotas base;
2. preservacao das evidencias da tentativa;
3. ausencia de perda de trilha de diagnostico.

## 4. Criterios de promocao e bloqueio

### 4.1 Shadow -> Canary (promocao)

So promove se:

1. nenhuma regressao critica confirmada;
2. divergencias classificadas e com tratativa;
3. janela minima de observacao concluida;
4. evidencia minima completa.

Bloqueia promocao se:

1. divergencias nao classificadas;
2. sintoma critico sem mitigacao;
3. ausencia de evidencia minima;
4. comportamento instavel nas rotas base.

### 4.2 Canary -> Cutover (promocao)

So promove se:

1. sinais minimos estaveis em janela definida;
2. taxa de regressao dentro do limite da frente;
3. rollback testavel;
4. gate go/no-go aprovado.

Bloqueia promocao se:

1. aumento consistente de erro/regressao;
2. perda de correlacao/rastreabilidade;
3. ausencia de evidencias de estabilidade;
4. qualquer quebra das frentes 1-7.

## 5. Janelas de observacao

Janela minima de observacao e o intervalo com volume e cobertura suficientes para decidir promocao com evidencia, nao por intuicao.

Minimo contratual desta frente:

1. shadow: janela com comparacao de lote representativo e classificacao de divergencia;
2. canary: janela com cobertura da fatia habilitada e sinais minimos completos;
3. cutover: janela intensiva inicial com criterios de abort ativos.

Janela insuficiente quando:

1. cobertura amostral abaixo do minimo definido para o estagio;
2. sinais obrigatorios ausentes;
3. divergencias sem classificacao.

## 6. Evidencias minimas por estagio

| Estagio | Evidencias minimas obrigatorias |
|---|---|
| Shadow | comparativo de comportamento, lista de divergencias classificadas, prova de integridade das rotas base |
| Canary | prova de fatia controlada, sinais minimos estaveis, registro de promocao/abort |
| Cutover | ata go/no-go, checklist de entrada, plano de rollback pronto, evidencias da janela intensiva |
| Rollback | gatilho registrado, retorno ao estado seguro comprovado, evidencias preservadas |

Evidencias que podem ser provadas so no repo:

1. contrato/gates/criterios persistidos;
2. smoke local e integridade de rotas tecnicas;
3. criterios de bloqueio e rollback documentados.

Evidencias que dependem de ambiente externo:

1. comportamento real de trafego em producao;
2. monitoracao externa em dashboard/provedor;
3. execucao de cutover real em ambiente produtivo.

## 7. Fronteiras de ativacao real

Permanece bloqueado sem contrato extraordinario:

1. Meta real em modo produtivo de rollout;
2. Supabase real novo/produtivo;
3. dashboard externo obrigatorio;
4. ferramenta externa obrigatoria;
5. deploy manual/externo de ativacao real.

PR3 pode tocar somente:

1. hooks/guards minimos locais;
2. flags/controles minimos se estritamente necessarios;
3. smoke minimo de rollout em ambiente tecnico;
4. evidencias locais do recorte contratado.

## 8. Limites contratuais da PR3

PR3 esta autorizada a:

1. implementar runtime minimo/controladores locais de rollout;
2. emitir sinais minimos de estado de rollout;
3. provar smoke minimo sem ativacao real.

PR3 nao esta autorizada a:

1. abrir rollout real completo;
2. abrir deploy externo/manual;
3. abrir dashboard externo;
4. abrir ferramenta externa obrigatoria;
5. abrir Meta real ou Supabase real novo/produtivo.

## 9. Sinais minimos esperados para PR3

Sem impor provedor externo, o recorte minimo deve conseguir representar:

1. estagio (`shadow`, `canary`, `cutover`, `rollback`);
2. decisao (`promote`, `hold`, `abort`, `rollback`);
3. motivo tecnico (`symptom_code`/causa equivalente);
4. correlacao basica (`trace_id`/`correlation_id`);
5. evidencia associada (`evidence_ref` local).

## 10. Criterios de aceite derivados

### 10.1 Criterios para PR3

1. runtime minimo/controladores locais implementados sem drift;
2. smoke minimo de rollout criado e passando;
3. integridade das frentes 1-7 preservada;
4. nenhuma ativacao externa indevida.

### 10.2 Criterios para PR4

1. smoke integrado final comprovando recorte da Frente 8;
2. prova de gates go/no-go e rollback/cutover no escopo contratado;
3. closeout readiness criado;
4. encerramento/arquivamento formal do contrato, se criterios cumpridos.

## 11. Loop obrigatorio preservado

Antes de qualquer tarefa da Frente 8, ler obrigatoriamente:

1. `schema/contracts/_INDEX.md`;
2. `schema/contracts/active/CONTRATO_ROLLOUT.md`;
3. `schema/status/ROLLOUT_STATUS.md`;
4. `schema/handoffs/ROLLOUT_LATEST.md`;
5. ordem oficial PR1/PR2/PR3/PR4;
6. gates operacionais e ativacao real;
7. criterios go/no-go;
8. rollback/cutover.

## 12. Declaracoes protocolares desta PR2

Mudancas em dados persistidos (Supabase): nenhuma.

Permissoes Cloudflare necessarias: nenhuma adicional.

Implementacao funcional em runtime: nenhuma.
