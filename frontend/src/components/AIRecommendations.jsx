import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Agronomic and Industrial Utilization Database for the 8 Crops
const RECOMMENDATION_DATA = {
  paddy: [
    {
      pathway: 'Pathway #1',
      category: 'Cereal Straw & Stubble',
      utilization: '2G Second-Generation Bio-Ethanol Refineries',
      explanation: 'Paddy straw possesses high holocellulose content (36–42% cellulose, 22–26% hemicellulose). Enzymatic hydrolysis and simultaneous fermentation convert it into anhydrous ethanol at 180–210 liters per dry ton.',
      targetIndustry: 'Biofuels & Public Sector Oil Marketing Companies (IOCL, BPCL, HPCL)',
      suitabilityScore: 96
    },
    {
      pathway: 'Pathway #2',
      category: 'Compressed Agricultural Gas',
      utilization: 'Compressed Biogas (CBG) / Bio-CNG Anaerobic Digestion',
      explanation: 'Optimal carbon-to-nitrogen ratio (C:N ~55:1) when co-digested with cattle manure or press mud. Produces 55–65 kg of pure biomethane (>92% CH4) per metric ton, eligible for SATAT guaranteed purchase at ₹46/kg.',
      targetIndustry: 'Gas Distribution Utilities & Automotive Fuel Retailers',
      suitabilityScore: 94
    },
    {
      pathway: 'Pathway #3',
      category: 'Densified Solid Biofuel',
      utilization: 'High-Density Non-Torrefied Biomass Briquetting',
      explanation: 'Calorific value of 3,200–3,500 kcal/kg. Densified into 70mm/90mm cylindrical briquettes for 7% co-firing in coal-fired thermal power stations to satisfy Ministry of Power mandates.',
      targetIndustry: 'Thermal Power Generation & Industrial Steam Boilers',
      suitabilityScore: 89
    },
    {
      pathway: 'Pathway #4',
      category: 'Molded Pulp Packaging',
      utilization: 'Biodegradable Tableware & Molded Pulp Packaging',
      explanation: 'Short-fiber pulp extracted with thermo-mechanical pulping yields water and grease-resistant compostable plates, bowls, and packaging inserts, replacing single-use expanded polystyrene.',
      targetIndustry: 'Eco-Packaging & Consumer Goods Packaging',
      suitabilityScore: 84
    }
  ],
  wheat: [
    {
      pathway: 'Pathway #1',
      category: 'Paper & Cellulose Fiber',
      utilization: 'Writing, Printing & Specialty Paper Manufacturing',
      explanation: 'Wheat straw fiber length (~1.1 mm) and low silica relative to rice straw enable high-yield alkaline pulping. Blended with wood pulp to manufacture eco-friendly writing and kraft paper.',
      targetIndustry: 'Pulp & Paper Mills',
      suitabilityScore: 95
    },
    {
      pathway: 'Pathway #2',
      category: 'Densified Biomass Pellets',
      utilization: 'Standardized 6mm–8mm Industrial Fuel Pellets',
      explanation: 'Bulk density exceeds 650 kg/m³ with calorific value ~3,800 kcal/kg. Low abrasive wear on pneumatic boiler feeding nozzles compared to high-silica residues.',
      targetIndustry: 'Industrial Fluidized Bed Boilers & District Heating',
      suitabilityScore: 91
    },
    {
      pathway: 'Pathway #3',
      category: 'Mushroom Cultivation Substrate',
      utilization: 'Sterilized Organic Substrate for Button Mushrooms',
      explanation: 'Rich in organic nitrogen and lignin breakdown precursors. Ideal base substrate for Agaricus bisporus mycelial development with high biological conversion efficiency.',
      targetIndustry: 'Commercial Agro-Food Processing & Horticultural Growers',
      suitabilityScore: 88
    }
  ],
  corn: [
    {
      pathway: 'Pathway #1',
      category: 'Chemical By-Product Extraction',
      utilization: 'High-Purity Furfural & Bio-Chemical Synthesis',
      explanation: 'Corn cobs are exceptionally rich in pentosans (xylan >30%). Acid-catalyzed dehydration produces furfural, a critical chemical intermediate for furan resins, pharmaceuticals, and green solvents.',
      targetIndustry: 'Specialty Chemical Manufacturing & Refineries',
      suitabilityScore: 97
    },
    {
      pathway: 'Pathway #2',
      category: 'Hard Biomass Fuel',
      utilization: 'High-Heat Biomass Briquetting & Gasification',
      explanation: 'Ash content under 2% and calorific value exceeding 4,100 kcal/kg. De-seeded corn cobs provide steady thermal output in downdraft biomass gasifiers for rural mini-grids.',
      targetIndustry: 'Textile Processing Boilers & Captive Power Plants',
      suitabilityScore: 92
    },
    {
      pathway: 'Pathway #3',
      category: 'Biochar Soil Amendment',
      utilization: 'Slow Pyrolysis Activated Biochar & Carbon Sinks',
      explanation: 'Yields recalcitrant microporous biochar with specific surface area >250 m²/g. Enhances soil cation exchange capacity (CEC) and moisture retention in arid agricultural zones.',
      targetIndustry: 'Carbon Sequestration Services & Soil Regeneration',
      suitabilityScore: 86
    }
  ],
  sugarcane: [
    {
      pathway: 'Pathway #1',
      category: 'Mill Fiber Residue',
      utilization: 'High-Efficiency Co-Generation Thermal Energy',
      explanation: 'Combusted directly in 87–110 bar high-pressure traveling-grate boilers generating superheated steam for 30MW+ cogeneration export to national electrical grids.',
      targetIndustry: 'Sugar Mill Co-Gen Plants & State Power Grids',
      suitabilityScore: 98
    },
    {
      pathway: 'Pathway #2',
      category: 'Eco-Packaging',
      utilization: 'Thermoformed Bagasse Food Packaging & Molded Trays',
      explanation: 'Bleached bagasse pulp produces food-contact compliant, microwave-safe, home-compostable food service containers that biodegrade within 60 days.',
      targetIndustry: 'QSR Chains, Airline Catering & Green Packaging',
      suitabilityScore: 94
    },
    {
      pathway: 'Pathway #3',
      category: 'Building Products',
      utilization: 'Medium-Density Fiberboard (MDF) & Particle Board',
      explanation: 'Depithed bagasse bonded with bio-resins or formaldehyde-free binders yields durable interior partition panels meeting BIS moisture-resistance standards.',
      targetIndustry: 'Construction & Sustainable Interior Architecture',
      suitabilityScore: 87
    }
  ],
  coconut: [
    {
      pathway: 'Pathway #1',
      category: 'Carbonaceous Shell Residue',
      utilization: 'Ultra-High Adsorption Activated Carbon Manufacturing',
      explanation: 'Coconut shells possess dense, uniform microporous structures. Thermal steam activation yields high-grade activated carbon with iodine numbers >1,100 mg/g for gold recovery and water purification.',
      targetIndustry: 'Water Filtration, Air Purification & Precious Metal Extraction',
      suitabilityScore: 99
    },
    {
      pathway: 'Pathway #2',
      category: 'Coir Pith & Dust',
      utilization: 'Hydroponic Cocopeat Growing Substrate & Soil Conditioner',
      explanation: 'Washed and buffered coir pith holds up to 8x its weight in moisture with neutral pH (5.8–6.5), forming the premier global soilless medium for greenhouse horticulture.',
      targetIndustry: 'Commercial Greenhouses, Hydroponics & Floriculture',
      suitabilityScore: 96
    },
    {
      pathway: 'Pathway #3',
      category: 'Bio-Charcoal',
      utilization: 'Smokeless Shisha & Barbecue Briquettes',
      explanation: 'High fixed carbon (>78%) and low volatile emissions yield smokeless, long-burning briquettes with sustained temperatures for domestic and export heating markets.',
      targetIndustry: 'Consumer Cooking & International Export Commodities',
      suitabilityScore: 90
    }
  ],
  banana: [
    {
      pathway: 'Pathway #1',
      category: 'Pseudostem Fiber',
      utilization: 'High-Tensile Textile Yarn & Eco-Fashion Fabrics',
      explanation: 'Extracted banana pseudostem fiber exhibits natural sheen, high tensile strength (400–600 MPa), and lightweight softness comparable to bamboo linen.',
      targetIndustry: 'Sustainable Fashion, Handloom Co-ops & Technical Textiles',
      suitabilityScore: 93
    },
    {
      pathway: 'Pathway #2',
      category: 'Biodegradable Products',
      utilization: 'Organic Sanitary Napkins & Medical Absorption Pads',
      explanation: 'Extracted cellulose core is naturally antimicrobial, non-toxic, and offers liquid retention exceeding synthetic polyacrylate gels without ecological footprint.',
      targetIndustry: 'Women’s Health Products & Green Medical Consumables',
      suitabilityScore: 91
    },
    {
      pathway: 'Pathway #3',
      category: 'Liquid Plant Sap By-Product',
      utilization: 'Bio-Organic Liquid Fertilizer & Micronutrient Spray',
      explanation: 'Sap expressed during fiber extraction contains concentrated potassium (K), micronutrients, and plant growth promoters, directly applied as a foliar organic spray.',
      targetIndustry: 'Organic Farming Inputs & Bio-Fertilizer Manufacturers',
      suitabilityScore: 88
    }
  ],
  bamboo: [
    {
      pathway: 'Pathway #1',
      category: 'Structural Lignocellulose',
      utilization: 'Strand-Woven Architectural Lumber & Flooring',
      explanation: 'Compressing resin-impregnated bamboo fibers under 3,000 tons of hydraulic pressure yields structural timber with twice the hardness of oak and zero deforestation impact.',
      targetIndustry: 'Green Building Construction & Interior Flooring',
      suitabilityScore: 96
    },
    {
      pathway: 'Pathway #2',
      category: 'Cellulose Pulp',
      utilization: 'Dissolving Pulp for Rayon / Viscose Fiber Production',
      explanation: 'High alpha-cellulose content (>90% upon chemical delignification) ideal for spinning into silky, breathable bamboo viscose yarn for apparel.',
      targetIndustry: 'Man-Made Fiber Spinning & Industrial Textiles',
      suitabilityScore: 92
    },
    {
      pathway: 'Pathway #3',
      category: 'Pyrolysis Charcoal',
      utilization: 'Bamboo Vinegar & Electro-Conductive Bio-Carbon',
      explanation: 'Carbonization produces electro-conductive biochar for supercapacitors and condensed pyroligneous acid (bamboo vinegar) for organic pest repellency.',
      targetIndustry: 'Renewable Battery Tech & Organic Plant Protection',
      suitabilityScore: 89
    }
  ],
  jute: [
    {
      pathway: 'Pathway #1',
      category: 'Natural Bast Fiber',
      utilization: 'Natural Fiber Reinforced Composites for Automotive Interiors',
      explanation: 'Jute fiber reinforcement in polypropylene matrix reduces automotive door panel weight by 25% while providing enhanced acoustic dampening and crash impact absorption.',
      targetIndustry: 'Automotive Tier-1 Component Manufacturers',
      suitabilityScore: 95
    },
    {
      pathway: 'Pathway #2',
      category: 'Geotextile Fiber',
      utilization: 'Erosion-Control Biodegradable Geotextiles',
      explanation: 'Woven heavy-gauge jute mesh stabilizes steep river embankments and highway slopes, holding topsoil in place while decomposing into organic nutrients over 18 months.',
      targetIndustry: 'Civil Infrastructure, Highway Authorities & Mining Land Reclamation',
      suitabilityScore: 93
    },
    {
      pathway: 'Pathway #3',
      category: 'Stalk Core Residue (Jute Sticks)',
      utilization: 'Activated Carbon & High-Grade Pyrolysis Black Carbon',
      explanation: 'Lightweight porous jute sticks carbonize into high-grade chemical charcoal for export to toner cartridge, ink pigment, and fireworks manufacturers.',
      targetIndustry: 'Pigment Chemistry, Electrodes & Pyrotechnics',
      suitabilityScore: 87
    }
  ]
};

export default function AIRecommendations() {
  const { t } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState('paddy');

  const cropTabs = [
    { key: 'paddy', label: t('ai_recommendations.tab_paddy') },
    { key: 'wheat', label: t('ai_recommendations.tab_wheat') },
    { key: 'corn', label: t('ai_recommendations.tab_corn') },
    { key: 'sugarcane', label: t('ai_recommendations.tab_sugarcane') },
    { key: 'coconut', label: t('ai_recommendations.tab_coconut') },
    { key: 'banana', label: t('ai_recommendations.tab_banana') },
    { key: 'bamboo', label: t('ai_recommendations.tab_bamboo') },
    { key: 'jute', label: t('ai_recommendations.tab_jute') }
  ];

  const recommendations = RECOMMENDATION_DATA[selectedCrop] || RECOMMENDATION_DATA.paddy;

  return (
    <div className="ai-recommendations-wrapper">
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--green-900)', fontWeight: 800 }}>
          🧬 {t('ai_recommendations.title')}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          {t('ai_recommendations.subtitle')}
        </p>
      </div>

      {/* 8 Crop Selection Tabs */}
      <div className="crop-tabs-scroll">
        {cropTabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            className={`crop-tab-pill ${selectedCrop === tab.key ? 'active' : ''}`}
            onClick={() => setSelectedCrop(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Wide Recommendation Cards */}
      <div className="recommendations-list">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="wide-recommendation-card">
            <div style={{ flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span className="status-badge APPROVED">{rec.pathway}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {rec.category}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', color: 'var(--green-900)', fontWeight: 700, marginBottom: '0.65rem' }}>
                {rec.utilization}
              </h3>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '1rem' }}>
                {rec.explanation}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
                <strong style={{ color: 'var(--green-800)' }}>Target Industry:</strong>
                <span style={{ color: 'var(--text-body)', background: 'var(--bg-secondary)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                  {rec.targetIndustry}
                </span>
              </div>
            </div>

            {/* Suitability Score Badge */}
            <div className="suitability-badge-lg">
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--green-800)', lineHeight: '1' }}>
                {rec.suitabilityScore}%
              </div>
              <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--green-700)', marginTop: '4px' }}>
                Suitability
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
