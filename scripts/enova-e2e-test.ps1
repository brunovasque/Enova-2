# enova-e2e-test.ps1 - Teste E2E real do funil Enova 2
# Uso: .\scripts\enova-e2e-test.ps1
# Requer: SUPABASE_URL, SUPABASE_SERVICE_KEY no ambiente

param(
  [string]$WorkerUrl = "https://nv-enova-2.brunovasque.workers.dev/__meta__/webhook",
  [string]$WaId_C1 = "554185260001",
  [string]$WaId_C2 = "554185260002",
  [string]$PhoneNumberId = "766000000780",
  [int]$TurnDelay = 3
)

$SupabaseUrl = $env:SUPABASE_URL
$SupabaseKey = $env:SUPABASE_SERVICE_KEY

if (-not $SupabaseUrl) {
  Write-Host "[ERRO] SUPABASE_URL nao definido. Exporte a variavel antes de rodar o script." -ForegroundColor Red
  exit 1
}
if (-not $SupabaseKey) {
  Write-Host "[ERRO] SUPABASE_SERVICE_KEY nao definido. Exporte a variavel antes de rodar o script." -ForegroundColor Red
  exit 1
}

function Reset-LeadContext {
  param([string]$WaId)
  $headers = @{
    "apikey" = $SupabaseKey
    "Authorization" = "Bearer $SupabaseKey"
    "Content-Type" = "application/json"
    "Prefer" = "resolution=merge-duplicates"
  }
  $body = @{ wa_id = $WaId; last_context = $null; fase_conversa = "inicio" } | ConvertTo-Json -Compress
  $url = "$SupabaseUrl/rest/v1/enova_state"
  Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body | Out-Null
  Write-Host "  [RESET] lead $WaId resetado (upsert)"
}

function Send-Turn {
  param([string]$WaId, [string]$PhoneNumberId, [string]$Message, [string]$WorkerUrl)

  $msgId = "wam_test_$(Get-Date -Format 'yyyyMMddHHmmssfff')"
  $ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

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

  $headers = @{
    "x-enova-test-bypass" = "true"
  }

  try {
    $response = Invoke-RestMethod -Uri $WorkerUrl -Method Post `
      -ContentType "application/json" -Headers $headers -Body $payload -TimeoutSec 15
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
    Write-Host "  [FAIL] $TurnDesc - $Key ausente (esperado: $Expected)" -ForegroundColor Red
    return $false
  }
  if ("$actual" -ne "$Expected") {
    Write-Host "  [FAIL] $TurnDesc - $Key='$actual' (esperado: '$Expected')" -ForegroundColor Red
    return $false
  }
  Write-Host "  [PASS] $TurnDesc - $Key='$actual'" -ForegroundColor Green
  return $true
}

# ===========================================
# CENARIO 1 - Solo CLT caminho dourado
# ===========================================
Write-Host "`n==========================================="
Write-Host "CENARIO 1 - Brasileiro solteiro solo CLT"
Write-Host "==========================================="

Reset-LeadContext -WaId $WaId_C1
Start-Sleep -Seconds 3
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
  Send-Turn -WaId $WaId_C1 -PhoneNumberId $PhoneNumberId -Message $t.msg -WorkerUrl $WorkerUrl | Out-Null
  Start-Sleep -Seconds $t.delay
}

Start-Sleep -Seconds 2
$facts = Get-LeadFacts -WaId $WaId_C1

Write-Host "`n  Validando facts finais:"
if (Test-Fact $facts "nome_completo" "Bruno Vasques" "C1") { $passes++ } else { $fails++ }
if (Test-Fact $facts "nacionalidade" "brasileiro" "C1") { $passes++ } else { $fails++ }
if (Test-Fact $facts "estado_civil" "solteiro" "C1") { $passes++ } else { $fails++ }
if (Test-Fact $facts "processo" "solo" "C1") { $passes++ } else { $fails++ }
if (Test-Fact $facts "regime_trabalho" "clt" "C1") { $passes++ } else { $fails++ }

# ===========================================
# CENARIO 2 - Casado civil - processo conjunto
# ===========================================
Write-Host "`n==========================================="
Write-Host "CENARIO 2 - Casado civil - processo conjunto"
Write-Host "==========================================="

Reset-LeadContext -WaId $WaId_C2
Start-Sleep -Seconds 3

$turnos2 = @(
  @{ msg = "Oi" },
  @{ msg = "Sim" },
  @{ msg = "Carlos Silva" },
  @{ msg = "Brasileiro" },
  @{ msg = "Casado no civil" }
)

foreach ($t in $turnos2) {
  Write-Host "`n  -> Enviando: '$($t.msg)'"
  Send-Turn -WaId $WaId_C2 -PhoneNumberId $PhoneNumberId -Message $t.msg -WorkerUrl $WorkerUrl | Out-Null
  Start-Sleep -Seconds $TurnDelay
}

Start-Sleep -Seconds 2
$facts2 = Get-LeadFacts -WaId $WaId_C2

Write-Host "`n  Validando facts finais:"
if (Test-Fact $facts2 "estado_civil" "casado_civil" "C2") { $passes++ } else { $fails++ }

# ===========================================
# CENARIO 3 - Composicao familiar simples (mae solteira)
# ===========================================
# Testa: composition_actor + estado_civil_p3 (sem P3 cascading)
$WaId_C3 = "554185260003"
Write-Host "`n==========================================="
Write-Host "CENARIO 3 - Composicao com mae solteira"
Write-Host "==========================================="
Reset-LeadContext -WaId $WaId_C3
Start-Sleep -Seconds 3

$turnos3 = @(
  @{ msg = "Oi" },
  @{ msg = "Sim" },
  @{ msg = "Marta Costa" },
  @{ msg = "Brasileiro" },
  @{ msg = "Solteiro" },
  @{ msg = "Com minha mae" },
  @{ msg = "Solteira" },
  @{ msg = "CLT" },
  @{ msg = "3500" }
)

foreach ($t in $turnos3) {
  Write-Host "`n  -> Enviando: '$($t.msg)'"
  Send-Turn -WaId $WaId_C3 -PhoneNumberId $PhoneNumberId -Message $t.msg -WorkerUrl $WorkerUrl | Out-Null
  Start-Sleep -Seconds $TurnDelay
}

Start-Sleep -Seconds 2
$facts3 = Get-LeadFacts -WaId $WaId_C3
Write-Host "`n  Validando facts finais:"
if (Test-Fact $facts3 "estado_civil" "solteiro" "C3") { $passes++ } else { $fails++ }
if (Test-Fact $facts3 "processo" "composicao_familiar" "C3") { $passes++ } else { $fails++ }
if (Test-Fact $facts3 "composition_actor" "mae" "C3") { $passes++ } else { $fails++ }
if (Test-Fact $facts3 "estado_civil_p3" "solteiro" "C3") { $passes++ } else { $fails++ }

# ===========================================
# CENARIO 4 - Composicao com mae CASADA CIVIL (P3 cascading)
# ===========================================
# Testa: P3 cascading - conjuge da mae entra obrigatoriamente
$WaId_C4 = "554185260004"
Write-Host "`n==========================================="
Write-Host "CENARIO 4 - Composicao com mae casada civil (P3)"
Write-Host "==========================================="
Reset-LeadContext -WaId $WaId_C4
Start-Sleep -Seconds 3

$turnos4 = @(
  @{ msg = "Oi" },
  @{ msg = "Sim" },
  @{ msg = "Pedro Lima" },
  @{ msg = "Brasileiro" },
  @{ msg = "Solteiro" },
  @{ msg = "Com minha mae" },
  @{ msg = "Casada no civil" }
)

foreach ($t in $turnos4) {
  Write-Host "`n  -> Enviando: '$($t.msg)'"
  Send-Turn -WaId $WaId_C4 -PhoneNumberId $PhoneNumberId -Message $t.msg -WorkerUrl $WorkerUrl | Out-Null
  Start-Sleep -Seconds $TurnDelay
}

Start-Sleep -Seconds 2
$facts4 = Get-LeadFacts -WaId $WaId_C4
Write-Host "`n  Validando facts finais:"
if (Test-Fact $facts4 "composition_actor" "mae" "C4") { $passes++ } else { $fails++ }
if (Test-Fact $facts4 "estado_civil_p3" "casado_civil" "C4") { $passes++ } else { $fails++ }

# ===========================================
# CENARIO 5 - Estrangeiro com RNM indeterminado
# ===========================================
$WaId_C5 = "554185260005"
Write-Host "`n==========================================="
Write-Host "CENARIO 5 - Estrangeiro com RNM indeterminado"
Write-Host "==========================================="
Reset-LeadContext -WaId $WaId_C5
Start-Sleep -Seconds 3

$turnos5 = @(
  @{ msg = "Oi" },
  @{ msg = "Sim" },
  @{ msg = "Jean Pierre" },
  @{ msg = "Estrangeiro" },
  @{ msg = "Sim, tenho RNM por prazo indeterminado" }
)

foreach ($t in $turnos5) {
  Write-Host "`n  -> Enviando: '$($t.msg)'"
  Send-Turn -WaId $WaId_C5 -PhoneNumberId $PhoneNumberId -Message $t.msg -WorkerUrl $WorkerUrl | Out-Null
  Start-Sleep -Seconds $TurnDelay
}

Start-Sleep -Seconds 2
$facts5 = Get-LeadFacts -WaId $WaId_C5
Write-Host "`n  Validando facts finais:"
if (Test-Fact $facts5 "nacionalidade" "estrangeiro" "C5") { $passes++ } else { $fails++ }
if (Test-Fact $facts5 "rnm_valido" "True" "C5") { $passes++ } else { $fails++ }

# ===========================================
# CENARIO 6 - Estrangeiro sem RNM, sem familiar brasileiro
# ===========================================
$WaId_C6 = "554185260006"
Write-Host "`n==========================================="
Write-Host "CENARIO 6 - Estrangeiro sem RNM (encerramento porta aberta)"
Write-Host "==========================================="
Reset-LeadContext -WaId $WaId_C6
Start-Sleep -Seconds 3

$turnos6 = @(
  @{ msg = "Oi" },
  @{ msg = "Sim" },
  @{ msg = "Luigi Rossi" },
  @{ msg = "Estrangeiro" },
  @{ msg = "Nao tenho RNM" },
  @{ msg = "Nao tenho familiar brasileiro" }
)

foreach ($t in $turnos6) {
  Write-Host "`n  -> Enviando: '$($t.msg)'"
  Send-Turn -WaId $WaId_C6 -PhoneNumberId $PhoneNumberId -Message $t.msg -WorkerUrl $WorkerUrl | Out-Null
  Start-Sleep -Seconds $TurnDelay
}

Start-Sleep -Seconds 2
$facts6 = Get-LeadFacts -WaId $WaId_C6
Write-Host "`n  Validando facts finais:"
if (Test-Fact $facts6 "nacionalidade" "estrangeiro" "C6") { $passes++ } else { $fails++ }
if (Test-Fact $facts6 "rnm_valido" "False" "C6") { $passes++ } else { $fails++ }

# ===========================================
# CENARIO 7 - Autonomo com IR
# ===========================================
$WaId_C7 = "554185260007"
Write-Host "`n==========================================="
Write-Host "CENARIO 7 - Autonomo com IR"
Write-Host "==========================================="
Reset-LeadContext -WaId $WaId_C7
Start-Sleep -Seconds 3

$turnos7 = @(
  @{ msg = "Oi" },
  @{ msg = "Sim" },
  @{ msg = "Ana Silva" },
  @{ msg = "Brasileiro" },
  @{ msg = "Solteira" },
  @{ msg = "Sozinha" },
  @{ msg = "Autonomo" },
  @{ msg = "5000" },
  @{ msg = "Sim, declaro IR" }
)

foreach ($t in $turnos7) {
  Write-Host "`n  -> Enviando: '$($t.msg)'"
  Send-Turn -WaId $WaId_C7 -PhoneNumberId $PhoneNumberId -Message $t.msg -WorkerUrl $WorkerUrl | Out-Null
  Start-Sleep -Seconds $TurnDelay
}

Start-Sleep -Seconds 2
$facts7 = Get-LeadFacts -WaId $WaId_C7
Write-Host "`n  Validando facts finais:"
if (Test-Fact $facts7 "regime_trabalho" "autonomo" "C7") { $passes++ } else { $fails++ }
if (Test-Fact $facts7 "autonomo_tem_ir" "True" "C7") { $passes++ } else { $fails++ }

# ===========================================
# CENARIO 8 - Renda baixa solo (<= 3k)
# ===========================================
$WaId_C8 = "554185260008"
Write-Host "`n==========================================="
Write-Host "CENARIO 8 - Renda baixa solo"
Write-Host "==========================================="
Reset-LeadContext -WaId $WaId_C8
Start-Sleep -Seconds 3

$turnos8 = @(
  @{ msg = "Oi" },
  @{ msg = "Sim" },
  @{ msg = "Joao Souza" },
  @{ msg = "Brasileiro" },
  @{ msg = "Solteiro" },
  @{ msg = "Sozinho" },
  @{ msg = "Informal" },
  @{ msg = "2500" }
)

foreach ($t in $turnos8) {
  Write-Host "`n  -> Enviando: '$($t.msg)'"
  Send-Turn -WaId $WaId_C8 -PhoneNumberId $PhoneNumberId -Message $t.msg -WorkerUrl $WorkerUrl | Out-Null
  Start-Sleep -Seconds $TurnDelay
}

Start-Sleep -Seconds 2
$facts8 = Get-LeadFacts -WaId $WaId_C8
Write-Host "`n  Validando facts finais:"
if (Test-Fact $facts8 "regime_trabalho" "informal" "C8") { $passes++ } else { $fails++ }
if (Test-Fact $facts8 "renda_principal" "2500" "C8") { $passes++ } else { $fails++ }

# ===========================================
# RESULTADO FINAL
# ===========================================
Write-Host "`n==========================================="
Write-Host "RESULTADO: $passes PASS / $fails FAIL" -ForegroundColor $(if ($fails -eq 0) { "Green" } else { "Red" })
Write-Host "===========================================`n"

exit $(if ($fails -eq 0) { 0 } else { 1 })
