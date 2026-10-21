import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { authState } from "@/store/atoms/authAtom";
import axios from "axios";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layouts/Dashboard";
import { usePagination } from "@/hooks/usePagination";
import InviteAdminModal from "@/components/team/InviteAdminModal";
import { Toast } from "@/components/ui/Toast";
import {
  RiUserAddLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiUserLine,
  RiShieldUserLine,
  RiMailLine,
  RiCalendarLine,
  RiDeleteBin6Line,
  RiSearchLine,
  RiCheckLine,
  RiTeamLine,
  RiEmotionSadLine,
  RiErrorWarningLine,
  RiMoreLine,
} from "react-icons/ri";

const TeamMembers = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expandedMember, setExpandedMember] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const auth = useRecoilValue(authState);
  const queryClient = useQueryClient();

  const { data: pendingInvites, error: pendingInvitesError } = useQuery({
    queryKey: ["pending-invites"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URI}/super-admin/invite/`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        Toast.error(
          error.response?.data?.message || "Failed to fetch pending invites"
        );
        throw error;
      }
    },
  });

  const {
    data: teamData,
    isLoading,
    error: teamDataError,
  } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URI}/super-admin/admin/`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
        const allMembers = [
          ...(response.data.admins || []).map((admin) => ({
            ...admin,
            status: "active",
          })),
          ...(response.data.superAdmins || []).map((admin) => ({
            ...admin,
            status: "active",
          })),
        ];
        return allMembers;
      } catch (error) {
        Toast.error(
          error.response?.data?.message || "Failed to fetch team members"
        );
        throw error;
      }
    },
  });

  // Delete admin mutation
  const deleteAdminMutation = useMutation({
    mutationFn: async (email) => {
      await axios.delete(
        `${import.meta.env.VITE_URI}/super-admin/admin/${email}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["team-members"]);
      Toast.success("Team member removed successfully");
      setConfirmDelete(null);
    },
    onError: (error) => {
      Toast.error(
        error.response?.data?.message || "Failed to remove team member"
      );
      setConfirmDelete(null);
    },
  });

  // Event listener for global search
  useEffect(() => {
    const handleGlobalSearch = (event) => {
      setSearchTerm(event.detail.searchTerm);
    };

    window.addEventListener("globalsearch", handleGlobalSearch);
    return () => {
      window.removeEventListener("globalsearch", handleGlobalSearch);
    };
  }, []);

  // Filter team members
  const filteredMembers = React.useMemo(() => {
    if (!teamData || !Array.isArray(teamData)) return [];
    if (!searchTerm) return teamData;

    const searchLower = searchTerm.toLowerCase().trim();

    return teamData.filter((member) => {
      const fullNameMatch = (member.User?.fullName || "")
        .toLowerCase()
        .includes(searchLower);
      const firstNameMatch = (member.User?.firstName || "")
        .toLowerCase()
        .includes(searchLower);
      const lastNameMatch = (member.User?.lastName || "")
        .toLowerCase()
        .includes(searchLower);
      const emailMatch = (member.User?.email || member.user || "")
        .toLowerCase()
        .includes(searchLower);
      const combinedName = `${member.User?.firstName || ""} ${
        member.User?.lastName || ""
      }`.toLowerCase();
      const combinedNameMatch = combinedName.includes(searchLower);
      const anyNameMatch =
        fullNameMatch || firstNameMatch || lastNameMatch || combinedNameMatch;

      return anyNameMatch || emailMatch;
    });
  }, [teamData, searchTerm]);

  // Pagination with smaller page size (4 items) to fit better without scrolling
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedMembers,
  } = usePagination(filteredMembers, 4);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, setCurrentPage]);

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

  // Helper function for prettier date format
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";

    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.round((now - date) / (1000 * 60 * 60 * 24));

    // Format: "May 15, 2025 (3 days ago)"
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

  const DeleteTeamMemberModal = ({ member, onClose, onConfirm }) => {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red/10 text-red flex items-center justify-center mx-auto mb-4">
              <RiErrorWarningLine size={32} />
            </div>

            <h2 className="text-2xl font-bold text-dark mb-2">
              Remove Team Member
            </h2>
            <p className="text-gray-600 mb-8">
              Are you sure you want to remove{" "}
              <span className="font-medium text-dark">
                {member.User?.firstName} {member.User?.lastName}
              </span>{" "}
              from your team? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className="px-4 py-2 bg-red text-white rounded-lg hover:bg-red/90"
              >
                Remove Member
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container h-[80vh] bg-white rounded-xl flex flex-col">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Team Members</h1>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring" }}
                  className="bg-gradient-to-r text-white from-dark to-dark/80 text-lg w-8 h-8 flex items-center justify-center font-semibold rounded-full shadow-sm"
                >
                  {filteredMembers.length}
                </motion.div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowInviteModal(true)}
              className="self-start md:self-auto bg-red text-white font-medium py-2.5 px-5 rounded-lg flex items-center gap-2 hover:bg-red/90 transition-colors shadow-sm"
            >
              <RiUserAddLine />
              <span>Invite Team Member</span>
            </motion.button>
          </div>
        </div>

        {/* Main Content Area with hidden scrollbars */}
        <div
          className="flex-1 p-6 overflow-y-auto"
          style={{
            scrollbarWidth: "none", /* Firefox */
            msOverflowStyle: "none",  /* IE and Edge */
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none; /* Chrome, Safari and Opera */
            }
          `}</style>

          {isLoading ? (
            <div className="h-full flex justify-center items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-3 border-gray-200 border-t-red rounded-full"
              />
            </div>
          ) : filteredMembers.length === 0 ? (
            // Empty state content remains the same
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full flex flex-col items-center justify-center"
            >
              {/* Empty state illustration */}
              <div className="w-72 h-72 mb-4">
                <RiTeamLine className="w-full h-full text-dark/20" />
              </div>

              <div className="text-center max-w-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  No team members found
                </h3>

                {searchTerm ? (
                  <div>
                    <p className="text-gray-500 mb-6">
                      We couldn't find any team members matching "{searchTerm}".
                      Try adjusting your search or check for typos.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-6">
                      Your team is empty. Start building your team by inviting
                      your first team member.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* Team Members Cards */
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-5 pb-2"
            >
              {paginatedMembers.map((member) => (
                <motion.div
                  key={member.User?.email || member.id}
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  className="relative"
                >
                  <div
                    onClick={() =>
                      setExpandedMember(
                        expandedMember === member.id ? null : member.id
                      )
                    }
                    className={`${getAvatarColor(
                            member.User?.firstName,
                            member.User?.lastName
                          )} bg-opacity-10 rounded-lg border  hover:shadow transition-all p-5`}
                  >
                    <div className="flex flex-col md:flex-row gap-5">
                      {/* Avatar Column */}
                      <div className="flex flex-col items-center md:items-start">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center ${getAvatarColor(
                            member.User?.firstName,
                            member.User?.lastName
                          )}`}
                        >
                          <span className="text-xl font-bold">
                            {getInitials(
                              member.User?.firstName,
                              member.User?.lastName
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Main Info Column */}
                      <div className="flex-1">
                        {/* Name */}
                        <h3 className="text-lg font-semibold text-gray-800">
                          {member.User?.firstName} {member.User?.lastName}
                        </h3>

                        {/* Contact Info - Redesigned */}
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                          <div className="flex items-center gap-2 bg-background rounded-lg p-2 pl-3">
                            <RiMailLine className="text-gray-500" size={16} />
                            <div className="overflow-hidden">
                              <p className="text-xs text-gray-500 line-clamp-1">
                                Email Address
                              </p>
                              <p className="text-sm font-medium text-gray-700 truncate">
                                {member.User?.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 bg-background rounded-lg p-2 pl-3">
                            <RiCalendarLine
                              className="text-gray-500"
                              size={16}
                            />
                            <div>
                              <p className="text-xs text-gray-500">
                                Joined Team
                              </p>
                              <p className="text-sm font-medium text-gray-700">
                                {formatDate(member.User?.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Additional info for expanded state */}
                        {expandedMember === member.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4 pt-4 border-t"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-background px-4 py-2 rounded-lg">
                                <p className="text-xs text-muted">
                                  Added By
                                </p>
                                <p className="text-sm font-medium">
                                  {member.User?.addedBy || "System"}
                                </p>
                              </div>

                              <div className="bg-background px-4 py-2 rounded-lg">
                                <p className="text-xs text-gray-500">Status</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      member.status === "active"
                                        ? "bg-green-500"
                                        : "bg-amber-500"
                                    }`}
                                  ></span>
                                  <span className="text-sm font-medium">
                                    {member.status === "active"
                                      ? "Active"
                                      : "Pending"}
                                  </span>
                                </div>
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
                            setExpandedMember(
                              expandedMember === member.id ? null : member.id
                            );
                          }}
                          className="w-8 h-8 bg-background rounded-full flex items-center justify-center hover:bg-gray-100"
                        >
                          <RiMoreLine />
                        </button>

                        {/* Delete button */}
                        {confirmDelete === member.User?.email ? (
                          <div className="flex flex-col gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAdminMutation.mutate(member.User?.email);
                              }}
                              className="text-sm px-3 py-1.5 text-white bg-red rounded-md flex items-center justify-center gap-1 whitespace-nowrap"
                            >
                              <RiCheckLine size={14} /> Confirm
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDelete(null);
                              }}
                              className="text-sm px-3 py-1.5 text-dark bg-gray-100 rounded-md whitespace-nowrap"
                            >
                              Cancel
                            </motion.button>
                          </div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMember(member);
                              setShowDeleteModal(true);
                            }}
                            className="w-8 h-8 text-red hover:bg-red-50 rounded-full flex items-center justify-center"
                          >
                            <RiDeleteBin6Line size={18} />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Pagination - Enhanced Design */}
        {filteredMembers.length > 0 && (
          <div className="border-t ">
            <div className="px-6 py-4 bg-white rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-dark order-2 sm:order-1 bg-background px-4 py-3 rounded-lg">
                Showing{" "}
                <span className="font-semibold ">
                  {(currentPage - 1) * 4 + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold ">
                  {Math.min(currentPage * 4, filteredMembers.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold ">
                  {filteredMembers.length}
                </span>{" "}
                team members
              </div>

              <div className="flex gap-2 order-1 sm:order-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentPage === 1
                      ? "text-white"
                      : "bg-background text-dark hover:bg-muted/80 hover:text-white"
                  }`}
                >
                  <RiArrowLeftLine />
                </motion.button>

                {/* Page buttons */}
                <div className="flex gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    // Calculate which page number to show
                    let pageNum = idx + 1;
                    if (currentPage > 3 && totalPages > 5) {
                      pageNum = currentPage - 2 + idx;
                      if (pageNum > totalPages) {
                        pageNum = totalPages - (4 - idx);
                      }
                    }

                    // Skip invalid page numbers
                    if (pageNum < 1 || pageNum > totalPages) return null;

                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          currentPage === pageNum
                            ? "bg-red text-white shadow-sm"
                            : "bg-background hover:bg-muted/80 text-dark hover:text-white"
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
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentPage === totalPages || totalPages === 0
                      ? "text-white"
                      : "bg-background text-dark hover:bg-muted/80 hover:text-white"
                  }`}
                >
                  <RiArrowRightLine />
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showInviteModal && (
        <InviteAdminModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            queryClient.invalidateQueries(["team-members"]);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMember && (
        <DeleteTeamMemberModal
          member={selectedMember}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedMember(null);
          }}
          onConfirm={() => {
            deleteAdminMutation.mutate(selectedMember.User?.email);
            setShowDeleteModal(false);
            setSelectedMember(null);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default TeamMembers;
