# DATA_CHANGE_PROTOCOL — Protocolo Obrigatório de Mudanças em Dados Persistidos — ENOVA 2

> **Este protocolo é lei operacional complementar ao CODEX_WORKFLOW.**
> Toda mudança em schema, tabela, coluna, índice, constraint ou relacionamento do **Supabase/Postgres da ENOVA 2** está sujeita a este protocolo.
> Nenhuma PR, tarefa ou entrega pode alterar dados persistidos sem cumprir integralmente as regras aqui definidas.

---

## 1. Finalidade

Este protocolo garante rastreabilidade total, reversibilidade e compatibilidade de qualquer mudança em dados persistidos do **Supabase/Postgres da ENOVA 2**.

Ele se aplica exclusivamente a mudanças de schema e persistência do **Supabase**.  
Outros storages (Cloudflare KV, R2, D1, cache, arquivos locais) **não são alvo deste protocolo**. Se no futuro outros storages relevantes surgirem, poderão ter protocolo próprio — mas **não devem ser misturados aqui**.

---

## 2. Precedência

**A00 > A01 > A02 > DATA_CHANGE_PROTOCOL > contrato específico da frente ativa**

Em caso de conflito, prevalece o nível mais alto da cadeia. Este protocolo está subordinado ao A00, A01 e A02, mas tem precedência sobre qualquer decisão de frente individual quando o assunto é mudança de dado persistido no Supabase.

---

## 3. Tipos canônicos de mudança de dados

Toda mudança de dado persistido deve ser declarada com um dos tipos abaixo:

| Tipo canônico      | Descrição                                                              |
|--------------------|------------------------------------------------------------------------|
| `create_table`     | Criação de nova tabela no Supabase/Postgres                            |
| `alter_table`      | Alteração estrutural de tabela existente (rename, owner, etc.)         |
| `add_column`       | Adição de coluna a tabela existente                                    |
| `alter_column`     | Alteração de tipo, default, nullability ou nome de coluna              |
| `drop_column`      | Remoção de coluna de tabela existente                                  |
| `drop_table`       | Remoção de tabela                                                      |
| `add_index`        | Criação de índice                                                      |
| `drop_index`       | Remoção de índice                                                      |
| `add_constraint`   | Adição de constraint (PK, FK, UNIQUE, CHECK, NOT NULL)                 |
| `drop_constraint`  | Remoção de constraint                                                  |
| `alter_relationship` | Mudança em relacionamento entre tabelas (FK ou referência)           |
| `backfill`         | Preenchimento retroativo de dados em coluna existente                  |
| `migration`        | Script de migração envolvendo múltiplos tipos acima                    |

Se a mudança não se encaixar em nenhum tipo acima, declarar `outro` e descrever em detalhes.

---

## 4. Campos obrigatórios de declaração

### 4.1 Quando NÃO há mudança de dados persistidos

Toda tarefa ou PR deve declarar explicitamente, mesmo sem mudança:

```
Mudanças em dados persistidos (Supabase): nenhuma
```

Esta declaração é **obrigatória** — inclusive em tarefas de governança, diagnóstico, hotfix documental ou qualquer outra classe que não toque em dados.  
Ausência desta declaração = tarefa não conforme.

### 4.2 Quando HÁ mudança de dados persistidos

Se houver qualquer mudança em tabela, coluna, índice, constraint ou relacionamento no Supabase:

```
Mudanças em dados persistidos (Supabase): sim

  Tabela afetada:          <nome_da_tabela>
  Tipo de mudança:         <tipo canônico — ver seção 3>
  Coluna(s) afetada(s):   <lista de colunas ou "N/A" se não se aplica>
  Motivo da mudança:       <justificativa operacional ou de negócio>
  Impacto esperado:        <o que muda no comportamento do sistema>
  Compatibilidade retroativa: <sim | não | parcial — explicar>
  Necessidade de migração: <sim | não — se sim, descrever>
  Necessidade de backfill: <sim | não — se sim, descrever>
  Risco:                   <baixo | médio | alto — justificar>
  Rollback:                <como reverter com segurança>
```

Se mais de uma tabela for afetada, repetir o bloco para cada tabela.

---

## 5. Regra de parada

Se uma tarefa ou PR mexer em dados persistidos do Supabase **e não declarar todos os campos obrigatórios** da seção 4.2:

- **tabela afetada**
- **tipo de mudança**
- **coluna(s) afetada(s)**
- **motivo da mudança**
- **impacto esperado**
- **rollback**

→ **A tarefa é não conforme e deve parar imediatamente.**

Retomar somente após declaração completa e aprovação explícita.

---

## 6. O que atualizar quando houver mudança de dados

Toda mudança de dados persistidos declarada como `sim` obriga as seguintes atualizações:

1. **Handoff da frente** (`schema/handoffs/<FRENTE>_LATEST.md`) — registrar tabelas/colunas afetadas, tipo de mudança, rollback.
2. **Status da frente** (`schema/status/<FRENTE>_STATUS.md`) — se a mudança afeta o estado ou o próximo passo autorizado da frente.
3. **Contrato da frente** — se a mudança altera escopo contratado, atualizar o contrato antes de executar.
4. **PR Template** — preencher todos os campos de dados persistidos.
5. **Este protocolo** — se o tipo de mudança não existia nos tipos canônicos, adicionar e documentar.

---

## 7. O que é proibido

- Executar qualquer `CREATE TABLE`, `ALTER TABLE`, `ADD COLUMN`, `DROP COLUMN`, `CREATE INDEX`, `ADD CONSTRAINT` ou equivalente no Supabase sem declaração prévia e aprovação.
- Referenciar ou criar tabelas/colunas sem amarração ao contrato ativo da frente.
- Executar backfill ou migração sem declarar risco e rollback.
- Misturar mudança de dados do Supabase com mudanças em outros storages neste protocolo.
- Inventar tabelas ou colunas fora do escopo do contrato ativo.
- Executar mudança estrutural em schema do Supabase em tarefa classificada como `diagnostico` ou `governança` documental.

---

## 8. Regra de rollback

Toda mudança em dados persistidos deve declarar o plano de rollback antes da execução.  
O rollback deve ser viável e verificável — não apenas teórico.

**Padrão mínimo de rollback:**
- Para `add_column`: `ALTER TABLE <tabela> DROP COLUMN <coluna>;`
- Para `create_table`: `DROP TABLE <tabela>;`
- Para `add_constraint`: `ALTER TABLE <tabela> DROP CONSTRAINT <nome>;`
- Para `add_index`: `DROP INDEX <nome>;`
- Para `backfill`: reverter com query inversa ou snapshot anterior.
- Para `migration`: manter script de down migration antes de executar o up.

Se o rollback não for viável com segurança, a mudança é **bloqueante** e deve ser aprovada com risco declarado explicitamente.

---

## 9. Regra de compatibilidade retroativa

Toda mudança em dados persistidos deve declarar explicitamente se é:

- **Compatível retroativamente** — nenhum dado existente é afetado, nenhuma API quebra.
- **Parcialmente compatível** — algum dado ou API é afetado, mas com janela de convivência.
- **Incompatível** — quebra dados ou APIs existentes. Exige gate explícito de aprovação antes de executar.

Mudanças incompatíveis sem gate aprovado são **não conformes**.

---

## 10. Regra de mudança fora de contrato

Nenhuma mudança de dados persistidos pode acontecer fora do contrato ativo da frente, exceto em situações de `hotfix` com:

- Declaração explícita de causa raiz
- Aprovação implícita ou explícita do responsável
- Plano de rollback documentado
- Atualização imediata do handoff e do status da frente

**Mudança de schema do Supabase fora de contrato sem essas condições = não conformidade crítica.**

---

## 11. Exemplos de declaração

### Exemplo A — Tarefa sem mudança de dados

```
Mudanças em dados persistidos (Supabase): nenhuma
```

### Exemplo B — Adição de coluna

```
Mudanças em dados persistidos (Supabase): sim

  Tabela afetada:          sessoes
  Tipo de mudança:         add_column
  Coluna(s) afetada(s):   objetivo_id (UUID, NOT NULL, FK → objetivos.id)
  Motivo da mudança:       Vincular sessão ao objetivo ativo do usuário
  Impacto esperado:        Sessões existentes sem objetivo_id ficam inválidas até backfill
  Compatibilidade retroativa: não — requer backfill antes de ativar FK
  Necessidade de migração: sim — ALTER TABLE sessoes ADD COLUMN objetivo_id UUID;
  Necessidade de backfill: sim — popular objetivo_id para registros existentes
  Risco:                   alto — sessões sem objetivo_id falham após migração
  Rollback:                ALTER TABLE sessoes DROP COLUMN objetivo_id;
```

### Exemplo C — Criação de tabela

```
Mudanças em dados persistidos (Supabase): sim

  Tabela afetada:          checkpoints
  Tipo de mudança:         create_table
  Coluna(s) afetada(s):   N/A (criação de tabela completa)
  Motivo da mudança:       Persistir checkpoints de progresso por sessão
  Impacto esperado:        Nenhum impacto em tabelas existentes; nova funcionalidade
  Compatibilidade retroativa: sim — tabela nova, sem referências existentes
  Necessidade de migração: sim — CREATE TABLE checkpoints (...)
  Necessidade de backfill: não
  Risco:                   baixo
  Rollback:                DROP TABLE checkpoints;
```

---

## 12. Integração com o CODEX_WORKFLOW

Este protocolo é complementar ao `schema/CODEX_WORKFLOW.md`.  
Os blocos `ESTADO HERDADO` e `ESTADO ENTREGUE` do CODEX_WORKFLOW **devem incluir** a declaração de dados persistidos conforme este protocolo.

Ver seções 4 e 5 do CODEX_WORKFLOW para os blocos obrigatórios.  
Ver seção 13 do CODEX_WORKFLOW para a referência a este protocolo.

---

## 13. Índice de mudanças de dados desta PR

Esta seção deve ser preenchida em cada PR que declare `Mudanças em dados persistidos (Supabase): sim`.

| PR      | Tabela           | Tipo           | Colunas afetadas | Rollback disponível |
|---------|------------------|----------------|------------------|---------------------|
| *(vazio — preencher por PR)* | | | | |
