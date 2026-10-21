import React from 'react';

const BranchSelector = ({ selectedBranch, setSelectedBranch, branches = [
  { value: "CSE", label: "Computer Science" },
  { value: "IT", label: "Information Technology" }
] }) => (
  <select
    className="select select-bordered w-54"
    value={selectedBranch}
    onChange={(e) => setSelectedBranch(e.target.value)}
  >
    <option value="">Select Branch</option>
    {branches.map(branch => (
      <option key={branch.value} value={branch.value}>
        {branch.label}
      </option>
    ))}
  </select>
);

export default BranchSelector;