import json
from app import app

client = app.test_client()

# 1. Health check
res = client.get('/health')
print("Health Status:", res.status_code, res.get_json())

# 2. Catalog check
cat = client.get('/catalog')
print(f"Catalog count: {cat.get_json()['count']} by-products")

# 3. Test prediction for Rice Straw
sample_payload = {
    "byproduct_type": "rice_straw",
    "moisture_content_percent": 11.5,
    "organic_matter_percent": 86.0,
    "quantity_tons": 75.0,
    "state": "Punjab",
    "season": "Kharif",
    "transport_distance_km": 45.0
}

pred = client.post('/predict', data=json.dumps(sample_payload), content_type='application/json')
print("Prediction Status:", pred.status_code)
print(json.dumps(pred.get_json(), indent=2))
