@echo off
echo =======================================================
echo Starting Agricultural XGBoost Price Prediction Service
echo =======================================================
cd /d "%~dp0ml-service"
python app.py
