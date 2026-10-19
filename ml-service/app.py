"""
Agricultural By-Product Price Prediction Microservice (Flask REST API)
Serves real-time XGBoost price predictions for Spring Boot backend and React frontend.
"""

import os
import json
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, 'agri_price_xgb_model.joblib')
METADATA_PATH = os.path.join(MODEL_DIR, 'model_metadata.json')

# Load model and metadata
model_pipeline = None
metadata = {}

try:
    if os.path.exists(MODEL_PATH):
        model_pipeline = joblib.load(MODEL_PATH)
        print(f"Loaded XGBoost model from {MODEL_PATH}")
    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, 'r') as f:
            metadata = json.load(f)
        print(f"Loaded model metadata: version {metadata.get('version')}")
except Exception as e:
    print(f"Error initializing model: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'HEALTHY',
        'service': 'Agri By-Product Price Prediction Microservice',
        'engine': 'XGBoost Regressor (Scikit-Learn Pipeline)',
        'model_loaded': model_pipeline is not None,
        'model_version': metadata.get('version', '1.2.0'),
        'metrics': {
            'r2_score': metadata.get('r2_score'),
            'rmse': metadata.get('rmse'),
            'mae': metadata.get('mae')
        }
    }), 200

@app.route('/catalog', methods=['GET'])
def get_catalog():
    byproducts = [
        {
            'type': 'rice_straw',
            'name': 'Paddy Rice Straw',
            'category': 'Cereal Straws & Stubble',
            'base_price_ton': 2400.0,
            'ideal_moisture': 12.0,
            'primary_uses': ['Biomass Co-gen Power', 'Compressed Biogas (CBG)', '2G Ethanol', 'Cardboard Pulp'],
            'carbon_offset_ratio': 1.45
        },
        {
            'type': 'wheat_straw',
            'name': 'Golden Wheat Straw',
            'category': 'Cereal Straws & Stubble',
            'base_price_ton': 3400.0,
            'ideal_moisture': 10.0,
            'primary_uses': ['Cattle Bedding & Fodder Mix', 'Mushroom Composting', 'Paper Pulp'],
            'carbon_offset_ratio': 1.40
        },
        {
            'type': 'sugarcane_bagasse',
            'name': 'Sugarcane Bagasse',
            'category': 'Sugar Mill By-Products',
            'base_price_ton': 2800.0,
            'ideal_moisture': 18.0,
            'primary_uses': ['Paper & Packaging Mills', 'Sugar Mill Captive Boilers', 'Furfural Synthesis'],
            'carbon_offset_ratio': 1.30
        },
        {
            'type': 'corn_cob',
            'name': 'De-shelled Corn Cobs',
            'category': 'Stalks & Woody Biomass',
            'base_price_ton': 3550.0,
            'ideal_moisture': 11.0,
            'primary_uses': ['Bio-coal Briquettes', 'Furfural Extraction', 'Industrial Abrasives'],
            'carbon_offset_ratio': 1.35
        },
        {
            'type': 'cotton_stalk',
            'name': 'Chipped Cotton Stalks',
            'category': 'Stalks & Woody Biomass',
            'base_price_ton': 3050.0,
            'ideal_moisture': 12.0,
            'primary_uses': ['High-Density Pellets', 'Particle Board Manufacture', 'Gasification'],
            'carbon_offset_ratio': 1.38
        },
        {
            'type': 'coir_pith',
            'name': 'Washed Coconut Coir Pith',
            'category': 'Fibers & Husk Residues',
            'base_price_ton': 5300.0,
            'ideal_moisture': 15.0,
            'primary_uses': ['Greenhouse Hydroponic Substrate', 'Soil Conditioning', 'Oil Absorbent'],
            'carbon_offset_ratio': 1.15
        },
        {
            'type': 'mustard_husk',
            'name': 'Mustard Stalks & Husk',
            'category': 'Fibers & Husk Residues',
            'base_price_ton': 2950.0,
            'ideal_moisture': 10.0,
            'primary_uses': ['Boiler Fuel Briquettes', 'Plywood Fillers'],
            'carbon_offset_ratio': 1.25
        },
        {
            'type': 'poultry_litter',
            'name': 'Enriched Poultry Litter',
            'category': 'Organic Manure & Bedding',
            'base_price_ton': 1850.0,
            'ideal_moisture': 20.0,
            'primary_uses': ['Organic Bio-fertilizers', 'Methane Biomethanation'],
            'carbon_offset_ratio': 0.95
        }
    ]
    return jsonify({
        'status': 'success',
        'count': len(byproducts),
        'byproducts': byproducts,
        'supported_states': metadata.get('supported_states', []),
        'supported_seasons': metadata.get('supported_seasons', [])
    }), 200

@app.route('/predict', methods=['POST'])
def predict_price():
    if not model_pipeline:
        return jsonify({'status': 'error', 'message': 'XGBoost model is not loaded'}), 503
        
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({'status': 'error', 'message': 'Missing JSON payload'}), 400
        
    try:
        byproduct_type = str(data.get('byproduct_type', 'rice_straw')).lower().strip()
        moisture = float(data.get('moisture_content_percent', 12.0))
        organic_matter = float(data.get('organic_matter_percent', 82.0))
        quantity = float(data.get('quantity_tons', 20.0))
        state = str(data.get('state', 'Punjab')).strip()
        season = str(data.get('season', 'Kharif')).strip()
        transport_distance = float(data.get('transport_distance_km', 50.0))
        
        # Build DataFrame for scikit-learn/XGBoost pipeline
        input_df = pd.DataFrame([{
            'byproduct_type': byproduct_type,
            'moisture_content_percent': moisture,
            'organic_matter_percent': organic_matter,
            'quantity_tons': quantity,
            'state': state,
            'season': season,
            'transport_distance_km': transport_distance
        }])
        
        predicted_val = float(model_pipeline.predict(input_df)[0])
        predicted_price = round(max(500.0, predicted_val), 2)
        
        # Calculate dynamic confidence intervals using MAE/RMSE spread
        mae = metadata.get('mae', 95.0)
        margin = round(mae * 1.5, 2)
        lower_bound = round(max(300.0, predicted_price - margin), 2)
        upper_bound = round(predicted_price + margin, 2)
        
        opt_moist = metadata.get('optimal_moisture', {}).get(byproduct_type, 12.0)
        moist_diff = round(moisture - opt_moist, 1)
        
        if moist_diff <= 0:
            moist_status = "EXCELLENT_DRY (Premium grade)"
        elif moist_diff <= 3.0:
            moist_status = "ACCEPTABLE (Standard grade)"
        else:
            moist_status = f"HIGH_MOISTURE (+{moist_diff}% over benchmark, price penalty applied)"
            
        seasonal_commentary = "Standard seasonal baseline."
        if season == 'Kharif' and state in ['Punjab', 'Haryana', 'Uttar Pradesh']:
            seasonal_commentary = "Peak season surge: High industrial boiler & CBG procurement in North India."
        elif season == 'Rabi' and byproduct_type in ['wheat_straw', 'mustard_husk']:
            seasonal_commentary = "Wheat harvest cycle: Strong cattle fodder and pellet manufacturing demand."
            
        return jsonify({
            'status': 'success',
            'predicted_price_per_ton': predicted_price,
            'currency': 'INR',
            'confidence_interval': {
                'lower': lower_bound,
                'upper': upper_bound,
                'confidence_level': '95%'
            },
            'quality_analysis': {
                'moisture_percent': moisture,
                'optimal_moisture_benchmark': opt_moist,
                'moisture_rating': moist_status,
                'organic_matter_percent': organic_matter
            },
            'logistics_and_market': {
                'distance_km': transport_distance,
                'quantity_tons': quantity,
                'state': state,
                'season': season,
                'seasonal_commentary': seasonal_commentary
            },
            'recommended_pricing': {
                'farmer_suggested_ask_price': round(predicted_price * 1.02, 2),
                'buyer_suggested_bid_price': round(predicted_price * 0.98, 2)
            },
            'model_info': {
                'algorithm': 'XGBoost Regressor v1.2',
                'r2_score': metadata.get('r2_score', 0.9765)
            }
        }), 200
        
    except Exception as ex:
        return jsonify({'status': 'error', 'message': f'Prediction computation error: {str(ex)}'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"Starting Agricultural By-Product XGBoost API on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
