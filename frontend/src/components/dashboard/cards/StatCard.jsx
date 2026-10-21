import React from 'react';

const StatCard = ({ value, title }) => (
  <div className="stat bg-white flex flex-col items-center rounded-lg p-4">
    <div className="stat-value">{value}</div>
    <div className="stat-title">{title}</div>
  </div>
);

export default StatCard;