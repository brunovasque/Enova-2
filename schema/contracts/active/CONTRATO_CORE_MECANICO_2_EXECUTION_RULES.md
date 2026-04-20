# REGRAS DE EXECUÇÃO — Core Mecânico 2 — ENOVA 2

> **Este documento trava as regras operacionais de execução para PRs subordinadas ao contrato ativo do Core Mecânico 2.**
>
> Nenhuma PR contratual futura do Core pode executar sem cumprir integralmente estas regras.
>
> **Subordinação:** este documento está subordinado ao contrato ativo do Core
> (`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`), ao `CONTRACT_EXECUTION_PROTOCOL`
> e à cadeia de precedência `A00 > A01 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato ativo > legados > PDF-fonte`.

---

## 1. Regra de âncora contratual obrigatória

Toda PR contratual de execução do Core Mecânico 2 DEVE declarar explicitamente, antes de executar qualquer implementação:

```
--- ÂNCORA CONTRATUAL ---
Cláusula-fonte:     <referência ao CLAUSE_MAP — ex: A00-06, L-01, A01-05>
Bloco legado:       <L03 | L04 | ... | L17 — qual bloco do legado>
Página-fonte:       <página do PDF-fonte consultada, ou "A00 seção X" / "A01 seção Y">
Gate-fonte:         <gate do A01 aplicável — ex: Gate 1, Gate 2>
Evidência exigida:  <qual prova mínima esta PR deve apresentar>
```

### Condição de parada por falta de âncora

**Se a PR NÃO conseguir preencher todos os campos acima:**
→ **PARAR.** A PR não pode prosseguir sem âncora contratual explícita.

**Justificativa:** execução sem âncora é o mecanismo pelo qual drift contratual se instala.

---

## 2. Regra de consulta obrigatória ao PDF-fonte

Dado que todos os blocos legados obrigatórios (L03–L17) estão com status "Identificado estruturalmente — não transcrito" no `INDEX_LEGADO_MESTRE.md`:

1. Toda PR que implementa regras derivadas de um bloco legado **DEVE** consultar diretamente o PDF-fonte: `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`.
2. A PR **DEVE** declarar explicitamente no ESTADO HERDADO e ESTADO ENTREGUE:
   ```
   PDF mestre consultado: sim
     Seção/bloco consultado: <L0x>
     Motivo: bloco não transcrito no markdown — consulta direta ao PDF obrigatória
   ```
3. Se a PR tentar implementar regra de negócio sem ter consultado o bloco correspondente no PDF:
   → **PARAR.** Implementação sem leitura do PDF-fonte é não conforme.

---

## 3. Regra de parada por dúvida interpretativa

Se, durante a execução de uma PR, o agente encontrar:

1. **Ambiguidade na regra** — duas interpretações possíveis do bloco legado → **PARAR** e consultar PDF-fonte. Se a ambiguidade persistir após consulta ao PDF → **PARAR** e reportar ao humano.
2. **Lacuna na regra** — o bloco legado não cobre o caso encontrado → **PARAR** e reportar. Não inventar regra.
3. **Conflito entre fontes** — bloco legado diz uma coisa, contrato ativo diz outra → **PARAR**. Aplicar cadeia de precedência. Se o conflito persistir → reportar ao humano.

**Princípio:** em caso de dúvida entre clareza e fidelidade, priorizar fidelidade. Em caso de conflito, o PDF-fonte vence.

---

## 4. Regra de parada por expansão de escopo

Se a PR tentar:

1. **Implementar funcionalidade fora do contrato ativo** — o contrato lista escopo e fora de escopo. Se a funcionalidade não está no escopo → **PARAR**.
2. **Adicionar regra de negócio não derivada dos blocos L03–L17** — regras de negócio que não têm âncora nos blocos legados ou no PDF-fonte → **PARAR**.
3. **Criar speech, surface, phrasing ou resposta ao cliente no Core** — viola a cláusula central de soberania conversacional → **PARAR**.
4. **Abrir frente diferente dentro de PR do Core** — A01 seção 9: "Uma frente por vez." → **PARAR**.
5. **Alterar o contrato ativo silenciosamente** — qualquer alteração ao contrato requer classificação `governança` e PR separada → **PARAR**.

---

## 5. Regra de fidelidade ao texto-fonte

Toda PR de execução do Core:

1. **NÃO deve parafrasear livremente cláusulas críticas do legado.** Quando necessário citar uma regra, copiar literalmente trechos curtos e críticos da fonte.
2. **DEVE ancorar cada regra implementada por PDF/página/cláusula/bloco aplicável.** A âncora deve ser específica o suficiente para que um revisor possa verificar no PDF.
3. **NÃO deve inventar regra nova sem âncora explícita.** Regras de negócio do Core vêm dos blocos L03–L17 e do A00/A01.
4. **NÃO deve resumir de forma que enfraqueça governança.** Se o resumo for necessário, ele deve preservar a integridade da regra original.

---

## 6. Checklist obrigatório de toda PR de execução do Core

Toda PR subordinada ao contrato do Core Mecânico 2 deve incluir, obrigatoriamente:

```
--- CHECKLIST DE EXECUÇÃO DO CORE ---
[ ] Âncora contratual declarada (seção 1 deste documento)
[ ] CLAUSE_MAP consultado — entrada(s) referenciada(s): <lista>
[ ] PDF-fonte consultado — bloco(s): <lista>
[ ] Regra de negócio ancorada ao bloco legado — referência: <lista>
[ ] Nenhuma regra inventada fora do legado
[ ] Nenhum phrasing / surface / resposta ao cliente no Core
[ ] Nenhuma expansão de escopo fora do contrato ativo
[ ] Smoke test / evidência apresentada
[ ] ESTADO HERDADO e ESTADO ENTREGUE declarados
[ ] Status e handoff atualizados
```

PR sem checklist completo = **não conforme**.

---

## 7. Regra de atualização do CLAUSE_MAP

Ao concluir uma PR de execução do Core:

1. Atualizar o `CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md` para refletir quais cláusulas foram executadas.
2. Não remover entradas do mapa — apenas adicionar status de execução.
3. Se a PR revelar novas cláusulas do PDF-fonte que devem ser adicionadas ao mapa, fazer a adição com âncora explícita ao PDF.

---

## 8. Regra de vínculo contratual (complementar ao CONTRACT_EXECUTION_PROTOCOL)

Além do bloco de vínculo contratual exigido pelo `CONTRACT_EXECUTION_PROTOCOL` (seção 5), toda PR do Core deve declarar:

```
--- VÍNCULO CONTRATUAL (CORE) ---
Contrato ativo lido:                    schema/contracts/active/CONTRATO_CORE_MECANICO_2.md
CLAUSE_MAP consultado:                  schema/contracts/active/CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md
EXECUTION_RULES lido:                   schema/contracts/active/CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md
Entrada(s) do CLAUSE_MAP executada(s):  <lista de IDs — ex: A00-06, L-01>
Bloco(s) legado(s) consultado(s):       <lista — ex: L03, L04>
PDF-fonte consultado:                   sim | não
```

---

## 9. Resumo das condições de parada

| Condição | Ação |
|----------|------|
| Falta de âncora contratual explícita | PARAR — não executar |
| Bloco legado não consultado no PDF | PARAR — ler PDF antes de implementar |
| Dúvida interpretativa sobre regra | PARAR — consultar PDF; se persistir, reportar |
| Lacuna na regra do legado | PARAR — não inventar regra |
| Conflito entre fontes | PARAR — aplicar precedência; se persistir, reportar |
| Expansão de escopo fora do contrato | PARAR — não implementar |
| Phrasing ou surface no Core | PARAR — viola soberania conversacional |
| Frente diferente misturada na PR | PARAR — uma frente por vez |
| Contrato ativo alterado silenciosamente | PARAR — revisão formal obrigatória |

**Regra de parada não é falha — é conformidade.**

---

## 10. Documentos relacionados

- `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` — contrato ativo do Core
- `schema/contracts/active/CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md` — mapa de cláusulas
- `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` — protocolo geral de execução contratual
- `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` — protocolo de encerramento
- `schema/CONTRACT_SOURCE_MAP.md` — mapa de fontes e ponte documental
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — PDF-fonte bruto canônico
- `schema/legacy/INDEX_LEGADO_MESTRE.md` — índice operacional do legado
