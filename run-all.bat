@echo off
echo =========================================================================
echo Launching Agricultural By-Product Utilization & Exchange Platform
echo React.js + Spring Boot + MySQL + Python XGBoost
echo =========================================================================

echo 1. Starting Python XGBoost ML Service in new terminal...
start "AgriExchange - Python XGBoost Service" cmd /k "cd /d %~dp0ml-service && python app.py"

timeout /t 3 /nobreak >nul

echo 2. Starting Spring Boot REST Backend API in new terminal...
start "AgriExchange - Spring Boot Backend" cmd /k "cd /d %~dp0backend && mvnw.cmd spring-boot:run"

timeout /t 5 /nobreak >nul

echo 3. Starting React Frontend in new terminal...
start "AgriExchange - React Frontend" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo =========================================================================
echo All services launched!
echo - React Web Portal:   http://localhost:5173
echo - Spring Boot API:    http://localhost:8080/api/products/public
echo - XGBoost ML Engine:  http://localhost:5001/health
echo =========================================================================
