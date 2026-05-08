# enova-e2e-test.ps1 — Teste E2E real do funil Enova 2
# Uso: .\scripts\enova-e2e-test.ps1
# Requer: SUPABASE_URL, SUPABASE_SERVICE_KEY no ambiente

param(
  [string]$WorkerUrl = "https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook",
  [string]$WaId = "554185260518",
  [string]$PhoneNumberId = "766000000780",
  [int]$TurnDelay = 3
)

$SupabaseUrl = $env:SUPABASE_URL
$SupabaseKey = $env:SUPABASE_SERVICE_KEY

function Reset-LeadContext {
  param([string]$WaId)
  $headers = @{
    "apikey" = $SupabaseKey
    "Authorization" = "Bearer $SupabaseKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=minimal"
  }
  $body = '{"last_context": null}'
  $url = "$SupabaseUrl/rest/v1/enova_state?wa_id=eq.$WaId"
  Invoke-RestMethod -Uri $url -Method Patch -Headers $headers -Body $body | Out-Null
  Write-Host "  [RESET] last_context limpo para $WaId"
}

function Send-Turn {
  param([string]$WaId, [string]$PhoneNumberId, [string]$Message, [string]$WorkerUrl)

  $msgId = "wam_test_$(Get-Date -Format 'yyyyMMddHHmmssfff')"
  $ts = [int](Get-Date -UFormat %s)

  $payload = @{
    object = "whatsapp_business_account"
    entry = @(@{
      id = "ENTRY_TEST"
      changes = @(@{
        field = "messages"
        value = @{
          messaging_product = "whatsapp"
          metadata = @{
            display_phone_number = "5541000000000"
            phone_number_id = $PhoneNumberId
          }
          contacts = @(@{
            profile = @{ name = "Teste E2E" }
            wa_id = $WaId
          })
          messages = @(@{
            from = $WaId
            id = $msgId
            timestamp = "$ts"
            type = "text"
            text = @{ body = $Message }
          })
        }
      })
    })
  } | ConvertTo-Json -Depth 10

  try {
    $response = Invoke-RestMethod -Uri $WorkerUrl -Method Post `
      -ContentType "application/json" -Body $payload -TimeoutSec 15
    return $true
  } catch {
    Write-Host "  [ERROR] Turno falhou: $_"
    return $false
  }
}

function Get-LeadFacts {
  param([string]$WaId)
  $headers = @{
    "apikey" = $SupabaseKey
    "Authorization" = "Bearer $SupabaseKey"
  }
  $url = "$SupabaseUrl/rest/v1/enova_state?wa_id=eq.$WaId&select=last_context"
  $result = Invoke-RestMethod -Uri $url -Method Get -Headers $headers
  if ($result -and $result.Count -gt 0) {
    $ctx = $result[0].last_context
    if ($ctx -is [string]) { return $ctx | ConvertFrom-Json }
    return $ctx
  }
  return $null
}

function Test-Fact {
  param($Facts, [string]$Key, $Expected, [string]$TurnDesc)
  $actual = $Facts.$Key
  if ($null -eq $actual) {
    Write-Host "  [FAIL] $TurnDesc — $Key ausente (esperado: $Expected)" -ForegroundColor Red
    return $false
  }
  if ("$actual" -ne "$Expected") {
    Write-Host "  [FAIL] $TurnDesc — $Key='$actual' (esperado: '$Expected')" -ForegroundColor Red
    return $false
  }
  Write-Host "  [PASS] $TurnDesc — $Key='$actual'" -ForegroundColor Green
  return $true
}

# ═══════════════════════════════════════════
# CENÁRIO 1 — Solo CLT caminho dourado
# ═══════════════════════════════════════════
Write-Host "`n═══════════════════════════════════════════"
Write-Host "CENÁRIO 1 — Brasileiro solteiro solo CLT"
Write-Host "═══════════════════════════════════════════"

Reset-LeadContext -WaId $WaId
$passes = 0; $fails = 0

$turnos = @(
  @{ msg = "Oi";            delay = $TurnDelay },
  @{ msg = "Sim";           delay = $TurnDelay },
  @{ msg = "Bruno Vasques"; delay = $TurnDelay },
  @{ msg = "Brasileiro";    delay = $TurnDelay },
  @{ msg = "Solteiro";      delay = $TurnDelay },
  @{ msg = "Sozinho";       delay = $TurnDelay },
  @{ msg = "CLT";           delay = $TurnDelay },
  @{ msg = "4500";          delay = $TurnDelay }
)

foreach ($t in $turnos) {
  Write-Host "`n  -> Enviando: '$($t.msg)'"
  Send-Turn -WaId $WaId -PhoneNumberId $PhoneNumberId -Message $t.msg -WorkerUrl $WorkerUrl | Out-Null
  Start-Sleep -Seconds $t.delay
}

Start-Sleep -Seconds 2
$facts = Get-LeadFacts -WaId $WaId

Write-Host "`n  Validando facts finais:"
if (Test-Fact $facts "nome_completo" "Bruno Vasques" "C1") { $passes++ } else { $fails++ }
if (Test-Fact $facts "nacionalidade" "brasileiro" "C1") { $passes++ } else { $fails++ }
if (Test-Fact $facts "estado_civil" "solteiro" "C1") { $passes++ } else { $fails++ }
if (Test-Fact $facts "processo" "solo" "C1") { $passes++ } else { $fails++ }
if (Test-Fact $facts "regime_trabalho" "clt" "C1") { $passes++ } else { $fails++ }

# ═══════════════════════════════════════════
# CENÁRIO 2 — Casado civil força conjunto
# ═══════════════════════════════════════════
Write-Host "`n═══════════════════════════════════════════"
Write-Host "CENÁRIO 2 — Casado civil — processo conjunto"
Write-Host "═══════════════════════════════════════════"

Reset-LeadContext -WaId $WaId
Start-Sleep -Seconds 2

$turnos2 = @(
  @{ msg = "Oi" },
  @{ msg = "Sim" },
  @{ msg = "Carlos Silva" },
  @{ msg = "Brasileiro" },
  @{ msg = "Casado no civil" }
)

foreach ($t in $turnos2) {
  Write-Host "`n  -> Enviando: '$($t.msg)'"
  Send-Turn -WaId $WaId -PhoneNumberId $PhoneNumberId -Message $t.msg -WorkerUrl $WorkerUrl | Out-Null
  Start-Sleep -Seconds $TurnDelay
}

Start-Sleep -Seconds 2
$facts2 = Get-LeadFacts -WaId $WaId

Write-Host "`n  Validando facts finais:"
if (Test-Fact $facts2 "estado_civil" "casado_civil" "C2") { $passes++ } else { $fails++ }

# ═══════════════════════════════════════════
# RESULTADO FINAL
# ═══════════════════════════════════════════
Write-Host "`n═══════════════════════════════════════════"
Write-Host "RESULTADO: $passes PASS / $fails FAIL" -ForegroundColor $(if ($fails -eq 0) { "Green" } else { "Red" })
Write-Host "═══════════════════════════════════════════`n"

exit $(if ($fails -eq 0) { 0 } else { 1 })
