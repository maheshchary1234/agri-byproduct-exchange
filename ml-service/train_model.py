"""
Agricultural By-Product Price Prediction Model Trainer
Utilizes XGBoost Regressor to estimate market-fair prices (INR/Ton)
based on biomass quality specs, geographic region, season, and logistics factors.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb

BASE_PRICES = {
    'rice_straw': 2400.0,
    'wheat_straw': 3400.0,
    'sugarcane_bagasse': 2800.0,
    'corn_cob': 3550.0,
    'cotton_stalk': 3050.0,
    'coir_pith': 5300.0,
    'mustard_husk': 2950.0,
    'poultry_litter': 1850.0
}

OPTIMAL_MOISTURE = {
    'rice_straw': 12.0,
    'wheat_straw': 10.0,
    'sugarcane_bagasse': 18.0,
    'corn_cob': 11.0,
    'cotton_stalk': 12.0,
    'coir_pith': 15.0,
    'mustard_husk': 10.0,
    'poultry_litter': 20.0
}

STATES = ['Punjab', 'Haryana', 'Maharashtra', 'Tamil Nadu', 'Uttar Pradesh', 'Karnataka', 'Gujarat', 'Madhya Pradesh']
SEASONS = ['Kharif', 'Rabi', 'Zaid']

def generate_synthetic_agri_dataset(n_samples=6000, random_seed=42):
    np.random.seed(random_seed)
    
    types = list(BASE_PRICES.keys())
    sampled_types = np.random.choice(types, size=n_samples, p=[0.22, 0.18, 0.18, 0.12, 0.10, 0.08, 0.07, 0.05])
    sampled_states = np.random.choice(STATES, size=n_samples)
    sampled_seasons = np.random.choice(SEASONS, size=n_samples, p=[0.45, 0.40, 0.15])
    
    moisture = []
    organic_matter = []
    quantities = np.random.uniform(5.0, 450.0, size=n_samples)
    distances = np.random.uniform(10.0, 350.0, size=n_samples)
    
    for t in sampled_types:
        opt_m = OPTIMAL_MOISTURE[t]
        m = np.clip(np.random.normal(opt_m + 2.0, 3.5), 6.0, 42.0)
        moisture.append(m)
        om = np.clip(np.random.normal(83.0, 6.0), 60.0, 96.0)
        organic_matter.append(om)
        
    moisture = np.array(moisture)
    organic_matter = np.array(organic_matter)
    
    prices = []
    for i in range(n_samples):
        btype = sampled_types[i]
        base_p = BASE_PRICES[btype]
        opt_m = OPTIMAL_MOISTURE[btype]
        
        # Moisture impact: penalize higher moisture (water weight + spoilage risk), reward dry biomass
        m_diff = moisture[i] - opt_m
        moisture_factor = 1.0 - (m_diff * 0.018)
        
        # Organic matter impact: baseline 80%
        om_factor = 1.0 + ((organic_matter[i] - 80.0) * 0.003)
        
        # Quantity bulk efficiency
        qty_factor = 1.0 - min(0.06, (quantities[i] / 500.0) * 0.05)
        
        # Seasonal surge (e.g. Kharif in Punjab/Haryana due to stubble burning alternative demand)
        season_surge = 1.0
        if sampled_seasons[i] == 'Kharif' and sampled_states[i] in ['Punjab', 'Haryana', 'Uttar Pradesh']:
            season_surge = 1.08
        elif sampled_seasons[i] == 'Rabi' and btype in ['wheat_straw', 'mustard_husk']:
            season_surge = 1.05
            
        # Regional demand multiplier
        region_multiplier = {
            'Punjab': 1.04, 'Haryana': 1.03, 'Maharashtra': 1.02, 'Tamil Nadu': 1.05,
            'Uttar Pradesh': 0.98, 'Karnataka': 1.02, 'Gujarat': 1.01, 'Madhya Pradesh': 0.96
        }.get(sampled_states[i], 1.0)
        
        # Distance transport discount
        distance_discount = (distances[i] / 100.0) * 25.0
        
        # Market stochastic noise (+/- 3.5%)
        noise = np.random.normal(0, base_p * 0.035)
        
        price = (base_p * moisture_factor * om_factor * qty_factor * season_surge * region_multiplier) - distance_discount + noise
        price = max(price, 800.0) # Lower price floor
        prices.append(round(price, 2))
        
    df = pd.DataFrame({
        'byproduct_type': sampled_types,
        'moisture_content_percent': np.round(moisture, 2),
        'organic_matter_percent': np.round(organic_matter, 2),
        'quantity_tons': np.round(quantities, 2),
        'state': sampled_states,
        'season': sampled_seasons,
        'transport_distance_km': np.round(distances, 2),
        'price_per_ton': prices
    })
    
    return df

def train_and_save_model():
    print("Generating synthetic agricultural market pricing dataset...")
    df = generate_synthetic_agri_dataset(n_samples=7500)
    
    csv_path = os.path.join(os.path.dirname(__file__), 'agri_historical_prices.csv')
    df.to_csv(csv_path, index=False)
    print(f"Saved dataset ({len(df)} records) to {csv_path}")
    
    X = df.drop(columns=['price_per_ton'])
    y = df['price_per_ton']
    
    categorical_cols = ['byproduct_type', 'state', 'season']
    numerical_cols = ['moisture_content_percent', 'organic_matter_percent', 'quantity_tons', 'transport_distance_km']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_cols),
            ('num', StandardScaler(), numerical_cols)
        ]
    )
    
    xgb_reg = xgb.XGBRegressor(
        n_estimators=350,
        learning_rate=0.045,
        max_depth=5,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        tree_method='hist'
    )
    
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', xgb_reg)
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Fitting XGBoost Pipeline on training data...")
    pipeline.fit(X_train, y_train)
    
    y_pred = pipeline.predict(X_test)
    
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print("================ MODEL EVALUATION METRICS ================")
    print(f"Test RMSE: INR {rmse:.2f} / ton")
    print(f"Test MAE:  INR {mae:.2f} / ton")
    print(f"Test R^2:  {r2:.4f} ({r2*100:.2f}%)")
    print("==========================================================")
    
    model_path = os.path.join(os.path.dirname(__file__), 'agri_price_xgb_model.joblib')
    joblib.dump(pipeline, model_path)
    print(f"Saved trained model pipeline to {model_path}")
    
    metadata = {
        'model_name': 'AgriByProduct-XGBoost-PricePredictor',
        'version': '1.2.0',
        'algorithm': 'XGBRegressor (Gradient Boosted Trees)',
        'rmse': round(float(rmse), 2),
        'mae': round(float(mae), 2),
        'r2_score': round(float(r2), 4),
        'training_samples': len(df),
        'features': {
            'categorical': categorical_cols,
            'numerical': numerical_cols
        },
        'supported_byproducts': list(BASE_PRICES.keys()),
        'base_prices': BASE_PRICES,
        'optimal_moisture': OPTIMAL_MOISTURE,
        'supported_states': STATES,
        'supported_seasons': SEASONS
    }
    
    metadata_path = os.path.join(os.path.dirname(__file__), 'model_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved model metadata to {metadata_path}")
    return metadata

if __name__ == '__main__':
    train_and_save_model()
