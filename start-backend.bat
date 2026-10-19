@echo off
echo =======================================================
echo Starting Spring Boot 3 Backend API (Port 8080)
echo =======================================================
cd /d "%~dp0backend"
call mvnw.cmd spring-boot:run
