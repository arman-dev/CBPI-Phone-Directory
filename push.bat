@echo off
chcp 65001 >nul
echo ================================
echo   CBPI Directory - Git Push
echo ================================
echo.
cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Git ইনস্টল করা নেই। https://git-scm.com/download/win থেকে ইনস্টল করুন।
    pause
    exit /b 1
)

REM Check if inside a git repo
git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
    echo [INFO] Git repo পাইনি। প্রথমে 'init-repo.bat' চালান, অথবা নিজে git init করুন।
    pause
    exit /b 1
)

echo [1/3] যোগ করা হচ্ছে...
git add .
if errorlevel 1 ( echo git add ব্যর্থ & pause & exit /b 1 )

echo [2/3] কমিট করা হচ্ছে...
for /f %%i in ('date /t') do set D=%%i
for /f %%i in ('time /t') do set T=%%i
git commit -m "update contacts - %D% %T%"
if errorlevel 1 (
    echo কোনো পরিবর্তন নেই অথবা কমিট ব্যর্থ।
    pause
    exit /b 0
)

echo [3/3] পুশ করা হচ্ছে...
git push
if errorlevel 1 ( echo push ব্যর্থ & pause & exit /b 1 )

echo.
echo ✅ সফলভাবে পুশ হয়েছে! ৩০-৬০ সেকেন্ডের মধ্যে সবার ফোনে আপডেট পৌছে যাবে।
timeout /t 4 >nul
