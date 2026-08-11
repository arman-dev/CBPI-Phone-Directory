@echo off
chcp 65001 >nul
echo ================================
echo  CBPI Directory - Git Init (first-time only)
echo ================================
echo.
cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Git ইনস্টল করা নেই। https://git-scm.com/download/win
  pause
  exit /b 1
)

if exist .git (
  echo Git repo আগে থেকেই আছে।
  pause
  exit /b 0
)

set /p REPO="GitHub repo URL দিন (যেমন https://github.com/yourname/cbpi-directory.git): "
if "%REPO%"=="" (
  echo URL দেননি। বন্ধ করা হচ্ছে।
  pause
  exit /b 1
)

echo.
echo [1] git init...
git init -b main
echo [2] প্রথম কমিট...
git add .
git commit -m "initial - CBPI Phone Directory"
echo [3] remote যোগ করা হচ্ছে...
git remote add origin %REPO%
echo [4] প্রথম পুশ (GitHub-এ একটা খালি repo তৈরি করে রাখুন)...
git branch -M main
git push -u origin main
echo.
echo ✅ হয়ে গেছে! এরপর শুধু push.bat চালালেই হবে।
pause
