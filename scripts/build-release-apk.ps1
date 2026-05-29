$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$androidDir = Join-Path $root "android"
$propsPath = Join-Path $androidDir "app\keystore.properties"
$apkOut = Join-Path $androidDir "app\build\outputs\apk\release\app-release.apk"
$distDir = Join-Path $root "dist"

if (-not (Test-Path $propsPath)) {
  Write-Host "Missing android/app/keystore.properties - run: npm run android:keystore"
  exit 1
}

Push-Location $androidDir
try {
  .\gradlew.bat assembleRelease
} finally {
  Pop-Location
}

if (-not (Test-Path $apkOut)) {
  Write-Host "APK not found at $apkOut"
  exit 1
}

if (-not (Test-Path $distDir)) {
  New-Item -ItemType Directory -Path $distDir | Out-Null
}

$dest = Join-Path $distDir "ComodoApp-release.apk"
Copy-Item $apkOut $dest -Force
Write-Host "Signed release APK: $dest"
