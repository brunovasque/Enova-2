# 20 — F2: Extractor atual — qualification_civil / estado_civil / processo / composition / dependents

**Data:** 2026-05-06
**Comando:** `grep -n "qualification_civil\|estado_civil\|processo\|composition\|dependente\|dependents" src/core/text-extractor.ts | head -40`

---

## Resultado

```
212:    pendingObjective === 'coletar_estado_civil' ||
213:    pendingObjective === 'avancar_para_qualification_civil' ||
217:      facts['estado_civil'] = 'solteiro';
219:      facts['estado_civil'] = 'casado_civil';
221:      facts['estado_civil'] = 'uniao_estavel';
223:      facts['estado_civil'] = 'divorciado';
225:      facts['estado_civil'] = 'viuvo';
229:  // Confirmação contextual de processo — quando sistema estava aguardando processo (T9.16A)
230:  if (pendingObjective === 'coletar_processo') {
232:      facts['processo'] = 'solo';
236:      facts['processo'] = 'conjunto';
240:  // estado_civil — keywords específicas (apenas quando contextual não resolveu)
241:  if (facts['estado_civil'] === undefined) {
243:      facts['estado_civil'] = 'solteiro';
248:      facts['estado_civil'] = 'casado_civil';
253:      facts['estado_civil'] = 'uniao_estavel';
255:      facts['estado_civil'] = 'divorciado';
257:      facts['estado_civil'] = 'viuvo';
261:  // processo — keywords específicas (apenas quando contextual não resolveu)
262:  if (facts['processo'] === undefined) {
264:      facts['processo'] = 'solo';
269:      facts['processo'] = 'conjunto';
274:      facts['processo'] = 'composicao_familiar';
459:      case 'qualification_civil':
```

---

## Análise

### O que o extractor cobre hoje para `qualification_civil`

**estado_civil** (contextual + keywords):
- Contextual: ativo quando `pendingObjective` é `coletar_estado_civil`, `avancar_para_qualification_civil` ou a string literal de estado civil
- Keywords: `sou solteiro/a`, `casado no civil`, `uniao estavel`, `divorciado/a`, `viuvo/a`
- Valores: `solteiro`, `casado_civil`, `uniao_estavel`, `divorciado`, `viuvo`

**processo** (contextual + keywords):
- Contextual: ativo quando `pendingObjective` é `coletar_processo`
- Keywords: `sozinho/a`, `eu e minha esposa/meu marido`, `com minha mae/familiar`
- Valores: `solo`, `conjunto`, `composicao_familiar`

### O que NÃO está no extractor

- `composition_actor` — zero linhas com esse termo no extractor
- `dependents` / `dependents_count` / `dependents_applicable` — zero linhas
- `p3_required` — zero linhas
- `autonomo_tem_ir` — zero linhas (Meio B não tem extractor de texto, usa facts já existentes)
- `ctps_36` — zero linhas no extractor de texto

### Lacunas identificadas

| Fact | Stage | Extrator existe? |
|---|---|---|
| `estado_civil` | qualification_civil | ✓ (contextual + keywords) |
| `processo` | qualification_civil | ✓ (contextual + keywords) |
| `composition_actor` | qualification_civil | ✗ ausente |
| `p3_required` | qualification_civil | ✗ ausente |
| `dependents_applicable` | qualification_civil | ✗ ausente |
| `dependents_count` | qualification_civil | ✗ ausente |
| `regime_trabalho` | qualification_renda | ✓ (keywords) |
| `renda_principal` | qualification_renda | ✓ (regex numérico) |
| `autonomo_tem_ir` | qualification_renda | ✗ ausente |
| `ctps_36` | qualification_renda | ✗ ausente |
