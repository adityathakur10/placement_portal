import React from "react";
import { Link } from "react-router-dom";
import { RiBuilding2Line } from "react-icons/ri";

const ApplicationCard = ({ application }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="badge badge-sm badge-success text-white">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="badge badge-sm badge-error text-white">
            Rejected
          </span>
        );
      case "changes_requested":
        return (
          <span className="badge badge-sm badge-warning">
            Changes Requested
          </span>
        );
      default:
        return <span className="badge badge-sm badge-ghost">Pending</span>;
    }
  };

  return (
    <div className="bg-background p-4 rounded-lg mb-3 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border">
          {application.Company?.logo ? (
            <img
              src={`${import.meta.env.VITE_URI}${application.Company.logo}`}
              alt={application.Company?.name}
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-company.png";
              }}
            />
          ) : (
            <RiBuilding2Line className="text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{application.title}</h3>
          <div className="text-sm text-muted">{application.Company?.name}</div>
        </div>
        <div>{getStatusBadge(application.Review?.status)}</div>
      </div>
      <div className="mt-2 flex justify-between text-sm">
        <span className="text-muted">
          Applied:{" "}
          {new Date(
            application.AppliedToJob?.createdAt || application.createdAt
          ).toLocaleDateString()}
        </span>
        <Link
          to={`/student/applications/${application.id}`}
          className="text-red hover:underline"
        >
          View Application
        </Link>
      </div>
    </div>
  );
};

export default ApplicationCard;
