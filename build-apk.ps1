# PowerShell script to build Tivicify APK
$ErrorActionPreference = "Stop"

Write-Host ">>> Building Tivicify Web Assets..." -ForegroundColor Cyan
npm run build

Write-Host ">>> Syncing with Android..." -ForegroundColor Cyan
npx cap sync android

Write-Host ">>> Configuring Android Build Environment..." -ForegroundColor Cyan
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\SATISFY\AppData\Local\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host ">>> Compiling Android APK with Gradle..." -ForegroundColor Cyan
Push-Location android
.\gradlew.bat assembleDebug
Pop-Location

Write-Host ">>> Copying compiled APK..." -ForegroundColor Cyan
Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" "Tivicify.apk" -Force
Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" "dist\Tivicify.apk" -Force

Write-Host "`n>>> SUCCESS! APK ready at: Tivicify.apk" -ForegroundColor Green
