import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleOrdinal } from 'd3-scale';
import { Tooltip } from 'react-tooltip';
import './Research.css';

// Ordinal scale for defensible consulting metrics (Pressure instead of absolute counts)
const colorScale = scaleOrdinal()
  .domain(["High", "Medium", "Stable"])
  .range(["#f43f5e", "#f59e0b", "#10b981"]); // Rose (High), Amber (Medium), Emerald (Stable)

const macroUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";
const microUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Hardcoded audited baselines to bypass CSV parsing risks for the presentation
const AUDITED_DATA = {
  macro: [
    {
      id: 276, // Germany (Proxy for EU-27)
      region: "Europe (EU-27)",
      digital_baseline: "10.45M",
      digital_pressure: "High",
      digital_evidence: "EU 2030 target mandates 20.0M; EC projects baseline reaches only ~12.2M by 2030.",
      technical_baseline: "1.14M",
      technical_pressure: "Medium",
      technical_evidence: "EU Chips Act targets 20% global fab share; specialized assembly shortages.",
      source: "Eurostat (LFS / SBS) / EC 2026 Report"
    },
    {
      id: 392, // Japan
      region: "East Asia (Japan)",
      digital_baseline: "4.01M",
      digital_pressure: "High",
      digital_evidence: "METI published 2030 shortage projection outlines gap of up to ~790k IT personnel.",
      technical_baseline: "586k",
      technical_pressure: "Medium",
      technical_evidence: "2nm fab initiatives constrained by natural senior engineering attrition.",
      source: "OECD STAN / METI"
    },
    {
      id: 608, // Philippines
      region: "Southeast Asia (Philippines)",
      digital_baseline: "427k",
      digital_pressure: "High",
      digital_evidence: "IT-BPM value escalation towards cloud/data analytics; STEM pipelines <20%.",
      technical_baseline: "483k",
      technical_pressure: "High",
      technical_evidence: "Heavy demand for test/packaging engineers for semiconductor exports (>55%).",
      source: "PSA (LFS Table 4) / SEIPI"
    },
    {
      id: 704, // Vietnam
      region: "Southeast Asia (Vietnam)",
      digital_baseline: "328k",
      digital_pressure: "High",
      digital_evidence: "Targeting 30% digital GDP share; formal engineering capacity meets <50% of demand.",
      technical_baseline: "1.28M",
      technical_pressure: "High",
      technical_evidence: "FDI influx drives high demand for semiconductor assembly and QA engineers.",
      source: "GSO Vietnam / ILOSTAT"
    }
  ],
  micro: [
    {
      id: 51, // Virginia
      region: "Virginia",
      digital_baseline: "241,530",
      digital_pressure: "High",
      digital_evidence: "Dense concentration in hyperscale cloud facilities and federal cyber contracting (LQ: 1.78).",
      technical_baseline: "48,200",
      technical_pressure: "Medium",
      technical_evidence: "Steady defense manufacturing base; specialized aerospace component demand.",
      source: "U.S. BLS (OEWS SOC 15-0000 / 17-0000)"
    },
    {
      id: 53, // Washington
      region: "Washington",
      digital_baseline: "214,780",
      digital_pressure: "High",
      digital_evidence: "Enterprise cloud platforms & software engineering hub; Seattle MSA LQ: 2.42.",
      technical_baseline: "62,100",
      technical_pressure: "High",
      technical_evidence: "Severe competition for avionics and advanced manufacturing engineering.",
      source: "U.S. BLS (OEWS SOC 15-0000 / 17-0000)"
    },
    {
      id: 6, // California
      region: "California",
      digital_baseline: "759,060",
      digital_pressure: "Medium",
      digital_evidence: "Massive supply volume offset by aggressive global competition in frontier AI (LQ: 1.24).",
      technical_baseline: "185,400",
      technical_pressure: "High",
      technical_evidence: "Hardware engineering bottlenecks for semiconductor design and EV production.",
      source: "U.S. BLS (OEWS SOC 15-0000 / 17-0000)"
    },
    {
      id: 48, // Texas
      region: "Texas",
      digital_baseline: "490,410",
      digital_pressure: "Medium",
      digital_evidence: "Rapid corporate HQ absorption; tech corridors expanding across Austin/Dallas (LQ: 1.06).",
      technical_baseline: "142,300",
      technical_pressure: "Medium",
      technical_evidence: "Expanding semiconductor fab footprint (Silicon Hills) demanding process engineers.",
      source: "U.S. BLS (OEWS SOC 15-0000 / 17-0000)"
    }
  ]
};

export default function App() {
  const [view, setView] = useState('macro');
  const [talentType, setTalentType] = useState('digital');
  const [tooltipContent, setTooltipContent] = useState(null);

  const activeData = AUDITED_DATA[view];
  const geoUrl = view === 'macro' ? macroUrl : microUrl;
  const proj = view === 'macro' ? "geoMercator" : "geoAlbersUsa";
  const projScale = view === 'macro' ? 130 : 800;

  return (
    <div className="research-dashboard">
      <div className="module-stack">
        
        <div className="header">
          <h1>Global Talent Benchmarking</h1>
          <p>Structural Headcount Baselines vs. Talent Market Pressure Indices</p>
        </div>

        <div className="card">
          <div className="controls" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <button className={`btn ${view === 'macro' ? 'active' : ''}`} onClick={() => setView('macro')}>
                Global Macro View (ISIC/NACE)
              </button>
              <button className={`btn ${view === 'micro' ? 'active' : ''}`} onClick={() => setView('micro')}>
                North America Micro View (BLS)
              </button>
            </div>
            <div>
              <button className={`btn ${talentType === 'digital' ? 'active' : ''}`} onClick={() => setTalentType('digital')}>
                Digital (ICT Specialists)
              </button>
              <button className={`btn ${talentType === 'technical' ? 'active' : ''}`} onClick={() => setTalentType('technical')}>
                Technical (Hardware/Mfg)
              </button>
            </div>
          </div>
          
          <div style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", padding: "20px" }}>
            <ComposableMap projection={proj} projectionConfig={{ scale: projScale }}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    if (!geo.id) return null;
                    
                    // Match mathematical numeric IDs
                    const d = activeData.find((s) => Number(s.id) === Number(geo.id));
                    const currentPressure = d ? d[`${talentType}_pressure`] : null;
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        // Applies the High/Medium/Stable color scale
                        fill={d ? colorScale(currentPressure) : "#e2e8f0"}
                        stroke="#cbd5e1"
                        strokeWidth={0.5}
                        onMouseEnter={() => {
                          if (d) {
                            setTooltipContent(
                              <div style={{ textAlign: 'left', maxWidth: '280px' }}>
                                <strong>{d.region}</strong><br/>
                                <span style={{ color: '#94a3b8', fontSize: '12px' }}>Baseline:</span> {d[`${talentType}_baseline`]}<br/>
                                <span style={{ color: '#94a3b8', fontSize: '12px' }}>Gap Status:</span> <strong style={{ color: colorScale(currentPressure) }}>{currentPressure} Pressure</strong><br/>
                                <div style={{ marginTop: '6px', fontSize: '11px', lineHeight: '1.4' }}>{d[`${talentType}_evidence`]}</div>
                                <div style={{ marginTop: '8px', fontSize: '10px', color: '#64748b', borderTop: '1px solid #334155', paddingTop: '4px' }}>Source: {d.source}</div>
                              </div>
                            );
                          } else {
                            setTooltipContent(geo.properties.name || "No Audited Data");
                          }
                        }}
                        onMouseLeave={() => setTooltipContent(null)}
                        style={{
                          default: { outline: "none", transition: "all 250ms" },
                          hover: { outline: "none", stroke: "#333", strokeWidth: 1.5, cursor: "pointer" },
                          pressed: { outline: "none" }
                        }}
                        data-tooltip-id="app-tooltip"
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>
        </div>

        <div className="card">
          <h3 style={{marginBottom: '16px', color: '#1e293b'}}>Institutional Dataset (Latest Audited)</h3>
          <table className="data-grid" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{textAlign: "left", padding: '8px 4px'}}>Target Region / State</th>
                <th style={{textAlign: "right", padding: '8px 4px'}}>Digital Baseline</th>
                <th style={{textAlign: "right", padding: '8px 4px'}}>Digital Pressure</th>
                <th style={{textAlign: "right", padding: '8px 4px'}}>Technical Baseline</th>
                <th style={{textAlign: "right", padding: '8px 4px'}}>Technical Pressure</th>
              </tr>
            </thead>
            <tbody>
              {activeData.map((region, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{textAlign: "left", fontWeight: "500", padding: '12px 4px'}}>{region.region}</td>
                  <td style={{textAlign: "right", padding: '12px 4px'}}>{region.digital_baseline}</td>
                  <td style={{textAlign: "right", padding: '12px 4px', color: colorScale(region.digital_pressure), fontWeight: 'bold'}}>{region.digital_pressure}</td>
                  <td style={{textAlign: "right", padding: '12px 4px'}}>{region.technical_baseline}</td>
                  <td style={{textAlign: "right", padding: '12px 4px', color: colorScale(region.technical_pressure), fontWeight: 'bold'}}>{region.technical_pressure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
      <Tooltip id="app-tooltip" place="top" style={{ backgroundColor: "#1e293b", color: "#FFF", borderRadius: "6px", zIndex: 1000 }}>
        {tooltipContent}
      </Tooltip>
    </div>
  );
}