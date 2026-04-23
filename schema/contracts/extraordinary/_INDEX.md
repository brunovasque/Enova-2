# EXTRAORDINARY CONTRACTS — Indice de Contratos Extraordinarios — ENOVA 2

## Rebase canonico

O macro formal da ENOVA 2 nao esta encerrado. O tronco soberano passa a ser:

`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

A implantacao real segue a ordem T0-T7 e gates G0-G7. Contratos extraordinarios encerrados antes
deste rebase, incluindo E1, permanecem como recortes tecnicos/locais aproveitaveis. Eles nao
substituem T0/G0 e nao autorizam tratar o macro como concluido.

## Finalidade

Este indice registra contratos extraordinarios: modulos, camadas ou iniciativas fora do recorte ativo da
fase macro, sempre com autorizacao explicita e governanca propria.

## Precedencia

`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` > A00 > A01 > A00-ADENDO-01 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato extraordinario ativo > documentos legados aplicaveis

---

## Contratos extraordinarios ativos

| # | Modulo | Contrato ativo | Status | Proximo passo autorizado |
|---|--------|----------------|--------|--------------------------|
| *(nenhum)* | - | - | - | - |

---

## Contratos extraordinarios arquivados

| # | Modulo | Contrato arquivado | Status | Data de encerramento | Observacao apos rebase |
|---|--------|--------------------|--------|----------------------|------------------------|
| E1 | Memoria, Base Normativa, Regras Comerciais e Aprendizado Operacional | `schema/contracts/extraordinary/archive/CONTRATO_EXTRAORDINARIO_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL_2026-04-22.md` | encerrado e arquivado | 2026-04-22 | Recorte tecnico/local aproveitavel; nao prova ingestao real, motor comercial real ou aprendizado grande |

---

## Estrutura de diretorios

```text
schema/contracts/extraordinary/
├── _INDEX.md
├── active/
├── closeout/
│   └── E1_CLOSEOUT_READINESS.md
├── technical/
│   └── E1_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_APRENDIZADO_TECHNICAL_CONTRACT.md
└── archive/
    └── CONTRATO_EXTRAORDINARIO_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL_2026-04-22.md
```

---

## Regras

1. Contrato extraordinario nao cria nova fase macro.
2. Contrato extraordinario nao autoriza pular T0-T7.
3. Contrato extraordinario ativo exige status, handoff, contrato e proximo passo explicitos.
4. Contrato extraordinario arquivado permanece como historico tecnico ate ser reaproveitado por contrato/fase futura.
5. Toda tarefa futura continua obrigada a ler primeiro `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.

---

## Ultima sincronizacao

- 2026-04-22 — Rebase canonico aplicado. E1 preservado como historico tecnico/local. Nenhum contrato extraordinario ativo.
