@echo off
setlocal EnableExtensions
pushd "%~dp0"

if not exist "package.json" (
  echo ERROR: package.json not found. Run this script from the komodo-hub folder.
  popd
  exit /b 1
)

if not exist ".env" (
  if exist ".env.example" (
    echo Creating .env from .env.example
    copy /Y ".env.example" ".env" >nul
  )
)

echo.
echo === Komodo Hub - start ===
echo.
echo This script will: install deps -^> prisma generate -^> db push -^> db:seed -^> dev server
echo db:seed loads prisma/seed.ts: demo users, species photos, book covers, rewards, daily tasks.
echo You do NOT need to run npm run db:seed separately after changing seed.ts; just run this again.
echo.

echo Step 1 - npm install (no postinstall: avoids Windows EPERM on Prisma engine rename)
call npm install
if errorlevel 1 goto FAILED

echo Step 2 - prisma generate (retries if file is briefly locked)
call npx prisma generate
if errorlevel 1 (
  echo First generate failed, waiting 4s then retry 1/2...
  timeout /t 4 /nobreak >nul
  call npx prisma generate
)
if errorlevel 1 (
  echo Second attempt failed, waiting 4s then retry 2/2...
  timeout /t 4 /nobreak >nul
  call npx prisma generate
)
if errorlevel 1 (
  echo.
  echo prisma generate still failed EPERM.
  if exist "node_modules\.prisma\client\index.js" (
    echo Existing Prisma Client detected. Continue startup with existing client files.
    echo Tip: later, close all node.exe and run npx prisma generate when convenient.
  ) else (
    echo - End all node.exe in Task Manager ^(close dev servers / other terminals using this folder^).
    echo - Pause antivirus real-time scan on komodo-hub, or move project out of OneDrive-synced Desktop.
    echo - Then run this script again, or manually: npx prisma generate
    goto FAILED
  )
)

echo Step 3 - prisma db push (skip generate; client already built in step 2)
call npx prisma db push --skip-generate
if errorlevel 1 goto FAILED

echo Step 4 - npm run db:seed (demo data + image URLs from prisma/seed.ts)
call npm run db:seed
if errorlevel 1 goto FAILED

echo Step 5 - dev server http://localhost:3000
echo Press Ctrl+C to stop.
echo.
call npm run dev

popd
goto END

:FAILED
echo.
echo FAILED. See errors above.
popd
pause
exit /b 1

:END
endlocal
