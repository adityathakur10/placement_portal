import React from 'react';

const ProcessStatus = ({ status }) => {
  // Determine colors based on status
  const statusColors = {
    past: "bg-gray-300",
    current: "bg-green-500",
    upcoming: "bg-yellow-400"
  };
  
  const statusBgColors = {
    past: "bg-gray-100",
    current: "bg-green-50",
    upcoming: "bg-yellow-50"
  };

  const statusBadges = {
    past: <span className="badge badge-sm badge-ghost">Completed</span>,
    current: <span className="badge badge-sm badge-success text-white">In Progress</span>,
    upcoming: <span className="badge badge-sm badge-warning text-white">Upcoming</span>
  };

  return {
    colors: statusColors[status],
    bgColors: statusBgColors[status],
    badge: statusBadges[status]
  };
};

export default ProcessStatus;