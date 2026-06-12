@echo off
echo === SARL AK Setup ===
echo.

echo [1/4] Installing root dependencies...
call npm install
echo.

echo [2/4] Installing backend dependencies...
cd backend
call npm install
call npm install dotenv drizzle-orm@0.36.0 drizzle-kit@0.28.0
cd ..
echo.

echo [3/4] Installing frontend dependencies...
cd frontend
call npm install
cd ..
echo.

echo [4/4] Installing admin dependencies...
cd admin
call npm install
cd ..
echo.

echo === Setup complete! ===
echo.
echo Next step: run this command:
echo   cd backend
echo   npx drizzle-kit push
echo   cd ..
echo   npm run dev
echo.
pause
