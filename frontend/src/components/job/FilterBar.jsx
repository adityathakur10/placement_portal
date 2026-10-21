import React from 'react';
import { RiFilter3Line } from 'react-icons/ri';

const FilterBar = ({ 
  activeTab, 
  setActiveTab, 
  sortOrder, 
  setSortOrder, 
  totalJobs 
}) => {
  return (
    <div className="flex mb-6">
      <div className="flex w-full justify-between items-center">
        <div className="flex gap-4 items-center">
          <h1 className="font-semibold text-2xl">Listing Requests</h1>
          <p className="bg-black w-8 h-8 text-lg flex items-center justify-center text-bold text-white rounded-full">
            {totalJobs}
          </p>
        </div>
        <div className="flex bg-background rounded-lg p-1 w-fit">
          <button
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === "all"
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Listings
          </button>
          <button
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === "active"
                ? "bg-green-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("active")}
          >
            Active
          </button>
          <button
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === "inactive"
                ? "bg-yellow-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("inactive")}
          >
            Pending/Inactive
          </button>
          <button
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === "unassigned"
                ? "bg-red text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("unassigned")}
          >
            Unassigned
          </button>
        </div>
        <div className="flex items-center px-2 rounded-lg bg-dark text-white">
          <RiFilter3Line size={20} />
          <select
            className="select bg-dark focus:outline-none"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;