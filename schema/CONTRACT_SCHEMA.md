# CONTRACT_SCHEMA — Formato Obrigatório de Contrato Novo

## Finalidade

Este documento define o formato canônico obrigatório para qualquer contrato de frente da ENOVA 2.
Nenhum contrato novo pode ser aberto sem seguir esta estrutura.
O schema existe para garantir rastreabilidade, completude e coerência com a governança do A00, A01 e A02.

## Precedência

Este schema está subordinado ao A00, A01 e A02.
Nenhum contrato pode contradizer a precedência documental oficial:
**A00 > A01 > A02 > contrato específico da frente ativa > documentos legados aplicáveis**

---

## Estrutura obrigatória de contrato

Todo contrato de frente deve conter, na ordem abaixo, as seguintes seções:

### 1. Título

Nome canônico do contrato. Deve seguir o padrão:
`CONTRATO — <Nome da Frente> — ENOVA 2`

### 2. Objetivo

Descrição clara e objetiva do que este contrato autoriza. Sem ambiguidade.
Deve responder: "O que esta frente entrega quando concluída?"

### 3. Escopo

Lista exaustiva do que está incluído neste contrato.
Cada item deve ser verificável.

### 4. Fora de escopo

Lista explícita do que NÃO está incluído.
Serve como proteção contra drift de objetivo.

### 5. Dependências

Quais frentes, contratos, fases ou entregas anteriores são pré-requisito para este contrato.
Referências diretas ao A01 (fase, prioridade, gate).

### 6. Entradas

Quais artefatos, dados, documentos ou estados devem existir antes do início da execução.

### 7. Saídas

Quais artefatos, arquivos, estados ou evidências devem existir ao final da execução.

### 8. Critérios de aceite

Condições objetivas e verificáveis que determinam se o contrato foi cumprido.
Cada critério deve ser testável ou inspecionável.

### 9. Provas obrigatórias

Quais evidências (smoke tests, diffs, logs, capturas, inspeções) devem ser apresentadas para validar o aceite.

### 10. Bloqueios

Condições que impedem o início ou a continuidade da execução.
Inclui gates do A01, ausência de dependências ou ambiguidades não resolvidas.

### 11. Próximo passo autorizado

Qual é o passo imediato autorizado após a conclusão deste contrato.
Deve ser coerente com o A01.

### 12. Relação com o A01

Indicação explícita de qual fase, prioridade e item do A01 este contrato executa.

### 13. Relação com legados aplicáveis

Indicação explícita de quais documentos legados (L01–L19) são fonte de verdade de negócio para este contrato.
Deve seguir a amarração definida no A02 (seções 4 e 5).

---

## Regras de uso

1. **Nenhuma frente inicia sem contrato aprovado** — Gate 1 do A01.
2. **O contrato não pode crescer de escopo durante a execução** sem atualização explícita e aprovada.
3. **Conflitos entre contrato e legado** seguem a regra de precedência: o contrato novo só vence se não violar A00, A01 e lógica de negócio consolidada no A02.
4. **O contrato deve ser atualizado ao final da execução** para refletir o estado real da frente, incluindo pendências, bloqueios e próximo passo autorizado.
5. **Contratos encerrados devem seguir o protocolo formal de closeout** — ver `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`. Encerramento implícito é proibido.
6. **Um contrato ativo por frente** — cada frente pode ter no máximo 1 contrato ativo por vez. Versões anteriores vão para `schema/contracts/archive/`.
7. **Contrato ativo não pode ser alterado por PR de execução** — qualquer alteração de objetivo, escopo, critério de aceite ou condição de encerramento exige revisão contratual formal (ver `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` seção 7).
8. **O contrato deve residir em `schema/contracts/active/`** quando ativo e ser movido para `schema/contracts/archive/` quando encerrado.
9. **O índice `schema/contracts/_INDEX.md`** deve sempre refletir o estado real dos contratos.

---

## Exemplo de cabeçalho mínimo

```markdown
# CONTRATO — <Nome da Frente> — ENOVA 2

| Campo                     | Valor                                      |
|---------------------------|---------------------------------------------|
| Frente                    | <nome>                                      |
| Fase do A01               | <fase>                                      |
| Prioridade do A01         | <prioridade>                                |
| Dependências              | <lista>                                     |
| Legados aplicáveis        | <L0x, L0y, ...>                             |
| Status                    | Aberto / Em execução / Concluído / Bloqueado|
| Última atualização        | <data ISO 8601>                             |
```
