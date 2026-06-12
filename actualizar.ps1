# Script de Sincronización de Capturas (PowerShell Nativo)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition

$capturasPath = Join-Path $PSScriptRoot "Capturas"
$dataPath = Join-Path $PSScriptRoot "data.js"

Write-Host "Buscando capturas en: $capturasPath"
Write-Host "Archivo de datos: $dataPath"

# 1. Leer archivos de la carpeta Capturas
if (-not (Test-Path $capturasPath)) {
    Write-Error "La carpeta 'Capturas' no existe en $capturasPath"
    Exit 1
}

$validExtensions = @(".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp4", ".mov")
$activeFiles = @{}

$files = Get-ChildItem -Path $capturasPath -File
foreach ($file in $files) {
    if ($validExtensions -contains $file.Extension.ToLower()) {
        $baseName = $file.BaseName
        $activeFiles[$baseName.ToLower()] = @{
            OriginalName = $baseName
            Path = "Capturas/$($file.Name)"
        }
    }
}

Write-Host "Usuarios activos encontrados en la carpeta:" ($activeFiles.Keys -join ", ")

# 2. Leer y parsear data.js
if (-not (Test-Path $dataPath)) {
    Write-Error "El archivo $dataPath no existe"
    Exit 1
}

$dataContent = [System.IO.File]::ReadAllText($dataPath, [System.Text.Encoding]::UTF8)

# Extraer el contenido del array (entre el primer '[' y el último ']')
$startIdx = $dataContent.IndexOf('[')
$endIdx = $dataContent.LastIndexOf(']')

if ($startIdx -eq -1 -or $endIdx -eq -1 -or $endIdx -le $startIdx) {
    Write-Error "No se pudo encontrar el array de usuarios en data.js"
    Exit 1
}

$headerPart = $dataContent.Substring(0, $startIdx)
$arrayStr = $dataContent.Substring($startIdx, $endIdx - $startIdx + 1)
$footerPart = $dataContent.Substring($endIdx + 1)

# Convertir el array literal de JS a un formato JSON válido para PowerShell
$jsonStr = $arrayStr
$jsonStr = $jsonStr.Replace("nombre:", '"nombre":')
$jsonStr = $jsonStr.Replace("estado:", '"estado":')
$jsonStr = $jsonStr.Replace("url_captura:", '"url_captura":')

# Quitar comas sobrantes antes de cerrar llaves/corchetes
$jsonStr = $jsonStr -replace ',\s*([\]}])', '$1'

try {
    # Convertir a objetos de PowerShell
    $usuarios = ConvertFrom-Json $jsonStr
    if ($usuarios -eq $null) {
        $usuarios = @()
    }
} catch {
    Write-Error "Error al analizar el array en formato JSON: $_"
    Exit 1
}

# 3. Actualizar usuarios existentes y registrar cuáles se han emparejado
$matchedKeys = @()
foreach ($user in $usuarios) {
    $usernameLower = $user.nombre.ToLower()
    if ($activeFiles.ContainsKey($usernameLower)) {
        $user.estado = "activo"
        $user.url_captura = $activeFiles[$usernameLower].Path
        $matchedKeys += $usernameLower
    } elseif ($user.url_captura -eq "" -and $user.estado -eq "activo") {
        # Mantener activo si no tiene captura física pero ya está marcado como activo en data.js
        $matchedKeys += $usernameLower
    } else {
        $user.estado = "suspendido"
        $user.url_captura = ""
    }
}

# 4. Añadir nuevos usuarios que tengan captura pero no estén en la base de datos
$newUsersCount = 0
foreach ($key in $activeFiles.Keys) {
    if ($matchedKeys -notcontains $key) {
        $newUser = [PSCustomObject]@{
            nombre = $activeFiles[$key].OriginalName
            estado = "activo"
            url_captura = $activeFiles[$key].Path
        }
        $usuarios += $newUser
        $newUsersCount++
    }
}

Write-Host "Sincronización completada. Se añadieron $newUsersCount usuarios nuevos."

# 5. Formatear y reescribir data.js manteniendo la estructura de JavaScript
$formattedUsers = @()
foreach ($u in $usuarios) {
    $escapedName = $u.nombre -replace '"', '\"'
    $userStr = "  {`n    nombre: `"$escapedName`",`n    estado: `"$($u.estado)`",`n    url_captura: `"$($u.url_captura)`"`n  }"
    $formattedUsers += $userStr
}

$newArrayStr = "[" + "`n" + ($formattedUsers -join ",`n") + "`n]"
$finalContent = $headerPart + $newArrayStr + $footerPart

[System.IO.File]::WriteAllText($dataPath, $finalContent, [System.Text.Encoding]::UTF8)
Write-Host "data.js se ha guardado correctamente."
