import React from "react";
import JobCard from "../cards/JobCard";
import { RiBuilding2Line } from "react-icons/ri";
import { Link } from "react-router-dom";
import { RiArrowRightLine } from "react-icons/ri";

const ListingRequestsSection = ({ jobs = [], loading = false }) => {
  return (
    <div className="bg-white rounded-xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Listing Requests</h2>
        <div>
          <Link
            to="/super-admin/job-listings"
            className="btn btn-sm btn-outline flex items-center gap-1"
          >
            View All <RiArrowRightLine />
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="loading loading-spinner text-primary"></div>
          </div>
        ) : jobs.length > 0 ? (
          <div className="space-y-3 pr-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-40 h-40 mb-4 text-gray-300">
              <RiBuilding2Line size={160} className="mx-auto opacity-30" />
            </div>
            <h3 className="text-xl font-medium text-gray-500">
              No Assigned Listings
            </h3>
            <p className="text-gray-400 mt-2">
              There are currently no job listings assigned to you
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingRequestsSection;
