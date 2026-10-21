import React from 'react';

const StatCard = ({ icon, count, label, bgColor, iconColor }) => {
  return (
    <div className="bg-white rounded-lg p-4 flex flex-col items-center justify-center">
      <div className={`w-6 h-6 ${bgColor} rounded-full flex items-center justify-center mb-2`}>
        {React.cloneElement(icon, { className: iconColor, size: 24 })}
      </div>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-sm text-muted">{label}</div>
    </div>
  );
};

export default StatCard;