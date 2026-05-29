$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$androidDir = Join-Path $root "android"
$appDir = Join-Path $androidDir "app"
$keystoreDir = Join-Path $appDir "keystores"
$keystorePath = Join-Path $keystoreDir "comodo-release.keystore"
$propsPath = Join-Path $appDir "keystore.properties"

if (-not (Test-Path $keystoreDir)) {
  New-Item -ItemType Directory -Path $keystoreDir | Out-Null
}

if (Test-Path $keystorePath) {
  Write-Host "Release keystore already exists: $keystorePath"
} else {
  $storePass = Read-Host "Enter keystore password (remember for release builds)"
  $keyPass = Read-Host "Enter key password (Enter to match keystore password)"
  if ([string]::IsNullOrWhiteSpace($keyPass)) { $keyPass = $storePass }

  keytool -genkeypair -v `
    -keystore $keystorePath `
    -alias comodo-release `
    -keyalg RSA -keysize 2048 -validity 10000 `
    -storepass $storePass -keypass $keyPass `
    -dname "CN=Jefferson Salim, OU=Mobile, O=APP-DEV A, L=Manila, ST=Metro, C=PH"

  Write-Host "Created keystore: $keystorePath"
}

if (-not (Test-Path $propsPath)) {
  $storePass = Read-Host "Keystore password for keystore.properties"
  $keyPass = Read-Host "Key password for keystore.properties (Enter to match)"
  if ([string]::IsNullOrWhiteSpace($keyPass)) { $keyPass = $storePass }

  $content = @"
storeFile=keystores/comodo-release.keystore
storePassword=$storePass
keyAlias=comodo-release
keyPassword=$keyPass
"@
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($propsPath, $content, $utf8NoBom)

  Write-Host "Wrote $propsPath"
}

Write-Host ""
Write-Host "SHA fingerprints for Firebase / Google Sign-In:"
keytool -list -v -keystore $keystorePath -alias comodo-release
