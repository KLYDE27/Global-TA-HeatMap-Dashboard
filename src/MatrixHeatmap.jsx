import React from 'react';
import './Heatmap.css'; // Add CSS grid styling here

const data = [
  { region: "North America", digital: -2, technical: -3 }, // Negative = Deficit
  { region: "Latin America", digital: 2, technical: -1 },  // Positive = Surplus
  { region: "Southeast Asia", digital: 1, technical: 1 }
];

const getColor = (score) => {
  if (score <= -2) return '#ff4c4c'; // Critical Deficit (Red)
  if (score === -1) return '#ffaa4c'; // Deficit (Orange)
  if (score > 0) return '#4cff4c'; // Surplus (Green)
  return '#cccccc'; // Balanced
};

export default function MatrixHeatmap() {
  return (
    <div className="heatmap-container">
      <table>
        <thead>
          <tr>
            <th>Region</th>
            <th>Digital Talent</th>
            <th>Technical Talent</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.region}>
              <td>{row.region}</td>
              <td style={{ backgroundColor: getColor(row.digital) }}>Supply/Demand</td>
              <td style={{ backgroundColor: getColor(row.technical) }}>Supply/Demand</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}