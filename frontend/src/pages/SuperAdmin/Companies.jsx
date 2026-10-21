import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { authState } from "@/store/atoms/authAtom";
import axios from "axios";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layouts/Dashboard";
import { usePagination } from "@/hooks/usePagination";
import { Toast } from "@/components/ui/toast";
import {
  RiBuildingLine,
  RiAddLine,
  RiUserAddLine,
  RiEditLine,
  RiDeleteBin6Line,
  RiUserLine,
  RiMailLine,
  RiCalendarLine,
  RiMoreLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiGlobalLine,
  RiPhoneLine,
  RiMapPinLine,
  RiTeamLine,
  RiCheckLine,
  RiSearchLine,
} from "react-icons/ri";
import AddCompanyModal from "@/components/company/AddCompanyModal";
import InviteHrModal from "@/components/company/InviteHrModal";
import EditCompanyModal from "@/components/company/EditCompanyModal";
import DeleteCompanyModal from "@/components/company/DeleteCompanyModal";

const Companies = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [view, setView] = useState("companies");
  const auth = useRecoilValue(authState);
  const queryClient = useQueryClient();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 20 },
    },
  };

  useEffect(() => {
    const handleSearch = (event) => {
      const { searchTerm } = event.detail;
      setSearchQuery(searchTerm);
    };

    window.addEventListener("searchCompanies", handleSearch);
    return () => window.removeEventListener("searchCompanies", handleSearch);
  }, []);

  const {
    data: companies,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URI}/admin/company/`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
              'Accept': 'application/json'
            }
          }
        );
        
        if (typeof response.data === 'string') {
          Toast.error("API returned invalid data format. Please contact support.");
          return [];
        }
        
        if (!response.data?.data) {
          if (Array.isArray(response.data)) {
            return response.data;
          }
          return [];
        }
        
        return response.data.data;
      } catch (error) {
        if (error.response?.status === 404) {
          Toast.info("No companies found. Add your first company!");
          return [];
        }
        Toast.error(error.response?.data?.reason || "Failed to fetch companies");
        throw error;
      }
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
    cacheTime: 0,
  });

  const {
    data: representatives,
    isLoading: representativesLoading,
    error: representativesError,
  } = useQuery({
    queryKey: ["hr-representatives"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URI}/super-admin/recruiter`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
        return response.data || [];
      } catch (error) {
        Toast.error(
          error.response?.data?.message || "Failed to fetch HR representatives"
        );
        throw error;
      }
    },
    enabled: view === "hr",
  });

  // Filter companies based on search query
  const filteredCompanies = companies?.filter(
    (company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.website?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Filter HR representatives based on search query
  const filteredRepresentatives = representatives?.filter(
    (rep) =>
      rep.User?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.User?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.User?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.Company?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const {
    currentPage: companyPage,
    setCurrentPage: setCompanyPage,
    totalPages: totalCompanyPages,
    paginatedItems: paginatedCompanies,
  } = usePagination(filteredCompanies, 4);

  const {
    currentPage: hrPage,
    setCurrentPage: setHrPage, 
    totalPages: totalHrPages,
    paginatedItems: paginatedRepresentatives,
  } = usePagination(filteredRepresentatives, 4);

  useEffect(() => {
    setCompanyPage(1);
    setHrPage(1);
  }, [searchQuery, view, setCompanyPage, setHrPage]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";

    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.round((now - date) / (1000 * 60 * 60 * 24));

    return `${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}${diffDays < 60 ? ` (${diffDays} days ago)` : ""}`;
  };

  // Get initials from name
  const getInitials = (firstName, lastName) => {
    return `${(firstName || "")[0] || ""}${
      (lastName || "")[0] || ""
    }`.toUpperCase();
  };

  // Get avatar color based on name
  const getAvatarColor = (firstName, lastName) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-purple-100 text-purple-600",
      "bg-amber-100 text-amber-600",
      "bg-emerald-100 text-emerald-600",
      "bg-rose-100 text-rose-600",
      "bg-indigo-100 text-indigo-600",
    ];

    const name = `${firstName || ""}${lastName || ""}`;
    const charCodeSum = name
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };

  const handleInviteHR = (company) => {
    setSelectedCompany(company);
    setShowInviteModal(true);
  };

  const handleEdit = (company) => {
    setSelectedCompany(company);
    setShowEditModal(true);
  };

  const handleDelete = (company) => {
    setSelectedCompany(company);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_URI}/super-admin/company/${selectedCompany.id}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      Toast.success("Company deleted successfully");
      queryClient.invalidateQueries(["companies"]);
      setShowDeleteModal(false);
      setSelectedCompany(null);
    } catch (error) {
      Toast.error(error.response?.data?.message || "Failed to delete company");
    }
  };

  // Empty state component for companies or HR
  const EmptyState = ({ type }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col items-center justify-center"
    >
      <div className="w-72 h-72 mb-4">
        {type === "companies" ? (
          <RiBuildingLine className="w-full h-full text-dark/20" />
        ) : (
          <RiTeamLine className="w-full h-full text-dark/20" />
        )}
      </div>

      <div className="text-center max-w-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {type === "companies" ? "No companies found" : "No HR representatives found"}
        </h3>

        {searchQuery ? (
          <div>
            <p className="text-gray-500 mb-6">
              We couldn't find any {type === "companies" ? "companies" : "HR representatives"} matching "{searchQuery}".
              Try adjusting your search or check for typos.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-gray-500 mb-6">
              {type === "companies" 
                ? "You haven't added any companies yet. Start by adding your first company." 
                : "No HR representatives have been added yet. Invite an HR representative to get started."}
            </p>
          </div>
        )}

        <button
          onClick={() => type === "companies" ? setShowAddModal(true) : setShowInviteModal(true)}
          className="px-5 py-2.5 bg-red text-white rounded-lg hover:bg-red/90 transition-colors flex items-center gap-2 mx-auto"
        >
          <RiAddLine />
          {type === "companies" ? "Add Company" : "Invite HR"}
        </button>
      </div>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <div className="container h-[80vh] bg-white rounded-xl flex flex-col">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                {view === "companies" ? "Companies" : "HR Representatives"}
              </h1>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring" }}
                className="bg-gradient-to-r text-white from-dark to-dark/80 text-lg w-8 h-8 flex items-center justify-center font-semibold rounded-full shadow-sm"
              >
                {view === "companies" ? filteredCompanies.length : filteredRepresentatives.length}
              </motion.div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex rounded-lg overflow-hidden border-2 border-gray-200">
                <button
                  onClick={() => setView("companies")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    view === "companies"
                      ? "bg-dark text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Companies
                </button>
                <button
                  onClick={() => setView("hr")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    view === "hr"
                      ? "bg-dark text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  HR Representatives
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => view === "companies" ? setShowAddModal(true) : setShowInviteModal(true)}
                className="bg-red text-white font-medium py-2.5 px-5 rounded-lg flex items-center gap-2 hover:bg-red/90 transition-colors shadow-sm"
              >
                <RiAddLine />
                <span>{view === "companies" ? "Add Company" : "Invite HR"}</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Search status indicator */}
        {searchQuery && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-3 bg-white"
          >
            <div className="bg-gray-50 py-2 px-4 rounded-lg inline-flex items-center gap-2">
              <RiSearchLine className="text-gray-500" />
              <span>
                Found {view === "companies" ? filteredCompanies.length : filteredRepresentatives.length} result
                {(view === "companies" ? filteredCompanies.length : filteredRepresentatives.length) !== 1 ? "s" : ""} for "{searchQuery}"
              </span>
              <button
                onClick={() => setSearchQuery("")}
                className="ml-2 text-red hover:text-red-700 font-medium"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}

        {/* Main Content Area with hidden scrollbars */}
        <div
          className="flex-1 p-6 overflow-y-auto"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Companies View */}
          {view === "companies" && (
            <>
              {isLoading ? (
                <div className="h-full flex justify-center items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-3 border-gray-200 border-t-red rounded-full"
                  />
                </div>
              ) : error ? (
                <div className="h-full flex justify-center items-center text-red-500">
                  Failed to load companies
                </div>
              ) : filteredCompanies.length === 0 ? (
                <EmptyState type="companies" />
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-5 pb-2"
                >
                  {paginatedCompanies.map((company) => (
                    <motion.div
                      key={company.id}
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                      className="relative"
                    >
                      <div
                        onClick={() => setExpandedCompany(
                          expandedCompany?.id === company.id ? null : company
                        )}
                        className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow transition-all p-5"
                      >
                        <div className="flex flex-col md:flex-row gap-5">
                          {/* Company Logo */}
                          <div className="flex flex-col items-center md:items-start">
                            <div className="w-16 h-16 rounded-lg bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
                              {company.logo ? (
                                <img
                                  src={`${import.meta.env.VITE_URI}${company.logo?.trim()}`}
                                  alt={company.name}
                                  className="w-full h-full object-contain p-2"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '';
                                    const parent = e.target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `<div class="w-full h-full flex items-center justify-center">
                                        <svg class="w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                      </div>`;
                                    }
                                  }}
                                />
                              ) : (
                                <RiBuildingLine size={32} className="text-gray-400" />
                              )}
                            </div>
                          </div>
                          
                          {/* Main Info Column */}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {company.name}
                            </h3>
                            
                            {/* Company Info Cards */}
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 pl-3">
                                <RiGlobalLine className="text-gray-500" size={16} />
                                <div className="overflow-hidden">
                                  <p className="text-xs text-gray-500 line-clamp-1">Website</p>
                                  <a
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-sm font-medium text-red hover:underline truncate block"
                                  >
                                    {company.website}
                                  </a>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 pl-3">
                                <RiMailLine className="text-gray-500" size={16} />
                                <div className="overflow-hidden">
                                  <p className="text-xs text-gray-500 line-clamp-1">Email</p>
                                  <p className="text-sm font-medium text-gray-700 truncate">
                                    {company.headOfficeEmail || "No email provided"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Additional details when expanded */}
                            {expandedCompany?.id === company.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-4 pt-4 border-t border-gray-100"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <RiPhoneLine className="text-gray-500" size={16} />
                                      <p className="text-xs text-gray-500">Phone</p>
                                    </div>
                                    <p className="text-sm font-medium mt-1 pl-6">
                                      {company.headOfficePhone || "No phone provided"}
                                    </p>
                                  </div>
                                  
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <RiMapPinLine className="text-gray-500" size={16} />
                                      <p className="text-xs text-gray-500">Address</p>
                                    </div>
                                    <p className="text-sm font-medium mt-1 pl-6">
                                      {company.headOfficeAddress || "No address provided"}
                                    </p>
                                  </div>
                                  
                                  <div className="bg-gray-50 p-3 rounded-lg md:col-span-2">
                                    <p className="text-xs text-gray-500">Description</p>
                                    <p className="text-sm font-medium mt-1">
                                      {company.description || "No description provided"}
                                    </p>
                                  </div>
                                  
                                  {/* HR Representatives section */}
                                  <div className="md:col-span-2 mt-2">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="font-medium text-gray-700">HR Representatives</h4>
                                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                        {company.Recruiters?.length || 0} HR(s)
                                      </span>
                                    </div>
                                    
                                    {company.Recruiters && company.Recruiters.length > 0 ? (
                                      <div className="space-y-2">
                                        {company.Recruiters.map((recruiter) => (
                                          <div
                                            key={recruiter.id}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                                          >
                                            <div
                                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                getAvatarColor(recruiter.User?.firstName, recruiter.User?.lastName)
                                              }`}
                                            >
                                              <span className="text-sm font-bold">
                                                {getInitials(recruiter.User?.firstName, recruiter.User?.lastName)}
                                              </span>
                                            </div>
                                            <div>
                                              <div className="font-medium">
                                                {recruiter.User?.firstName
                                                  ? `${recruiter.User.firstName} ${recruiter.User.lastName}`
                                                  : "HR Representative"}
                                              </div>
                                              <div className="text-sm text-gray-500">
                                                {recruiter.User?.email}
                                              </div>
                                            </div>
                                            <div className="ml-auto">
                                              <span
                                                className={`px-2 py-1 rounded-full text-xs ${
                                                  recruiter.User?.isVerified
                                                    ? "bg-green-100 text-green-600"
                                                    : "bg-amber-100 text-amber-600"
                                                }`}
                                              >
                                                {recruiter.User?.isVerified ? "Active" : "Pending"}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center py-4 text-gray-500 rounded-lg bg-gray-50">
                                        No HR representatives added yet
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                          
                          {/* Actions Column */}
                          <div className="flex md:flex-col items-center justify-end gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedCompany(expandedCompany?.id === company.id ? null : company);
                              }}
                              className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100"
                            >
                              <RiMoreLine />
                            </button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInviteHR(company);
                              }}
                              className="w-8 h-8 text-red bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center"
                              title="Invite HR"
                            >
                              <RiUserAddLine size={18} />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(company);
                              }}
                              className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-full flex items-center justify-center"
                              title="Edit Company"
                            >
                              <RiEditLine size={18} />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(company);
                              }}
                              className="w-8 h-8 text-red hover:bg-red-50 rounded-full flex items-center justify-center"
                              title="Delete Company"
                            >
                              <RiDeleteBin6Line size={18} />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}

          {/* HR Representatives View */}
          {view === "hr" && (
            <>
              {representativesLoading ? (
                <div className="h-full flex justify-center items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-3 border-gray-200 border-t-red rounded-full"
                  />
                </div>
              ) : representativesError ? (
                <div className="h-full flex justify-center items-center text-red-500">
                  Failed to load HR representatives
                </div>
              ) : filteredRepresentatives.length === 0 ? (
                <EmptyState type="hr" />
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-5 pb-2"
                >
                  {paginatedRepresentatives.map((rep) => (
                    <motion.div
                      key={rep.id}
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                      className="relative"
                    >
                      <div className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow transition-all p-5">
                        <div className="flex flex-col md:flex-row gap-5">
                          {/* Avatar */}
                          <div className="flex flex-col items-center md:items-start">
                            <div
                              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                getAvatarColor(rep.User?.firstName, rep.User?.lastName)
                              }`}
                            >
                              <span className="text-xl font-bold">
                                {getInitials(rep.User?.firstName, rep.User?.lastName)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Main Info Column */}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {rep.User?.firstName} {rep.User?.lastName}
                            </h3>
                            
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                rep.User?.status === "active" || rep.User?.isVerified
                                  ? "bg-green-100 text-green-800"
                                  : "bg-amber-100 text-amber-800"
                              } mt-1`}
                            >
                              {rep.User?.status === "active" || rep.User?.isVerified ? "Active" : "Pending"}
                            </span>
                            
                            {/* Contact Info Cards */}
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 pl-3">
                                <RiMailLine className="text-gray-500" size={16} />
                                <div className="overflow-hidden">
                                  <p className="text-xs text-gray-500 line-clamp-1">Email Address</p>
                                  <p className="text-sm font-medium text-gray-700 truncate">
                                    {rep.User?.email}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 pl-3">
                                <RiBuildingLine className="text-gray-500" size={16} />
                                <div className="overflow-hidden">
                                  <p className="text-xs text-gray-500 line-clamp-1">Company</p>
                                  <p className="text-sm font-medium text-gray-700 truncate">
                                    {rep.Company?.name || "Not assigned"}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 pl-3">
                                <RiCalendarLine className="text-gray-500" size={16} />
                                <div>
                                  <p className="text-xs text-gray-500">Joined Date</p>
                                  <p className="text-sm font-medium text-gray-700">
                                    {formatDate(rep.User?.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Company Logo */}
                          <div className="flex items-center justify-center">
                            <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
                              {rep.Company?.logo ? (
                                <img
                                  src={`${import.meta.env.VITE_URI}${rep.Company.logo}`}
                                  alt={rep.Company.name}
                                  className="w-full h-full object-contain p-2"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '';
                                    e.target.parentElement.innerHTML = `
                                      <div class="flex items-center justify-center w-full h-full">
                                        <svg class="w-6 h-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                      </div>
                                    `;
                                  }}
                                />
                              ) : (
                                <RiBuildingLine size={24} className="text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Pagination - For Companies */}
        {view === "companies" && filteredCompanies.length > 0 && (
          <div className="border-t border-gray-100">
            <div className="px-6 py-4 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-500 order-2 sm:order-1 bg-gray-50 px-4 py-2 rounded-lg">
                Showing <span className="font-semibold">{(companyPage - 1) * 4 + 1}</span> to{" "}
                <span className="font-semibold">{Math.min(companyPage * 4, filteredCompanies.length)}</span> of{" "}
                <span className="font-semibold">{filteredCompanies.length}</span> companies
              </div>

              <div className="flex gap-2 order-1 sm:order-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={companyPage === 1}
                  onClick={() => setCompanyPage((prev) => Math.max(1, prev - 1))}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    companyPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <RiArrowLeftLine />
                </motion.button>

                {/* Page buttons */}
                <div className="flex gap-2">
                  {[...Array(Math.min(5, totalCompanyPages))].map((_, idx) => {
                    let pageNum = idx + 1;
                    if (companyPage > 3 && totalCompanyPages > 5) {
                      pageNum = companyPage - 2 + idx;
                      if (pageNum > totalCompanyPages) {
                        pageNum = totalCompanyPages - (4 - idx);
                      }
                    }

                    if (pageNum < 1 || pageNum > totalCompanyPages) return null;

                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCompanyPage(pageNum)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          companyPage === pageNum
                            ? "bg-red text-white shadow-sm"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={companyPage === totalCompanyPages}
                  onClick={() => setCompanyPage((prev) => Math.min(totalCompanyPages, prev + 1))}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    companyPage === totalCompanyPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <RiArrowRightLine />
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination - For HR Representatives */}
        {view === "hr" && filteredRepresentatives.length > 0 && (
          <div className="border-t border-gray-100">
            <div className="px-6 py-4 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-500 order-2 sm:order-1 bg-gray-50 px-4 py-2 rounded-lg">
                Showing <span className="font-semibold">{(hrPage - 1) * 4 + 1}</span> to{" "}
                <span className="font-semibold">{Math.min(hrPage * 4, filteredRepresentatives.length)}</span> of{" "}
                <span className="font-semibold">{filteredRepresentatives.length}</span> representatives
              </div>

              <div className="flex gap-2 order-1 sm:order-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={hrPage === 1}
                  onClick={() => setHrPage((prev) => Math.max(1, prev - 1))}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    hrPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <RiArrowLeftLine />
                </motion.button>

                {/* Page buttons */}
                <div className="flex gap-2">
                  {[...Array(Math.min(5, totalHrPages))].map((_, idx) => {
                    let pageNum = idx + 1;
                    if (hrPage > 3 && totalHrPages > 5) {
                      pageNum = hrPage - 2 + idx;
                      if (pageNum > totalHrPages) {
                        pageNum = totalHrPages - (4 - idx);
                      }
                    }

                    if (pageNum < 1 || pageNum > totalHrPages) return null;

                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setHrPage(pageNum)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          hrPage === pageNum
                            ? "bg-red text-white shadow-sm"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={hrPage === totalHrPages}
                  onClick={() => setHrPage((prev) => Math.min(totalHrPages, prev + 1))}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    hrPage === totalHrPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <RiArrowRightLine />
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddCompanyModal onClose={() => setShowAddModal(false)} />
      )}
      {showInviteModal && (
        <InviteHrModal
          company={selectedCompany}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedCompany(null);
          }}
        />
      )}
      {showEditModal && selectedCompany && (
        <EditCompanyModal
          company={selectedCompany}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCompany(null);
          }}
        />
      )}
      {showDeleteModal && selectedCompany && (
        <DeleteCompanyModal
          company={selectedCompany}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedCompany(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </DashboardLayout>
  );
};

export default Companies;
