import React, { useEffect, useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Tooltip } from "react-tooltip";
import Papa from "papaparse";
import "./Research.css";

const macroUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

const microUrl =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Place the occupation-level source file in the app's public folder.
const microSocUrl = "/micro_soc(1).csv";

/* =========================================================
   MACRO DATA
   ========================================================= */

const MACRO_INPUTS = [
  {
    region: "Southeast Asia",
    digital_employment: 1530000,
    digital_growth: -0.70,
    digital_density: 0.50,
    digital_demand: 45.5,
    digital_supply_score: 0.00,
    digital_demand_score: 34.24,
    digital_balance_score: 34.24,
    digital_balance: "Shortage",
    digital_skills: ["Generative AI", "AI / Machine Learning", "Cybersecurity", "Data Analytics"],

    technical_employment: 25290000,
    technical_growth: 12.27,
    technical_density: 8.31,
    technical_demand: 45.5,
    technical_supply_score: 2.67,
    technical_demand_score: 34.24,
    technical_balance_score: 31.57,
    technical_balance: "Shortage",
    technical_skills: ["Production / Process Operations", "Machinery & Fabrication", "Engineering Technicians", "Assembly / Manufacturing"],

    digital_salary: 22626,
    technical_salary: 11091,

    coverage_note: "Employment is based on available ILOSTAT observations. Demand pressure is JETRO FY2024 expansion intent. Salary is annualized ILOSTAT 2021 PPP hourly earnings.",
  },
  {
    region: "East Asia",
    digital_employment: 10492000,
    digital_growth: 1.35,
    digital_density: 0.77,
    digital_demand: 54.8,
    digital_supply_score: 10.23,
    digital_demand_score: 0.00,
    digital_balance_score: -10.23,
    digital_balance: "Balanced",
    digital_skills: ["AI / Machine Learning", "Generative AI", "Cybersecurity", "Data Analytics"],

    technical_employment: 139071000,
    technical_growth: 1.74,
    technical_density: 10.21,
    technical_demand: 54.8,
    technical_supply_score: 27.99,
    technical_demand_score: 0.00,
    technical_balance_score: -27.99,
    technical_balance: "Surplus",
    technical_skills: ["Engineering & Technical Design", "Assembly / Manufacturing", "Machinery & Fabrication", "Production / Process Operations"],

    digital_salary: 21388,
    technical_salary: 21665,

    coverage_note: "Partial geographic coverage. Uses the former East Asia macro benchmark values.",
  },
  {
    region: "Europe",
    digital_employment: 11050000,
    digital_growth: 3.95,
    digital_density: 3.33,
    digital_demand: 46.2,
    digital_supply_score: 90.21,
    digital_demand_score: 100.00,
    digital_balance_score: 9.79,
    digital_balance: "Balanced",
    digital_skills: ["AI / Machine Learning", "Generative AI", "Cybersecurity", "Data Analytics"],

    technical_employment: 52880000,
    technical_growth: 1.41,
    technical_density: 15.93,
    technical_demand: 46.2,
    technical_supply_score: 100.00,
    technical_demand_score: 100.00,
    technical_balance_score: 0.00,
    technical_balance: "Balanced",
    technical_skills: ["Engineering & Technical Design", "Machinery & Fabrication", "Engineering Technicians", "Production / Process Operations"],

    digital_salary: 47116,
    technical_salary: 32261,

    coverage_note: "Employment is based on available ILOSTAT observations. Demand pressure is JETRO FY2024 expansion intent. Salary is annualized ILOSTAT 2021 PPP hourly earnings.",
  },
  {
    region: "Latin America & Caribbean",
    digital_employment: 2520000,
    digital_growth: 3.48,
    digital_density: 1.37,
    digital_demand: 51.5,
    digital_supply_score: 27.12,
    digital_demand_score: 54.89,
    digital_balance_score: 27.77,
    digital_balance: "Shortage",
    digital_skills: ["Generative AI", "Cybersecurity", "AI / Machine Learning", "Data Analytics"],

    technical_employment: 14900000,
    technical_growth: 2.46,
    technical_density: 8.10,
    technical_demand: 51.5,
    technical_supply_score: 0.00,
    technical_demand_score: 54.89,
    technical_balance_score: 54.89,
    technical_balance: "Shortage",
    technical_skills: ["Machinery & Fabrication", "Production / Process Operations", "Engineering Technicians", "Engineering & Technical Design"],

    digital_salary: 27143,
    technical_salary: 14211,

    coverage_note: "Employment is based on available ILOSTAT observations. Demand pressure is JETRO FY2024 expansion intent. Salary is annualized ILOSTAT 2021 PPP hourly earnings.",
  },
  {
    region: "North America",
    digital_employment: 6190000,
    digital_growth: 0.58,
    digital_density: 3.64,
    digital_demand: 47.0,
    digital_supply_score: 100.00,
    digital_demand_score: 38.59,
    digital_balance_score: -61.41,
    digital_balance: "Surplus",
    digital_skills: ["AI / Machine Learning", "Generative AI", "Cybersecurity", "Data Analytics"],

    technical_employment: 16760000,
    technical_growth: -0.01,
    technical_density: 9.85,
    technical_demand: 47.0,
    technical_supply_score: 22.45,
    technical_demand_score: 38.59,
    technical_balance_score: 16.14,
    technical_balance: "Shortage",
    technical_skills: ["Engineering & Technical Design", "Machinery & Fabrication", "Engineering Technicians", "Electrical / Electronics Trades"],

    digital_salary: 110945,
    technical_salary: 71915,

    coverage_note: "North America is based on United States observations. Demand pressure is JETRO FY2024 expansion intent. Salary is annualized ILOSTAT 2021 PPP hourly earnings.",
  },
  {
    region: "South Asia",
    digital_employment: 4928715, digital_growth: 0.20, digital_density: 0.76, digital_demand: 69.0,
    digital_supply_score: 16.85, digital_demand_score: 100.00, digital_balance_score: 83.15, digital_balance: "Shortage",
    digital_skills: ["Generative AI", "AI / Machine Learning", "Cybersecurity", "Data Analytics"], digital_salary: 11605,
    technical_employment: 36011476, technical_growth: 8.50, technical_density: 5.57, technical_demand: 69.0,
    technical_supply_score: 21.32, technical_demand_score: 100.00, technical_balance_score: 78.68, technical_balance: "Shortage",
    technical_skills: ["Engineering & Technical Design", "Machinery & Fabrication", "Production / Process Operations", "Assembly / Manufacturing"], technical_salary: 7349,
    coverage_note: "Employment is based on available ILOSTAT observations. Demand pressure is JETRO FY2024 expansion intent. Salary is annualized ILOSTAT 2021 PPP hourly earnings.",
  },
  {
    region: "Central Asia",
    digital_employment: 28405, digital_growth: 65.35, digital_density: 0.58, digital_demand: 45.2,
    digital_supply_score: 11.97, digital_demand_score: 42.65, digital_balance_score: 30.68, digital_balance: "Shortage",
    digital_skills: ["Generative AI", "AI / Machine Learning", "Cybersecurity", "Data Analytics"], digital_salary: null,
    technical_employment: 413323, technical_growth: 79.93, technical_density: 8.51, technical_demand: 45.2,
    technical_supply_score: 44.31, technical_demand_score: 42.65, technical_balance_score: -1.66, technical_balance: "Balanced",
    technical_skills: ["Engineering & Technical Design", "Machinery & Fabrication", "Production / Process Operations", "Assembly / Manufacturing"], technical_salary: null,
    coverage_note: "Employment is based on available ILOSTAT observations. Demand pressure uses the JETRO global expansion-intent proxy. No comparable PPP wage observation was available.",
  },
  {
    region: "Middle East",
    digital_employment: 627534, digital_growth: 20.65, digital_density: 1.18, digital_demand: 49.0,
    digital_supply_score: 28.39, digital_demand_score: 51.81, digital_balance_score: 23.42, digital_balance: "Shortage",
    digital_skills: ["Generative AI", "AI / Machine Learning", "Cybersecurity", "Data Analytics"], digital_salary: 25805,
    technical_employment: 6556651, technical_growth: 30.35, technical_density: 12.35, technical_demand: 49.0,
    technical_supply_score: 74.33, technical_demand_score: 51.81, technical_balance_score: -22.52, technical_balance: "Surplus",
    technical_skills: ["Engineering & Technical Design", "Machinery & Fabrication", "Production / Process Operations", "Assembly / Manufacturing"], technical_salary: 14505,
    coverage_note: "Employment is based on available ILOSTAT observations. Demand pressure is JETRO FY2024 expansion intent. Salary is annualized ILOSTAT 2021 PPP hourly earnings.",
  },
  {
    region: "Oceania",
    digital_employment: 501097, digital_growth: 3.16, digital_density: 2.60, digital_demand: 50.3,
    digital_supply_score: 67.49, digital_demand_score: 54.94, digital_balance_score: -12.55, digital_balance: "Balanced",
    digital_skills: ["Generative AI", "AI / Machine Learning", "Cybersecurity", "Data Analytics"], digital_salary: 16009,
    technical_employment: 1852160, technical_growth: 13.16, technical_density: 9.63, technical_demand: 50.3,
    technical_supply_score: 53.05, technical_demand_score: 54.94, technical_balance_score: 1.89, technical_balance: "Balanced",
    technical_skills: ["Engineering & Technical Design", "Machinery & Fabrication", "Production / Process Operations", "Assembly / Manufacturing"], technical_salary: 11455,
    coverage_note: "Employment is based on available ILOSTAT observations. Demand pressure uses Australia as the JETRO expansion-intent proxy. Salary is annualized ILOSTAT 2021 PPP hourly earnings.",
  },
  {
    region: "North Africa",
    digital_employment: 156280, digital_growth: 59.18, digital_density: 0.33, digital_demand: 56.0,
    digital_supply_score: 5.00, digital_demand_score: 68.67, digital_balance_score: 63.67, digital_balance: "Shortage",
    digital_skills: ["Generative AI", "AI / Machine Learning", "Cybersecurity", "Data Analytics"], digital_salary: 13231,
    technical_employment: 4564322, technical_growth: 25.37, technical_density: 9.67, technical_demand: 56.0,
    technical_supply_score: 53.44, technical_demand_score: 68.67, technical_balance_score: 15.23, technical_balance: "Shortage",
    technical_skills: ["Engineering & Technical Design", "Machinery & Fabrication", "Production / Process Operations", "Assembly / Manufacturing"], technical_salary: 8343,
    coverage_note: "Employment is based on available ILOSTAT observations. Demand pressure uses the JETRO Africa expansion-intent proxy. Salary is annualized ILOSTAT 2021 PPP hourly earnings.",
  },
  {
    region: "West Africa",
    digital_employment: 231294, digital_growth: 21.68, digital_density: 0.15, digital_demand: 56.0,
    digital_supply_score: 0.00, digital_demand_score: 68.67, digital_balance_score: 68.67, digital_balance: "Shortage",
    digital_skills: ["Generative AI", "AI / Machine Learning", "Cybersecurity", "Data Analytics"], digital_salary: 13218,
    technical_employment: 6202504, technical_growth: 20.84, technical_density: 4.00, technical_demand: 56.0,
    technical_supply_score: 9.08, technical_demand_score: 68.67, technical_balance_score: 59.59, technical_balance: "Shortage",
    technical_skills: ["Engineering & Technical Design", "Machinery & Fabrication", "Production / Process Operations", "Assembly / Manufacturing"], technical_salary: 8545,
    coverage_note: "Employment is based on available ILOSTAT observations. Demand pressure uses the JETRO Africa expansion-intent proxy. Salary is annualized ILOSTAT 2021 PPP hourly earnings.",
  },
  {
    region: "Central Africa",
    digital_employment: 116700, digital_growth: 167.02, digital_density: 0.25, digital_demand: 56.0,
    digital_supply_score: 2.84, digital_demand_score: 68.67, digital_balance_score: 65.83, digital_balance: "Shortage",
    digital_skills: ["Generative AI", "AI / Machine Learning", "Cybersecurity", "Data Analytics"], digital_salary: 10615,
    technical_employment: 1551553, technical_growth: -9.35, technical_density: 3.36, technical_demand: 56.0,
    technical_supply_score: 4.06, technical_demand_score: 68.67, technical_balance_score: 64.61, technical_balance: "Shortage",
    technical_skills: ["Engineering & Technical Design", "Machinery & Fabrication", "Production / Process Operations", "Assembly / Manufacturing"], technical_salary: 5114,
    coverage_note: "Employment is based on available ILOSTAT observations. Demand pressure uses the JETRO Africa expansion-intent proxy. Salary is annualized ILOSTAT 2021 PPP hourly earnings.",
  },
  {
    region: "East Africa",
    digital_employment: 519182, digital_growth: 597.53, digital_density: 0.32, digital_demand: 56.0,
    digital_supply_score: 4.70, digital_demand_score: 68.67, digital_balance_score: 63.97, digital_balance: "Shortage",
    digital_skills: ["Generative AI", "AI / Machine Learning", "Cybersecurity", "Data Analytics"], digital_salary: 14021,
    technical_employment: 4608502, technical_growth: -2.59, technical_density: 2.84, technical_demand: 56.0,
    technical_supply_score: 0.00, technical_demand_score: 68.67, technical_balance_score: 68.67, technical_balance: "Shortage",
    technical_skills: ["Engineering & Technical Design", "Machinery & Fabrication", "Production / Process Operations", "Assembly / Manufacturing"], technical_salary: 6008,
    coverage_note: "Employment is based on available ILOSTAT observations. Demand pressure uses the JETRO Africa expansion-intent proxy. Salary is annualized ILOSTAT 2021 PPP hourly earnings.",
  },
];

const normaliseScore = (value, values) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 0;
  return Math.round(((value - min) / (max - min)) * 10000) / 100;
};

const macroDensity = {
  Digital: MACRO_INPUTS.map((row) => row.digital_density),
  Technical: MACRO_INPUTS.map((row) => row.technical_density),
};

const macroDemand = {
  Digital: MACRO_INPUTS.map((row) => row.digital_demand),
  Technical: MACRO_INPUTS.map((row) => row.technical_demand),
};

const getBalanceLabel = (score) =>
  score >= 15 ? "Shortage" : score <= -15 ? "Surplus" : "Balanced";

const MACRO_DATA = MACRO_INPUTS.map((row) => {
  const digitalSupply = normaliseScore(row.digital_density, macroDensity.Digital);
  const digitalDemand = normaliseScore(row.digital_demand, macroDemand.Digital);
  const technicalSupply = normaliseScore(row.technical_density, macroDensity.Technical);
  const technicalDemand = normaliseScore(row.technical_demand, macroDemand.Technical);
  const digitalBalance = Math.round((digitalDemand - digitalSupply) * 100) / 100;
  const technicalBalance = Math.round((technicalDemand - technicalSupply) * 100) / 100;

  if (row.region === "East Asia") {
    return {
      ...row,
      digital_supply_score: 14.95016611,
      digital_demand_score: 64.0625,
      digital_balance_score: 49.11233389,
      digital_balance: "Shortage",
      technical_supply_score: 40.7253886,
      technical_demand_score: 63.70808679,
      technical_balance_score: 22.98269818,
      technical_balance: "Shortage",
    };
  }

  return {
    ...row,
    digital_supply_score: digitalSupply,
    digital_demand_score: digitalDemand,
    digital_balance_score: digitalBalance,
    digital_balance: getBalanceLabel(digitalBalance),
    technical_supply_score: technicalSupply,
    technical_demand_score: technicalDemand,
    technical_balance_score: technicalBalance,
    technical_balance: getBalanceLabel(technicalBalance),
  };
});

/* =========================================================
   WORLD COUNTRY → REGION MAPPING
   ========================================================= */

const COUNTRY_TO_REGION = {
  /* Southeast Asia */
  Brunei: "Southeast Asia",
  Cambodia: "Southeast Asia",
  Indonesia: "Southeast Asia",
  Laos: "Southeast Asia",
  Malaysia: "Southeast Asia",
  Myanmar: "Southeast Asia",
  Philippines: "Southeast Asia",
  Singapore: "Southeast Asia",
  Thailand: "Southeast Asia",
  "Timor-Leste": "Southeast Asia",
  "East Timor": "Southeast Asia",
  Vietnam: "Southeast Asia",

  /* East Asia */
  China: "East Asia",
  Japan: "East Asia",
  Mongolia: "East Asia",
  "South Korea": "East Asia",
  "North Korea": "East Asia",
  Korea: "East Asia",
  Taiwan: "East Asia",

  /* Europe */
  Albania: "Europe",
  Andorra: "Europe",
  Austria: "Europe",
  Belarus: "Europe",
  Belgium: "Europe",
  Bosnia: "Europe",
  "Bosnia and Herzegovina": "Europe",
  Bulgaria: "Europe",
  Croatia: "Europe",
  Cyprus: "Europe",
  Czechia: "Europe",
  "Czech Republic": "Europe",
  Denmark: "Europe",
  Estonia: "Europe",
  Finland: "Europe",
  France: "Europe",
  Germany: "Europe",
  Greece: "Europe",
  Hungary: "Europe",
  Iceland: "Europe",
  Ireland: "Europe",
  Italy: "Europe",
  Kosovo: "Europe",
  Latvia: "Europe",
  Lithuania: "Europe",
  Luxembourg: "Europe",
  Malta: "Europe",
  Moldova: "Europe",
  Montenegro: "Europe",
  Netherlands: "Europe",
  "North Macedonia": "Europe",
  Macedonia: "Europe",
  Norway: "Europe",
  Poland: "Europe",
  Portugal: "Europe",
  Romania: "Europe",
  Serbia: "Europe",
  Slovakia: "Europe",
  Slovenia: "Europe",
  Spain: "Europe",
  Sweden: "Europe",
  Switzerland: "Europe",
  Ukraine: "Europe",
  "United Kingdom": "Europe",

  /* Latin America */
  Argentina: "Latin America & Caribbean",
  Bolivia: "Latin America & Caribbean",
  Brazil: "Latin America & Caribbean",
  Chile: "Latin America & Caribbean",
  Colombia: "Latin America & Caribbean",
  Ecuador: "Latin America & Caribbean",
  Guyana: "Latin America & Caribbean",
  Paraguay: "Latin America & Caribbean",
  Peru: "Latin America & Caribbean",
  Suriname: "Latin America & Caribbean",
  Uruguay: "Latin America & Caribbean",
  Venezuela: "Latin America & Caribbean",
  Mexico: "Latin America & Caribbean",
  Belize: "Latin America & Caribbean",
  Guatemala: "Latin America & Caribbean",
  Honduras: "Latin America & Caribbean",
  "El Salvador": "Latin America & Caribbean",
  Nicaragua: "Latin America & Caribbean",
  "Costa Rica": "Latin America & Caribbean",
  Panama: "Latin America & Caribbean",
  Cuba: "Latin America & Caribbean",
  Haiti: "Latin America & Caribbean",
  "Dominican Republic": "Latin America & Caribbean",
  Jamaica: "Latin America & Caribbean",
  Bahamas: "Latin America & Caribbean",
  "The Bahamas": "Latin America & Caribbean",
  "Puerto Rico": "Latin America & Caribbean",

  /* South Asia */
  Afghanistan: "South Asia", Bangladesh: "South Asia", Bhutan: "South Asia", India: "South Asia",
  Maldives: "South Asia", Nepal: "South Asia", Pakistan: "South Asia", "Sri Lanka": "South Asia",

  /* Central Asia */
  Kyrgyzstan: "Central Asia", Tajikistan: "Central Asia",

  /* Middle East */
  Iran: "Middle East", Iraq: "Middle East", Israel: "Middle East", Jordan: "Middle East",
  Lebanon: "Middle East", Palestine: "Middle East", "United Arab Emirates": "Middle East",

  /* Oceania */
  Australia: "Oceania", "New Zealand": "Oceania", Fiji: "Oceania", "Papua New Guinea": "Oceania",

  /* North Africa */
  Algeria: "North Africa", Egypt: "North Africa", Morocco: "North Africa", Tunisia: "North Africa",

  /* West Africa */
  Benin: "West Africa", Burkina: "West Africa", "Burkina Faso": "West Africa", Ghana: "West Africa",
  Guinea: "West Africa", Liberia: "West Africa", Mali: "West Africa", Niger: "West Africa",
  Nigeria: "West Africa", Senegal: "West Africa", "Sierra Leone": "West Africa", Togo: "West Africa",

  /* Central Africa */
  Angola: "Central Africa", Cameroon: "Central Africa", Chad: "Central Africa", Congo: "Central Africa",
  Gabon: "Central Africa", "Equatorial Guinea": "Central Africa",

  /* East Africa */
  Burundi: "East Africa", Comoros: "East Africa", Djibouti: "East Africa", Eritrea: "East Africa",
  Ethiopia: "East Africa", Kenya: "East Africa", Rwanda: "East Africa", Somalia: "East Africa",
  Tanzania: "East Africa", Uganda: "East Africa",

  /* North America */
  "United States": "North America",
  "United States of America": "North America",
};

/* =========================================================
   FORMATTERS
   ========================================================= */

const formatEmployment = (value) => {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "—";
  }

  const number = Number(value);

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(2)}M`;
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }

  return number.toLocaleString();
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value));
};

const formatPercent = (value, signed = false) => {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "—";
  }

  const number = Number(value);

  if (signed && number > 0) {
    return `+${number.toFixed(2)}%`;
  }

  return `${number.toFixed(2)}%`;
};

/* =========================================================
   MICRO CSV TRANSFORM
   ========================================================= */

const transformMicroData = (rows) => {
  const stateMap = {};

  const num = (value) => {
    if (value === undefined || value === null || value === "") return null;
    const cleaned = String(value).replace(/,/g, "").replace(/%/g, "").trim();
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  };

  rows.forEach((row) => {
    const state = row.State?.trim();
    const talent = row.Talent?.trim()?.toLowerCase();
    if (!state || !talent) return;

    if (!stateMap[state]) stateMap[state] = { name: state };

    const employment = row.Employment_2025 ?? row["Employment 2025"];
    const growth = row.Growth_2024_2025_pct ?? row["Employment Growth"];
    const density = row.Workforce_Density_pct ?? row["Workforce Density"];
    const demand = row.Demand_Pressure_pct ?? row["Demand Pressure"];
    const projectionBase = row.Projection_Base ?? row["Projection Base"];
    const projection = row.Projection_2034 ?? row["Projection 2034"];
    const openings = row.Projected_Annual_Openings ?? row.Annual_Openings ?? row["Annual Openings"];
    const demandIntensity = row.Demand_Intensity_pct ?? row.Annual_Openings_Rate_pct ?? row["Annual Openings Rate"];
    const demandPctl = row.Demand_Intensity_Pctl ?? row["Demand Intensity Percentile"];
    const supplyPctl = row.Supply_Density_Pctl ?? row["Supply Density Percentile"];
    const balanceIndex = row.Talent_Balance_Score ?? row.Balance_Index ?? row["Balance Index"];
    const averageSalary = row["Average Annual Salary (USD)"] ?? row.Average_Annual_Salary_USD;
    const salary15 = row["SOC 15-0000 Salary (USD)"];
    const salary17 = row["SOC 17-0000 Salary (USD)"];
    const salary49 = row["SOC 49-0000 Salary (USD)"];
    const salary51 = row["SOC 51-0000 Salary (USD)"];

    stateMap[state][`${talent}_employment`] = num(employment) ?? 0;
    // Spreadsheet exports may store percentages either as decimals (0.0638) or percent values (6.38).
    const pct = (value) => {
      const n = num(value);
      if (n == null) return 0;
      return Math.abs(n) <= 1 ? n * 100 : n;
    };
    stateMap[state][`${talent}_growth`] = pct(growth);
    stateMap[state][`${talent}_density`] = pct(density);
    stateMap[state][`${talent}_demand`] = pct(demand);
    stateMap[state][`${talent}_projection_base`] = num(projectionBase);
    stateMap[state][`${talent}_projection`] = num(projection);
    stateMap[state][`${talent}_annual_openings`] = num(openings);
    stateMap[state][`${talent}_demand_intensity`] = pct(demandIntensity);
    stateMap[state][`${talent}_demand_score`] = num(demandPctl);
    stateMap[state][`${talent}_supply_score`] = num(supplyPctl);
    stateMap[state][`${talent}_balance_score`] = num(balanceIndex);
    stateMap[state][`${talent}_balance`] = row.Talent_Balance || row["Talent Balance"] || "Balanced";
    // Use the revised table's combined Average Annual Salary for BOTH talent groups.
    // Individual SOC salaries remain available in the tooltip for reference.
    stateMap[state][`${talent}_salary`] = num(averageSalary) ?? (talent === "digital" ? num(salary15) : num(salary17));
    stateMap[state][`${talent}_salary_15`] = num(salary15);
    stateMap[state][`${talent}_salary_17`] = num(salary17);
    stateMap[state][`${talent}_salary_49`] = num(salary49);
    stateMap[state][`${talent}_salary_51`] = num(salary51);
    stateMap[state][`${talent}_skills`] = [
      row["Skill 1"], row["Skill 2"], row["Skill 3"], row["Skill 4"]
    ].filter(Boolean);
    if (talent === "digital") {
      stateMap[state].digital_salary = num(averageSalary) ?? num(row["SOC 15-0000 Salary (USD)"]);
    } else if (talent === "technical") {
      stateMap[state].technical_salary = num(averageSalary) ?? num(row["SOC 17-0000 Salary (USD)"]);
      stateMap[state].technical_salary_17 = num(row["SOC 17-0000 Salary (USD)"]);
      stateMap[state].technical_salary_49 = num(row["SOC 49-0000 Salary (USD)"]);
      stateMap[state].technical_salary_51 = num(row["SOC 51-0000 Salary (USD)"]);
    }
  });

  return Object.values(stateMap);
};

/* =========================================================
   MICRO FILTERED AGGREGATION
   ========================================================= */

const aggregateMicroData = (rows, selectedSocs, summaryRows) => {
  const number = (value) => {
    const parsed = Number(String(value ?? "").replace(/,/g, "").trim());
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const states = new Map();

  rows.forEach((row) => {
    const state = row.State?.trim();
    const talent = row.Talent?.trim()?.toLowerCase();
    const soc = String(row.SOC ?? "").trim();
    if (!state || !talent || !soc || !selectedSocs.has(soc)) return;

    if (!states.has(state)) states.set(state, { name: state });
    const record = states.get(state);
    const key = talent;
    if (!record[`${key}_raw`]) {
      record[`${key}_raw`] = {
        employment: 0,
        employment2024: 0,
        totalEmployment: 0,
        projectionBase: 0,
        projection2034: 0,
        annualOpenings: 0,
        salaryCost: 0,
      };
    }

    const raw = record[`${key}_raw`];
    const employment = number(row.Employment_2025);
    raw.employment += employment;
    raw.employment2024 += number(row.Employment_2024);
    raw.totalEmployment = Math.max(raw.totalEmployment, number(row.Total_State_Employment_2025));
    raw.projectionBase += number(row.Projection_Base);
    raw.projection2034 += number(row.Projection_2034);
    raw.annualOpenings += number(row.Annual_Openings);
    raw.salaryCost += employment * number(row.Average_Annual_Salary_USD);
  });

  const summaryByState = new Map(summaryRows.map((row) => [row.name, row]));
  const result = [...states.values()].map((record) => {
    ["digital", "technical"].forEach((talent) => {
      const raw = record[`${talent}_raw`];
      if (!raw) return;
      const employment = raw.employment;
      const projectionBase = raw.projectionBase;
      record[`${talent}_employment`] = employment;
      record[`${talent}_growth`] = raw.employment2024 ? ((employment - raw.employment2024) / raw.employment2024) * 100 : 0;
      record[`${talent}_density`] = raw.totalEmployment ? (employment / raw.totalEmployment) * 100 : 0;
      record[`${talent}_projection_base`] = projectionBase;
      record[`${talent}_projection`] = raw.projection2034;
      record[`${talent}_annual_openings`] = raw.annualOpenings;
      record[`${talent}_demand`] = projectionBase ? (raw.annualOpenings / projectionBase) * 100 : 0;
      record[`${talent}_demand_intensity`] = record[`${talent}_demand`];
      record[`${talent}_salary`] = employment ? raw.salaryCost / employment : 0;
      record[`${talent}_skills`] = summaryByState.get(record.name)?.[`${talent}_skills`] || [];
    });
    return record;
  });

  ["digital", "technical"].forEach((talent) => {
    const records = result.filter((record) => record[`${talent}_raw`]);
    const count = records.length || 1;
    records.forEach((record) => {
      const demand = record[`${talent}_demand`];
      const density = record[`${talent}_density`];
      const demandScore = (records.filter((item) => item[`${talent}_demand`] <= demand).length / count) * 100;
      const supplyScore = (records.filter((item) => item[`${talent}_density`] <= density).length / count) * 100;
      const balanceScore = demandScore - supplyScore;
      record[`${talent}_demand_score`] = demandScore;
      record[`${talent}_supply_score`] = supplyScore;
      record[`${talent}_balance_score`] = balanceScore;
      record[`${talent}_balance`] = balanceScore >= 15 ? "Shortage" : balanceScore <= -15 ? "Surplus" : "Balanced";
    });
  });

  return result;
};


const salaryColor = (value, min, max) => {
  if (value == null || Number.isNaN(Number(value))) return "#e2e8f0";
  const t = max === min ? 0.5 : (Number(value) - min) / (max - min);
  // light blue -> deep navy; salary is intentionally a separate visual layer
  const a = [219, 234, 254], b = [30, 64, 175];
  const c = a.map((v,i) => Math.round(v + (b[i]-v) * Math.max(0,Math.min(1,t))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

/* =========================================================
   APP
   ========================================================= */

export default function App() {
  const [view, setView] = useState("macro");
  const [talentType, setTalentType] = useState("digital");
  const [metric, setMetric] = useState("demand");
  const [darkMode, setDarkMode] = useState(false);

  const [microData, setMicroData] = useState([]);
  const [microSocRows, setMicroSocRows] = useState([]);
  const [selectedSocs, setSelectedSocs] = useState(new Set());
  const [showMicroFilter, setShowMicroFilter] = useState(false);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  /* =======================================================
     LOAD MICRO CSV
     ======================================================= */

  useEffect(() => {
    Papa.parse(
      "/US_Micro_Heatmap_With_Individual_SOC_Salaries.csv",
      {
        download: true,
        header: true,
        skipEmptyLines: true,

        complete: (result) => {
          const transformed =
            transformMicroData(result.data);

          setMicroData(transformed);
        },

        error: (error) => {
          console.error(
            "Failed to load micro talent dataset:",
            error
          );
        },
      }
    );

    Papa.parse(microSocUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data.filter((row) => row.State && row.Talent && row.SOC);
        setMicroSocRows(rows);
        setSelectedSocs(new Set(rows.map((row) => String(row.SOC).trim())));
      },
      error: (error) => {
        console.error("Failed to load the occupation-level micro dataset:", error);
      },
    });
  }, []);

  const microSocOptions = useMemo(() => {
    const unique = new Map();
    microSocRows.forEach((row) => {
      const soc = String(row.SOC ?? "").trim();
      if (soc && !unique.has(soc)) {
        unique.set(soc, {
          soc,
          talent: row.Talent?.trim()?.toLowerCase(),
          occupation: row.Occupation?.trim() || soc,
        });
      }
    });
    return [...unique.values()].sort((a, b) => a.talent.localeCompare(b.talent) || a.soc.localeCompare(b.soc));
  }, [microSocRows]);

  const filteredMicroData = useMemo(() => {
    if (!microSocRows.length) return microData;
    return aggregateMicroData(microSocRows, selectedSocs, microData);
  }, [microSocRows, selectedSocs, microData]);

  /* =======================================================
     ACTIVE DATA
     ======================================================= */

  const activeData =
    view === "macro"
      ? MACRO_DATA
      : filteredMicroData;

  const geoUrl =
    view === "macro"
      ? macroUrl
      : microUrl;

  const projection =
    view === "macro"
      ? "geoMercator"
      : "geoAlbersUsa";

  const projectionConfig =
    view === "macro"
      ? {
          scale: 135,
          center: [10, 15],
        }
      : {
          scale: 820,
        };

  /* =======================================================
     METRIC OPTIONS
     ======================================================= */

  const metricOptions = useMemo(() => [
    { key: "employment", label: "Employment" },
    { key: "growth", label: "Employment Growth" },
    { key: "density", label: "Workforce Density" },
    { key: "demand", label: view === "macro" ? "Hiring Difficulty" : "Occupational Demand Intensity" },
    { key: "balance", label: "Talent Balance" },
    { key: "salary", label: "Average Annual Salary" },
  ], [view]);

  /* =======================================================
     METRIC VALUES
     ======================================================= */

  const metricValues = useMemo(() => {
    if (metric === "balance") {
      return [];
    }

    return activeData
      .map((row) =>
        Number(
          row[
            `${talentType}_${metric}`
          ]
        )
      )
      .filter(
        (value) =>
          !Number.isNaN(value) &&
          Number.isFinite(value)
      );
  }, [
    activeData,
    talentType,
    metric,
  ]);

  const minMetric =
    metricValues.length > 0
      ? Math.min(...metricValues)
      : 0;

  const maxMetric =
    metricValues.length > 0
      ? Math.max(...metricValues)
      : 1;

  /* =======================================================
     COLOR SCALES
     ======================================================= */

  const sequentialColor = useMemo(() => {
    return scaleLinear()
      .domain([
        minMetric,
        maxMetric === minMetric
          ? minMetric + 1
          : maxMetric,
      ])
      .range([
        "#dbeafe",
        "#1d4ed8",
      ])
      .clamp(true);
  }, [minMetric, maxMetric]);

  const growthColor = useMemo(() => {
    const maxAbs = Math.max(
      Math.abs(minMetric),
      Math.abs(maxMetric),
      1
    );

    return scaleLinear()
      .domain([
        -maxAbs,
        0,
        maxAbs,
      ])
      .range([
        "#ef4444",
        "#f8fafc",
        "#10b981",
      ])
      .clamp(true);
  }, [minMetric, maxMetric]);

  const balanceColor = {
    Shortage: "#ef4444",
    Balanced: "#22c55e",
    Surplus: "#2563eb",
  };

  const getFillColor = (record) => {
    if (!record) {
      return "#e2e8f0";
    }

    if (metric === "balance") {
      const balance =
        record[
          `${talentType}_balance`
        ];

      return (
        balanceColor[balance] ||
        "#e2e8f0"
      );
    }

    const value = Number(
      record[
        `${talentType}_${metric}`
      ]
    );

    if (Number.isNaN(value)) {
      return "#e2e8f0";
    }

    if (metric === "growth") {
      return growthColor(value);
    }

    return sequentialColor(value);
  };

  /* =======================================================
     GEO MATCHING
     ======================================================= */

  const findRecord = (geo) => {
    const geoName =
      geo.properties?.name || "";

    if (view === "macro") {
      const region =
        COUNTRY_TO_REGION[geoName];

      if (!region) {
        return null;
      }

      return MACRO_DATA.find(
        (row) =>
          row.region === region
      );
    }

    return activeData.find(
      (row) =>
        row.name.toLowerCase() ===
        geoName.toLowerCase()
    );
  };

  /* =======================================================
     REACT TOOLTIP CONTENT
     ======================================================= */

  const getTooltipContent = (record) => {
    if (!record) return null;

    const label =
      view === "macro"
        ? record.region
        : record.name;

    const employment =
      record[
        `${talentType}_employment`
      ];

    const growth =
      record[
        `${talentType}_growth`
      ];

    const density =
      record[
        `${talentType}_density`
      ];

    const demand =
      record[
        `${talentType}_demand`
      ];

    const balance =
      record[
        `${talentType}_balance`
      ];

    const annualOpenings =
      record[
        `${talentType}_annual_openings`
      ];

    const demandIntensity =
      record[
        `${talentType}_demand_intensity`
      ];

    const demandScore = record[`${talentType}_demand_score`];
    const supplyScore = record[`${talentType}_supply_score`];
    const balanceScore = record[`${talentType}_balance_score`];
    const skills = record[`${talentType}_skills`] || [];
    const salary = record[`${talentType}_salary`];
    const salary17 = record[`${talentType}_salary_17`];
    const salary49 = record[`${talentType}_salary_49`];
    const salary51 = record[`${talentType}_salary_51`];

    return (
      <div
        style={{
          textAlign: "left",
          maxWidth: "300px",
          fontFamily:
            "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: "15px",
            fontWeight: 700,
            marginBottom: "2px",
          }}
        >
          {label}
        </div>

        <div
          style={{
            color: "#94a3b8",
            fontSize: "11px",
            marginBottom: "9px",
            textTransform:
              "uppercase",
            letterSpacing:
              "0.5px",
          }}
        >
          {talentType ===
          "digital"
            ? "Digital Talent"
            : "Technical Talent"}
        </div>

        <div
          style={{
            fontSize: "12px",
            lineHeight: 1.8,
          }}
        >
          <div>
            <span
              style={{
                color:
                  "#94a3b8",
              }}
            >
              Employment:{" "}
            </span>

            <strong>
              {formatEmployment(
                employment
              )}
            </strong>
          </div>

          <div>
            <span
              style={{
                color:
                  "#94a3b8",
              }}
            >
              Employment Growth:{" "}
            </span>

            <strong>
              {formatPercent(
                growth,
                true
              )}
            </strong>
          </div>

          <div>
            <span
              style={{
                color:
                  "#94a3b8",
              }}
            >
              Workforce Density:{" "}
            </span>

            <strong>
              {formatPercent(
                density
              )}
            </strong>
          </div>

          <div>
            <span
              style={{
                color:
                  "#94a3b8",
              }}
            >
              {view === "macro" ? "Hiring Difficulty" : "Occupational Demand Intensity"}:{" "}
            </span>

            <strong>
              {formatPercent(
                demand
              )}
            </strong>
          </div>

          {view === "micro" && (
            <>
              <div><span style={{ color: "#94a3b8" }}>Annual Openings: </span><strong>{annualOpenings != null ? Number(annualOpenings).toLocaleString() : "—"}</strong></div>
              <div><span style={{ color: "#94a3b8" }}>Demand Percentile: </span><strong>{demandScore != null ? Number(demandScore).toFixed(2) : "—"}</strong></div>
              <div><span style={{ color: "#94a3b8" }}>Supply Percentile: </span><strong>{supplyScore != null ? Number(supplyScore).toFixed(2) : "—"}</strong></div>
            </>
          )}

          {view === "macro" && (
            <>
              <div><span style={{ color: "#94a3b8" }}>Normalized Demand Score: </span><strong>{demandScore != null ? Number(demandScore).toFixed(2) : "—"}</strong></div>
              <div><span style={{ color: "#94a3b8" }}>Normalized Supply Score: </span><strong>{supplyScore != null ? Number(supplyScore).toFixed(2) : "—"}</strong></div>
            </>
          )}

          <div><span style={{ color: "#94a3b8" }}>Balance Index: </span><strong>{balanceScore != null ? Number(balanceScore).toFixed(2) : "—"}</strong></div>
          <div><span style={{ color: "#94a3b8" }}>Talent Balance: </span><strong style={{ color: balanceColor[balance] || "#ffffff" }}>{balance || "—"}</strong></div>
          <div><span style={{ color: "#94a3b8" }}>Average Annual Salary: </span><strong>{formatCurrency(salary)}</strong></div>
          {view === "micro" && talentType === "digital" && <div><span style={{ color: "#94a3b8" }}>SOC 15-0000 Salary: </span><strong>{formatCurrency(record[`${talentType}_salary_15`])}</strong></div>}
          {view === "micro" && talentType === "technical" && (
            <>
              <div><span style={{ color: "#94a3b8" }}>SOC 17-0000 Salary: </span><strong>{formatCurrency(salary17)}</strong></div>
              <div><span style={{ color: "#94a3b8" }}>SOC 49-0000 Salary: </span><strong>{formatCurrency(salary49)}</strong></div>
              <div><span style={{ color: "#94a3b8" }}>SOC 51-0000 Salary: </span><strong>{formatCurrency(salary51)}</strong></div>
            </>
          )}
        </div>

        {skills.length > 0 && (
          <div
            style={{
              marginTop: "9px",
              paddingTop: "8px",
              borderTop: "1px solid #475569",
            }}
          >
            <div
              style={{
                color: "#94a3b8",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "6px",
              }}
            >
              Top Skills / Capabilities
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {skills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    background: "#334155",
                    border: "1px solid #475569",
                    borderRadius: "999px",
                    padding: "3px 7px",
                    fontSize: "10px",
                    lineHeight: 1.3,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* =======================================================
     LEGEND
     ======================================================= */

  const renderLegend = () => {
    if (metric === "balance") {
      return (
        <div className="heatmap-legend">
          <span className="legend-title">
            Talent Balance
          </span>

          <div className="legend-items">
            <span>
              <i
                style={{
                  background:
                    balanceColor.Shortage,
                }}
              />
              Shortage
            </span>

            <span>
              <i
                style={{
                  background:
                    balanceColor.Balanced,
                }}
              />
              Balanced
            </span>

            <span>
              <i
                style={{
                  background:
                    balanceColor.Surplus,
                }}
              />
              Surplus
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="heatmap-legend">
        <span className="legend-title">
          {
            metricOptions.find(
              (item) =>
                item.key ===
                metric
            )?.label
          }
        </span>

        <div className="continuous-legend">
          <span>
            {metric ===
            "employment"
              ? formatEmployment(
                  minMetric
                )
              : formatPercent(
                  minMetric,
                  metric ===
                    "growth"
                )}
          </span>

          <div
            className={
              metric ===
              "growth"
                ? "legend-gradient growth-gradient"
                : "legend-gradient"
            }
          />

          <span>
            {metric ===
            "employment"
              ? formatEmployment(
                  maxMetric
                )
              : formatPercent(
                  maxMetric,
                  metric ===
                    "growth"
                )}
          </span>
        </div>
      </div>
    );
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className={`research-dashboard ${darkMode ? "dark-mode" : ""}`}>
      <style>{`
        .research-dashboard.dark-mode { background: #0b1220; color: #e2e8f0; }
        .research-dashboard.dark-mode .header h1,
        .research-dashboard.dark-mode .header p,
        .research-dashboard.dark-mode .card,
        .research-dashboard.dark-mode .table-heading h3,
        .research-dashboard.dark-mode .table-heading p,
        .research-dashboard.dark-mode .metric-label,
        .research-dashboard.dark-mode th,
        .research-dashboard.dark-mode td,
        .research-dashboard.dark-mode .region-name { color: #e2e8f0 !important; }
        .research-dashboard.dark-mode .card { background: #111c2e !important; border-color: #26354b !important; }
        .research-dashboard.dark-mode .btn,
        .research-dashboard.dark-mode .metric-btn { background: #1b2a41 !important; color: #dbeafe !important; border-color: #334155 !important; }
        .research-dashboard.dark-mode .btn.active,
        .research-dashboard.dark-mode .metric-btn.active { background: #2563eb !important; color: #ffffff !important; border-color: #3b82f6 !important; }
        .research-dashboard.dark-mode .table-scroll,
        .research-dashboard.dark-mode .map-container { background: #0f1a2b !important; }
        .research-dashboard.dark-mode thead tr,
        .research-dashboard.dark-mode th { background: #17243a !important; }
        .research-dashboard.dark-mode td { border-color: #26354b !important; }
        .research-dashboard.dark-mode tr:hover td { background: #17243a !important; }
        .research-dashboard.dark-mode .heatmap-legend,
        .research-dashboard.dark-mode .legend-title,
        .research-dashboard.dark-mode .legend-items,
        .research-dashboard.dark-mode .continuous-legend { color: #cbd5e1 !important; }
        .research-dashboard.dark-mode .micro-filter-panel { background: #0f1a2b !important; border-color: #334155 !important; }
        .research-dashboard.dark-mode .micro-filter-title,
        .research-dashboard.dark-mode .micro-filter-copy,
        .research-dashboard.dark-mode .micro-filter-group,
        .research-dashboard.dark-mode .micro-filter-option { color: #dbeafe !important; }
        .research-dashboard.dark-mode .micro-filter-card { background: #17243a !important; border-color: #334155 !important; }
      `}</style>
      <div className="module-stack">

        <div className="header">
          <div>
            <h1>
              Global Talent
              Benchmarking
            </h1>

            <p>
              Digital and Technical Talent Supply, Growth, Demand and Relative Balance
            </p>
          </div>
          <button
            className="btn"
            onClick={() => setDarkMode((enabled) => !enabled)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? "Light mode" : "Dark mode"}
          </button>
        </div>

        <div className="card">

          <div className="controls">

            <div className="control-group">

              <button
                className={`btn ${
                  view ===
                  "macro"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setView(
                    "macro"
                  )
                }
              >
                Global Macro
              </button>

              <button
                className={`btn ${
                  view ===
                  "micro"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setView(
                    "micro"
                  )
                }
              >
                United States
                Micro
              </button>

            </div>

            <div className="control-group">

              <button
                className={`btn ${
                  talentType ===
                  "digital"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setTalentType(
                    "digital"
                  )
                }
              >
                Digital
              </button>

              <button
                className={`btn ${
                  talentType ===
                  "technical"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setTalentType(
                    "technical"
                  )
                }
              >
                Technical
              </button>

            </div>

          </div>

          {view === "micro" && (
            <div
              className="micro-filter-panel"
              style={{
                margin: "0 0 18px",
                padding: "14px",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <div>
                  <div className="micro-filter-title" style={{ fontWeight: 700, color: "#0f172a" }}>Occupation subcategory filter</div>
                  <div className="micro-filter-copy" style={{ marginTop: "3px", color: "#64748b", fontSize: "12px" }}>
                    {selectedSocs.size} of {microSocOptions.length} SOC occupations selected. State results recalculate from your selection.
                  </div>
                </div>
                <button className="metric-btn" onClick={() => setShowMicroFilter((open) => !open)}>
                  {showMicroFilter ? "Hide filters" : "Choose occupations"}
                </button>
              </div>

              {showMicroFilter && (
                <>
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <button className="metric-btn" onClick={() => setSelectedSocs(new Set(microSocOptions.map((item) => item.soc)))}>
                      Select all
                    </button>
                    <button className="metric-btn" onClick={() => setSelectedSocs(new Set())}>
                      Clear all
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", marginTop: "12px" }}>
                    {["digital", "technical"].map((group) => (
                      <div key={group} className="micro-filter-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px" }}>
                        <div className="micro-filter-group" style={{ color: "#334155", fontWeight: 700, fontSize: "12px", marginBottom: "7px", textTransform: "uppercase" }}>
                          {group} occupations
                        </div>
                        <div style={{ maxHeight: "250px", overflowY: "auto", paddingRight: "4px" }}>
                          {microSocOptions.filter((item) => item.talent === group).map((item) => (
                            <label key={item.soc} className="micro-filter-option" style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "5px 2px", color: "#334155", fontSize: "12px", cursor: "pointer" }}>
                              <input
                                type="checkbox"
                                checked={selectedSocs.has(item.soc)}
                                onChange={() => setSelectedSocs((current) => {
                                  const next = new Set(current);
                                  next.has(item.soc) ? next.delete(item.soc) : next.add(item.soc);
                                  return next;
                                })}
                              />
                              <span><strong>{item.soc}</strong> · {item.occupation}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="metric-selector">

            <span className="metric-label">
              Heatmap Metric
            </span>

            <div className="metric-buttons">

              {metricOptions.map(
                (option) => (
                  <button
                    key={
                      option.key
                    }
                    className={`metric-btn ${
                      metric ===
                      option.key
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setMetric(
                        option.key
                      )
                    }
                  >
                    {
                      option.label
                    }
                  </button>
                )
              )}

            </div>
          </div>

          <div className="map-container">
            <ComposableMap projection={projection} projectionConfig={projectionConfig}>
              <Geographies geography={geoUrl}>
                {({ geographies }) => geographies.map((geo) => {
                  const record = findRecord(geo);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getFillColor(record)}
                      stroke="#cbd5e1"
                      strokeWidth={0.5}
                      onMouseEnter={() => setTooltipContent(record ? getTooltipContent(record) : <div><b>{geo.properties?.name || "No Data"}</b><div>No benchmark data available.</div></div>)}
                      onMouseLeave={() => setTooltipContent(null)}
                      onClick={() => record && setSelectedRecord(record)}
                      style={{
                        default: { outline: "none", transition: "fill 180ms" },
                        hover: { outline: "none", stroke: "#0f172a", strokeWidth: 1.25, cursor: record ? "pointer" : "default" },
                        pressed: { outline: "none" },
                      }}
                      data-tooltip-id="app-tooltip"
                    />
                  );
                })}
              </Geographies>
            </ComposableMap>

            <div className="heatmap-legend">
              <span className="legend-title">{metricOptions.find((o) => o.key === metric)?.label}</span>
              {metric === "balance" ? (
                <div className="legend-items">
                  {Object.entries(balanceColor).map(([label, color]) => <span key={label}><i style={{ background: color }} />{label}</span>)}
                </div>
              ) : (
                <div className="continuous-legend">
                  <span>{metric === "employment" ? formatEmployment(minMetric) : metric === "salary" ? formatCurrency(minMetric) : formatPercent(minMetric, metric === "growth")}</span>
                  <div className={`legend-gradient ${metric === "growth" ? "growth-gradient" : ""}`} />
                  <span>{metric === "employment" ? formatEmployment(maxMetric) : metric === "salary" ? formatCurrency(maxMetric) : formatPercent(maxMetric, metric === "growth")}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">

          <div className="table-heading">

            <div>
              <h3>
                {view ===
                "macro"
                  ? "Macro Talent Benchmark"
                  : "U.S. State Talent Benchmark"}
              </h3>

              <p>
                {talentType ===
                "digital"
                  ? "Digital Talent"
                  : "Technical Talent"}
              </p>
            </div>

          </div>

          <div className="table-scroll">

            <table className="data-grid">

              <thead>
                <tr>
                  <th>
                    {view ===
                    "macro"
                      ? "Region"
                      : "State"}
                  </th>

                  <th>
                    Employment
                  </th>

                  <th>
                    Growth
                  </th>

                  <th>
                    Workforce
                    Density
                  </th>

                  <th>{view === "macro" ? "Hiring Difficulty" : "Occupational Demand Intensity"}</th>

                  {view === "micro" && <th>Annual Openings</th>}
                  <th>{view === "macro" ? "Demand Score" : "Demand Pctl."}</th>
                  <th>{view === "macro" ? "Supply Score" : "Supply Pctl."}</th>
                  <th>Average Annual Salary</th>
                  <th>Balance Index</th>
                  <th>Talent Balance</th>
                  <th>Top Skills / Capabilities</th>
                </tr>
              </thead>

              <tbody>
                {[...activeData]
                  .sort(
                    (a, b) =>
                      Number(
                        b[
                          `${talentType}_employment`
                        ]
                      ) -
                      Number(
                        a[
                          `${talentType}_employment`
                        ]
                      )
                  )
                  .map(
                    (
                      row,
                      index
                    ) => {
                      const label =
                        view ===
                        "macro"
                          ? row.region
                          : row.name;

                      const balance =
                        row[
                          `${talentType}_balance`
                        ];

                      return (
                        <tr
                          key={`${label}-${index}`}
                        >
                          <td className="region-name">
                            {
                              label
                            }
                          </td>

                          <td>
                            {formatEmployment(
                              row[
                                `${talentType}_employment`
                              ]
                            )}
                          </td>

                          <td>
                            {formatPercent(
                              row[
                                `${talentType}_growth`
                              ],
                              true
                            )}
                          </td>

                          <td>
                            {formatPercent(
                              row[
                                `${talentType}_density`
                              ]
                            )}
                          </td>

                          <td>
                            {formatPercent(
                              row[
                                `${talentType}_demand`
                              ]
                            )}
                          </td>

                          {view === "micro" && (
                            <td>{row[`${talentType}_annual_openings`] != null ? Number(row[`${talentType}_annual_openings`]).toLocaleString() : "—"}</td>
                          )}
                          <td>{row[`${talentType}_demand_score`] != null ? Number(row[`${talentType}_demand_score`]).toFixed(2) : "—"}</td>
                          <td>{row[`${talentType}_supply_score`] != null ? Number(row[`${talentType}_supply_score`]).toFixed(2) : "—"}</td>
                          <td>{formatCurrency(row[`${talentType}_salary`])}</td>
                          <td>{row[`${talentType}_balance_score`] != null ? Number(row[`${talentType}_balance_score`]).toFixed(2) : "—"}</td>
                          <td>
                            <span className="balance-pill" style={{ color: balanceColor[balance] || "#64748b" }}>{balance || "—"}</span>
                          </td>
                          <td style={{ minWidth: "260px" }}>
                            {(row[`${talentType}_skills`] || []).join(" • ") || "—"}
                          </td>
                        </tr>
                      );
                    }
                  )}
              </tbody>
            </table>

          </div>
        </div>
      </div>

      <Tooltip
        id="app-tooltip"
        place="top"
        style={{
          backgroundColor:
            "#1e293b",
          color: "#ffffff",
          borderRadius:
            "8px",
          zIndex: 1000,
          padding:
            "12px 14px",
          boxShadow:
            "0 10px 25px rgba(15,23,42,.25)",
        }}
      >
        {tooltipContent}
      </Tooltip>
    </div>
  );
}
