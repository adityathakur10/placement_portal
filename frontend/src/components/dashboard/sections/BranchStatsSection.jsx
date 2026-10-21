import React, { useState } from 'react';
import StatCard from '../cards/StatCard';
import BranchSelector from '../../ui/BranchSelector';

const BranchStatsSection = ({ stats, selectedBranch, setSelectedBranch }) => {
  return (
    <div className="rounded-xl h-full">
      <div className="flex pl-4 pr-1 py-1 rounded-xl justify-between bg-white w-[full] items-center mb-4">
        <h2 className="text-md">Branch Statistics</h2>
        <BranchSelector
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <StatCard value={stats?.totalPlaced || 0} title="Total Students" />
        <StatCard value={stats?.totalCompanies || 0} title="Placed Students" />
        <StatCard value={`${stats?.placementRate || 0}%`} title="Placement Rate" />
        <StatCard value={stats?.totalCompanies || 0} title="Companies" />
      </div>
    </div>
  );
};

export default BranchStatsSection;