$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$keystorePath = Join-Path $root "android\app\debug.keystore"

# Matches android/app/build.gradle signingConfigs.debug (passwords must stay android / androiddebugkey)
$storePass = "android"
$keyPass = "android"
$alias = "androiddebugkey"

# Shown in Settings → App → Certificate (issuer / subject)
$dname = "CN=Jefferson Salim, OU=Mobile, O=APP-DEV A, L=Manila, ST=Metro, C=PH"

if (Test-Path $keystorePath) {
  $backup = "$keystorePath.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
  Copy-Item $keystorePath $backup -Force
  Write-Host "Backed up existing keystore to $backup"
  Remove-Item $keystorePath -Force
}

keytool -genkeypair -v `
  -keystore $keystorePath `
  -alias $alias `
  -keyalg RSA -keysize 2048 -validity 10000 `
  -storepass $storePass -keypass $keyPass `
  -dname $dname

Write-Host ""
Write-Host "Created debug keystore: $keystorePath"
Write-Host "  Issuer / Subject name: Jefferson Salim"
Write-Host "  Organization: APP-DEV A"
Write-Host "  Country: PH"
Write-Host ""
Write-Host "Reinstall the app (debug build) to see the new certificate:"
Write-Host "  npm run android"
