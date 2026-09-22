import React, { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Tooltip } from "react-tooltip";
import Papa from "papaparse";
import "./Research.css";

const macroUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";
const microUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const MACRO_DATA = [
  {
    region:"Southeast Asia",
    digital_employment:1530000, digital_growth:-0.70, digital_density:0.50, digital_demand:61.1,
    digital_supply_score:5.42, digital_demand_score:76.37, digital_balance_score:70.95, digital_balance:"Shortage",
    technical_employment:25290000, technical_growth:12.27, technical_density:8.31, technical_demand:61.1,
    technical_supply_score:21.04, technical_demand_score:76.13, technical_balance_score:55.09, technical_balance:"Shortage",
    note:"Regional aggregate based on available ILOSTAT observations. Demand pressure is JETRO hiring difficulty; talent balance is a relative min-max proxy."
  },
  {
    region:"East Asia",
    digital_employment:10492, digital_growth:1.35, digital_density:0.77, digital_demand:54.8,
    digital_supply_score:13.55, digital_demand_score:64.06, digital_balance_score:50.51, digital_balance:"Shortage",
    technical_employment:139071, technical_growth:1.74, technical_density:10.21, technical_demand:54.8,
    technical_supply_score:40.73, technical_demand_score:63.71, technical_balance_score:22.98, technical_balance:"Shortage",
    note:"Partial geographic coverage. Demand pressure is JETRO hiring difficulty; talent balance is a relative min-max proxy."
  },
  {
    region:"Europe",
    digital_employment:11050000, digital_growth:3.95, digital_density:3.33, digital_demand:73.2,
    digital_supply_score:90.66, digital_demand_score:100.00, digital_balance_score:9.34, digital_balance:"Balanced",
    technical_employment:52880000, technical_growth:1.41, technical_density:15.93, technical_demand:73.2,
    technical_supply_score:100.00, technical_demand_score:100.00, technical_balance_score:0.00, technical_balance:"Balanced",
    note:"Regional aggregate based on available European observations. Demand pressure is JETRO hiring difficulty; talent balance is a relative min-max proxy."
  },
  {
    region:"Southern Africa",
    digital_employment:6167, digital_growth:-35.62, digital_density:0.32, digital_demand:22.0,
    digital_supply_score:0.00, digital_demand_score:0.00, digital_balance_score:0.00, digital_balance:"Balanced",
    technical_employment:120910, technical_growth:-17.67, technical_density:6.28, technical_demand:22.5,
    technical_supply_score:0.00, technical_demand_score:0.00, technical_balance_score:0.00, technical_balance:"Balanced",
    note:"Partial coverage; demand pressure uses South Africa as a proxy. Talent balance is a relative min-max proxy."
  },
  {
    region:"Latin America",
    digital_employment:2520000, digital_growth:3.48, digital_density:1.37, digital_demand:64.9,
    digital_supply_score:31.63, digital_demand_score:83.79, digital_balance_score:52.16, digital_balance:"Shortage",
    technical_employment:14900000, technical_growth:2.46, technical_density:9.17, technical_demand:64.9,
    technical_supply_score:29.95, technical_demand_score:83.63, technical_balance_score:53.68, technical_balance:"Shortage",
    note:"Regional aggregate based on available Latin American observations. Demand pressure is JETRO hiring difficulty; talent balance is a relative min-max proxy."
  },
  {
    region:"North America",
    digital_employment:6190000, digital_growth:0.58, digital_density:3.64, digital_demand:61.9,
    digital_supply_score:100.00, digital_demand_score:77.93, digital_balance_score:-22.07, digital_balance:"Surplus",
    technical_employment:16760000, technical_growth:-0.01, technical_density:9.85, technical_demand:61.9,
    technical_supply_score:36.99, technical_demand_score:77.71, technical_balance_score:40.72, technical_balance:"Shortage",
    note:"Macro benchmark is based on United States observations. Demand pressure is JETRO hiring difficulty; talent balance is a relative min-max proxy."
  },
];

const COUNTRY_TO_REGION = {
  Brunei:"Southeast Asia", Cambodia:"Southeast Asia", Indonesia:"Southeast Asia", Laos:"Southeast Asia", Malaysia:"Southeast Asia", Myanmar:"Southeast Asia", Philippines:"Southeast Asia", Singapore:"Southeast Asia", Thailand:"Southeast Asia", "Timor-Leste":"Southeast Asia", Vietnam:"Southeast Asia",
  China:"East Asia", Japan:"East Asia", Mongolia:"East Asia", "South Korea":"East Asia", "North Korea":"East Asia", Taiwan:"East Asia",
  Albania:"Europe", Austria:"Europe", Belarus:"Europe", Belgium:"Europe", "Bosnia and Herzegovina":"Europe", Bulgaria:"Europe", Croatia:"Europe", Cyprus:"Europe", Czechia:"Europe", Denmark:"Europe", Estonia:"Europe", Finland:"Europe", France:"Europe", Germany:"Europe", Greece:"Europe", Hungary:"Europe", Iceland:"Europe", Ireland:"Europe", Italy:"Europe", Latvia:"Europe", Lithuania:"Europe", Luxembourg:"Europe", Malta:"Europe", Moldova:"Europe", Montenegro:"Europe", Netherlands:"Europe", "North Macedonia":"Europe", Norway:"Europe", Poland:"Europe", Portugal:"Europe", Romania:"Europe", Serbia:"Europe", Slovakia:"Europe", Slovenia:"Europe", Spain:"Europe", Sweden:"Europe", Switzerland:"Europe", Ukraine:"Europe", "United Kingdom":"Europe",
  Botswana:"Southern Africa", Eswatini:"Southern Africa", Lesotho:"Southern Africa", Namibia:"Southern Africa", "South Africa":"Southern Africa",
  Argentina:"Latin America", Bolivia:"Latin America", Brazil:"Latin America", Chile:"Latin America", Colombia:"Latin America", Ecuador:"Latin America", Guyana:"Latin America", Paraguay:"Latin America", Peru:"Latin America", Suriname:"Latin America", Uruguay:"Latin America", Venezuela:"Latin America", Mexico:"Latin America", Belize:"Latin America", Guatemala:"Latin America", Honduras:"Latin America", "El Salvador":"Latin America", Nicaragua:"Latin America", "Costa Rica":"Latin America", Panama:"Latin America", Cuba:"Latin America", Haiti:"Latin America", "Dominican Republic":"Latin America", Jamaica:"Latin America", Bahamas:"Latin America",
  "United States of America":"North America", "United States":"North America"
};

const STATE_FIPS = { Alabama:1, Alaska:2, Arizona:4, Arkansas:5, California:6, Colorado:8, Connecticut:9, Delaware:10, "District of Columbia":11, Florida:12, Georgia:13, Hawaii:15, Idaho:16, Illinois:17, Indiana:18, Iowa:19, Kansas:20, Kentucky:21, Louisiana:22, Maine:23, Maryland:24, Massachusetts:25, Michigan:26, Minnesota:27, Mississippi:28, Missouri:29, Montana:30, Nebraska:31, Nevada:32, "New Hampshire":33, "New Jersey":34, "New Mexico":35, "New York":36, "North Carolina":37, "North Dakota":38, Ohio:39, Oklahoma:40, Oregon:41, Pennsylvania:42, "Rhode Island":44, "South Carolina":45, "South Dakota":46, Tennessee:47, Texas:48, Utah:49, Vermont:50, Virginia:51, Washington:53, "West Virginia":54, Wisconsin:55, Wyoming:56 };

const fmtEmp = v => v == null || Number.isNaN(+v) ? "—" : +v >= 1e6 ? `${(+v/1e6).toFixed(2)}M` : +v >= 1e3 ? `${(+v/1e3).toFixed(1)}K` : (+v).toLocaleString();
const fmtPct = (v, signed=false) => v == null || Number.isNaN(+v) ? "—" : `${signed && +v > 0 ? "+" : ""}${(+v).toFixed(2)}%`;

function transformMicroData(rows) {
  const states = {};
  rows.forEach(row => {
    const state = row.State?.trim();
    const talent = row.Talent?.trim()?.toLowerCase();
    if (!state || !["digital","technical"].includes(talent)) return;
    if (!states[state]) states[state] = { name:state, id:STATE_FIPS[state] };
    const r = states[state];
    r[`${talent}_employment`] = +row.Employment_2025;
    r[`${talent}_growth`] = +row.Growth_2024_2025_pct;
    r[`${talent}_density`] = +row.Workforce_Density_pct;
    r[`${talent}_demand`] = +row.Demand_Pressure_pct;
    r[`${talent}_projection_base`] = +(row.Projection_Base || 0);
    r[`${talent}_projection_2034`] = +(row.Projection_2034 || 0);
    r[`${talent}_annual_openings`] = +(row.Projected_Annual_Openings || row.Annual_Openings || 0);
    r[`${talent}_projected_growth`] = +(row.Projected_Growth_pct || 0);
    r[`${talent}_demand_intensity`] = +(row.Demand_Intensity_pct || row.Annual_Openings_Rate_pct || 0);
    r[`${talent}_demand_score`] = +(row.Demand_Intensity_Pctl || 0);
    r[`${talent}_supply_score`] = +(row.Supply_Density_Pctl || 0);
    r[`${talent}_balance_score`] = +(row.Talent_Balance_Score || row.Balance_Index || 0);
    r[`${talent}_balance`] = row.Talent_Balance || "Balanced";
  });
  return Object.values(states);
}

export default function App() {
  const [view,setView] = useState("macro");
  const [talentType,setTalentType] = useState("digital");
  const [metric,setMetric] = useState("demand");
  const [microData,setMicroData] = useState([]);
  const [microError,setMicroError] = useState("");
  const [tooltipContent,setTooltipContent] = useState(null);

  useEffect(() => {
    Papa.parse("/us_micro_talent_heatmap_updated.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().replace(/^\uFEFF/, ""),
      complete: (result) => {
        const parsed = transformMicroData(result.data);
        if (!parsed.length) {
          const headers = result.meta?.fields?.join(", ") || "none";
          setMicroData([]);
          setMicroError(`CSV loaded but parsed 0 states. Headers: ${headers}`);
          return;
        }
        setMicroData(parsed);
        setMicroError("");
        console.log(`Loaded ${parsed.length} U.S. jurisdictions from CSV`);
      },
      error: (error) => {
        console.error("Failed to load micro talent dataset:", error);
        setMicroData([]);
        setMicroError(error?.message || "Failed to load /us_micro_talent_heatmap_updated.csv");
      },
    });
  }, []);

  const activeData = view === "macro" ? MACRO_DATA : microData;
  const metricOptions = useMemo(() => [
    {key:"employment",label:"Employment"},
    {key:"growth",label:"Employment Growth"},
    {key:"density",label:"Workforce Density"},
    {key:"demand",label:view === "macro" ? "Hiring Difficulty" : "Occupational Demand Intensity"},
    {key:"balance",label:"Talent Balance"}
  ], [view]);

  const values = useMemo(() => metric === "balance" ? [] : activeData.map(r => +r[`${talentType}_${metric}`]).filter(Number.isFinite), [activeData,talentType,metric]);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const seq = useMemo(() => scaleLinear().domain([min,max === min ? min+1 : max]).range(["#dbeafe","#1d4ed8"]).clamp(true), [min,max]);
  const maxAbs = Math.max(Math.abs(min),Math.abs(max),1);
  const growth = useMemo(() => scaleLinear().domain([-maxAbs,0,maxAbs]).range(["#ef4444","#f8fafc","#10b981"]).clamp(true), [maxAbs]);
  const balanceColors = { Shortage:"#f43f5e", Balanced:"#f59e0b", Surplus:"#10b981" };

  const microByFips = useMemo(() => {
    const map = new Map();
    microData.forEach(r => {
      if (r.id != null) map.set(String(r.id).padStart(2, "0"), r);
    });
    return map;
  }, [microData]);

  const microByName = useMemo(() => {
    const map = new Map();
    microData.forEach(r => map.set(r.name, r));
    return map;
  }, [microData]);

  const findRecord = geo => {
    if (view === "macro") {
      const region = COUNTRY_TO_REGION[geo.properties?.name || ""];
      return region ? MACRO_DATA.find(r => r.region === region) : null;
    }

    // us-atlas can expose the state identifier differently depending on
    // react-simple-maps/topojson versions. Resolve by FIPS first, then name,
    // then the rsmKey (usually "geo-01", "geo-06", etc.).
    const rawId = geo.id ?? geo.properties?.STATEFP ?? geo.properties?.statefp;
    if (rawId != null) {
      const byId = microByFips.get(String(rawId).padStart(2, "0"));
      if (byId) return byId;
    }

    const name = geo.properties?.name || geo.properties?.NAME;
    if (name && microByName.has(name)) return microByName.get(name);

    const keyMatch = String(geo.rsmKey || "").match(/(\d{1,2})$/);
    if (keyMatch) return microByFips.get(keyMatch[1].padStart(2, "0")) || null;

    return null;
  };

  const fillFor = record => {
    if (!record) return "#e2e8f0";
    if (metric === "balance") return balanceColors[record[`${talentType}_balance`]] || "#e2e8f0";
    const v = +record[`${talentType}_${metric}`];
    return Number.isFinite(v) ? (metric === "growth" ? growth(v) : seq(v)) : "#e2e8f0";
  };

  const tooltip = record => {
    if (!record) return null;
    const label = view === "macro" ? record.region : record.name;
    const balance = record[`${talentType}_balance`];
    return <div className="tooltip-box">
      <strong className="tooltip-title">{label}</strong>
      <div className="tooltip-sub">{talentType === "digital" ? "Digital Talent" : "Technical Talent"}</div>
      <div>Employment: <b>{fmtEmp(record[`${talentType}_employment`])}</b></div>
      <div>Employment Growth: <b>{fmtPct(record[`${talentType}_growth`],true)}</b></div>
      <div>Workforce Density: <b>{fmtPct(record[`${talentType}_density`])}</b></div>
      <div>{view === "macro" ? "Hiring Difficulty" : "Occupational Demand Intensity"}: <b>{fmtPct(record[`${talentType}_demand`])}</b></div>
      {view === "micro" && <>
        <div>Annual Openings: <b>{(+record[`${talentType}_annual_openings`] || 0).toLocaleString()}</b></div>
        <div>Demand Percentile: <b>{(+record[`${talentType}_demand_score`] || 0).toFixed(2)}</b></div>
        <div>Supply Percentile: <b>{(+record[`${talentType}_supply_score`] || 0).toFixed(2)}</b></div>
      </>}
      {view === "macro" && <>
        <div>Normalized Demand Score: <b>{(+record[`${talentType}_demand_score`] || 0).toFixed(2)}</b></div>
        <div>Normalized Supply Score: <b>{(+record[`${talentType}_supply_score`] || 0).toFixed(2)}</b></div>
      </>}
      <div>Balance Index: <b>{(+record[`${talentType}_balance_score`] || 0).toFixed(2)}</b></div>
      <div>Talent Balance: <b style={{color:balanceColors[balance]}}>{balance || "—"}</b></div>
      {view === "macro" && record.note && <div className="tooltip-note">{record.note}</div>}
    </div>;
  };

  return <div className="research-dashboard"><div className="module-stack">
    <div className="header"><h1>Global Talent Benchmarking</h1><p>Digital and Technical Talent Supply, Growth, Demand and Relative Balance</p></div>

    <div className="card">
      <div className="controls">
        <div className="control-group">
          <button className={`btn ${view === "macro" ? "active" : ""}`} onClick={() => setView("macro")}>Global Macro</button>
          <button className={`btn ${view === "micro" ? "active" : ""}`} onClick={() => setView("micro")}>United States Micro</button>
        </div>
        <div className="control-group">
          <button className={`btn ${talentType === "digital" ? "active" : ""}`} onClick={() => setTalentType("digital")}>Digital</button>
          <button className={`btn ${talentType === "technical" ? "active" : ""}`} onClick={() => setTalentType("technical")}>Technical</button>
        </div>
      </div>

      <div className="metric-selector"><span className="metric-label">Heatmap Metric</span><div className="metric-buttons">
        {metricOptions.map(o => <button key={o.key} className={`metric-btn ${metric === o.key ? "active" : ""}`} onClick={() => setMetric(o.key)}>{o.label}</button>)}
      </div></div>

      {view === "micro" && microError && <div className="data-error">Micro CSV error: {microError}</div>}
      {view === "micro" && !microError && microData.length === 0 && <div className="data-loading">Loading U.S. micro data…</div>}
      {view === "micro" && !microError && microData.length > 0 && <div className="data-loaded">Loaded {microData.length} U.S. jurisdictions</div>}

      <div className="map-container">
        <ComposableMap projection={view === "macro" ? "geoMercator" : "geoAlbersUsa"} projectionConfig={view === "macro" ? {scale:135,center:[10,15]} : {scale:820}}>
          <Geographies geography={view === "macro" ? macroUrl : microUrl}>
            {({geographies}) => geographies.map(geo => {
              const record = findRecord(geo);
              return <Geography key={geo.rsmKey} geography={geo} fill={fillFor(record)} stroke="#cbd5e1" strokeWidth={0.5}
                onMouseEnter={() => setTooltipContent(record ? tooltip(record) : <div><b>{geo.properties?.name || "No Data"}</b><div>No benchmark data available.</div></div>)}
                onMouseLeave={() => setTooltipContent(null)}
                style={{default:{outline:"none",transition:"fill 200ms"},hover:{outline:"none",stroke:"#0f172a",strokeWidth:1.25,cursor:record?"pointer":"default"},pressed:{outline:"none"}}}
                data-tooltip-id="app-tooltip" />;
            })}
          </Geographies>
        </ComposableMap>

        <div className="heatmap-legend">
          <span className="legend-title">{metricOptions.find(o => o.key === metric)?.label}</span>
          {metric === "balance" ? <div className="legend-items">{Object.entries(balanceColors).map(([k,c]) => <span key={k}><i style={{background:c}} />{k}</span>)}</div> :
          <div className="continuous-legend"><span>{metric === "employment" ? fmtEmp(min) : fmtPct(min,metric === "growth")}</span><div className={`legend-gradient ${metric === "growth" ? "growth-gradient" : ""}`} /><span>{metric === "employment" ? fmtEmp(max) : fmtPct(max,metric === "growth")}</span></div>}
        </div>
      </div>
    </div>

    <div className="card">
      <div className="table-heading"><div><h3>{view === "macro" ? "Macro Talent Benchmark" : "U.S. State Talent Benchmark"}</h3><p>{talentType === "digital" ? "Digital Talent" : "Technical Talent"}</p></div></div>
      <div className="table-scroll"><table className="data-grid"><thead><tr>
        <th>{view === "macro" ? "Region" : "State"}</th>
        <th>Employment</th><th>Growth</th><th>Workforce Density</th>
        <th>{view === "macro" ? "Hiring Difficulty" : "Occupational Demand Intensity"}</th>
        {view === "micro" && <th>Annual Openings</th>}
        <th>{view === "macro" ? "Demand Score" : "Demand Pctl."}</th>
        <th>{view === "macro" ? "Supply Score" : "Supply Pctl."}</th>
        <th>Balance Index</th><th>Talent Balance</th>
      </tr></thead>
      <tbody>{[...activeData].sort((a,b) => (+b[`${talentType}_employment`]||0)-(+a[`${talentType}_employment`]||0)).map((r,i) => {
        const label=view === "macro"?r.region:r.name;
        const bal=r[`${talentType}_balance`];
        return <tr key={`${label}-${i}`}>
          <td className="region-name">{label}</td>
          <td>{fmtEmp(r[`${talentType}_employment`])}</td>
          <td>{fmtPct(r[`${talentType}_growth`],true)}</td>
          <td>{fmtPct(r[`${talentType}_density`])}</td>
          <td>{fmtPct(r[`${talentType}_demand`])}</td>
          {view === "micro" && <td>{(+r[`${talentType}_annual_openings`]||0).toLocaleString()}</td>}
          <td>{(+r[`${talentType}_demand_score`]||0).toFixed(2)}</td>
          <td>{(+r[`${talentType}_supply_score`]||0).toFixed(2)}</td>
          <td>{(+r[`${talentType}_balance_score`]||0).toFixed(2)}</td>
          <td><span className="balance-pill" style={{color:balanceColors[bal]}}>{bal || "—"}</span></td>
        </tr>;
      })}</tbody></table></div>
    </div>
  </div>
  <Tooltip id="app-tooltip" place="top" style={{backgroundColor:"#1e293b",color:"#fff",borderRadius:"8px",zIndex:1000,padding:"12px 14px",boxShadow:"0 10px 25px rgba(15,23,42,.25)"}}>{tooltipContent}</Tooltip>
  </div>;
}
