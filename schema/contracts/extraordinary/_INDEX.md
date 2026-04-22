# EXTRAORDINARY CONTRACTS — Índice de Contratos Extraordinários — ENOVA 2

## Finalidade

Este índice registra contratos extraordinários da ENOVA 2: contratos abertos **fora do macro de 8 frentes formais**, para módulos, camadas ou iniciativas que nascem após o encerramento do macro ou que não pertencem à sequência linear formal de frentes.

**Contratos extraordinários existem porque:**
- O macro formal da ENOVA 2 encerrou na Frente 8 (Rollout).
- Módulos estratégicos como Memória, Base Normativa, Regras Comerciais e Aprendizado Operacional não foram contratados dentro do macro, mas são necessários para a operação completa do sistema.
- Esses módulos precisam de governança contratual forte, com status/handoff vivos, loop obrigatório e ordem oficial de PRs — fora da cadeia sequencial das 8 frentes.

## Precedência

**A00 > A01 > A00-ADENDO-01 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato extraordinário ativo > documentos legados aplicáveis**

Este índice está subordinado ao A00, A01, ao A00-ADENDO-01, ao A02 e ao `CONTRACT_EXECUTION_PROTOCOL.md`.

---

## Contratos extraordinários ativos

| # | Módulo | Contrato ativo | Status | Data de abertura | PR que abriu | Última PR executou | Próximo passo autorizado |
|---|--------|----------------|--------|-----------------|-------------|-------------------|--------------------------|
| E1 | Memória, Base Normativa, Regras Comerciais e Aprendizado Operacional | `schema/contracts/extraordinary/active/CONTRATO_EXTRAORDINARIO_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL.md` | aberto | 2026-04-22 | PR1 — abertura do contrato extraordinário | PR1 — abertura do contrato extraordinário | PR2 — contrato técnico do módulo |

---

## Contratos extraordinários arquivados

*(nenhum ainda)*

---

## Estrutura de diretórios

```text
schema/contracts/extraordinary/
├── _INDEX.md                          ← este arquivo (índice canônico de extraordinários)
├── active/                            ← contratos extraordinários ativos
│   └── CONTRATO_EXTRAORDINARIO_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL.md
└── archive/                           ← contratos extraordinários encerrados e arquivados
```

---

## Regras

1. **Um contrato ativo por módulo extraordinário.** Nunca dois contratos ativos para o mesmo módulo.
2. **Contratos anteriores vão para `archive/`.** Nenhum contrato antigo permanece em `active/`.
3. **Este índice é atualizado obrigatoriamente** sempre que um contrato extraordinário é aberto, encerrado ou arquivado.
4. **Toda PR de execução deve ler este índice** antes de executar — conforme `CODEX_WORKFLOW.md`.
5. **Contrato extraordinário não pertence ao macro de 8 frentes.** Ele não é registrado como Frente 9, 10, etc. na cadeia sequencial — ele é um módulo extraordinário explicitamente identificado.
6. **Contrato extraordinário segue os mesmos protocolos formais** do macro: CONTRACT_EXECUTION_PROTOCOL, CONTRACT_CLOSEOUT_PROTOCOL, STATUS_SCHEMA, HANDOFF_SCHEMA.

---

## Loop obrigatório antes de qualquer tarefa de contrato extraordinário

Antes de qualquer execução em contrato extraordinário, obrigatoriamente ler:

1. `schema/contracts/extraordinary/_INDEX.md` — este arquivo
2. Contrato extraordinário ativo correspondente
3. Status vivo do contrato extraordinário
4. Handoff vivo do contrato extraordinário
5. Ordem oficial das PRs do contrato extraordinário
6. Limites do módulo (escopo e fora de escopo)
7. Regras de evidência do módulo
8. Regras de consulta normativa do módulo (Camada A)
9. Regras comerciais operacionais do módulo (Camada B)
10. Regras de memória manual do módulo (Camada D)

---

## Última sincronização

- 2026-04-22 — Contrato extraordinário E1 aberto formalmente: Módulo de Memória, Base Normativa, Regras Comerciais e Aprendizado Operacional da ENOVA 2. Próximo passo autorizado: PR2 — contrato técnico do módulo.
