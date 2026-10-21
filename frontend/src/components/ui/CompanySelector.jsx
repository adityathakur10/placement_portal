import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { authState } from "@/store/atoms/authAtom";
import axios from "axios";
import {
  RiSearchLine,
  RiBuildingLine,
  RiCloseLine,
  RiArrowDownSLine,
  RiCheckLine,
} from "react-icons/ri";
import { Toast } from "@/components/ui/toast";

const CompanySelector = ({ value, onChange, error }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const auth = useRecoilValue(authState);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_URI}/super-admin/company`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      return response.data.data;
    },
  });

  // Filter companies based on search term
  const filteredCompanies = !companies
    ? []
    : companies.filter((company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Find selected company name
  const selectedCompany = companies?.find((c) => c.id === value);

  // Reset highlighted index when filtered companies change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredCompanies.length]);

  // Handle input change
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);

    // If there was a selected company, clear it since user is typing something new
    if (value) {
      onChange({ id: "" });
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    setSearchTerm("");
    onChange({ id: "" });
    // Focus the input after clearing
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCompanies.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault(); // Prevent form submission
        if (filteredCompanies.length > 0) {
          const selectedCompany = filteredCompanies[highlightedIndex];
          onChange(selectedCompany);
          setIsOpen(false);
          Toast.success(`Selected ${selectedCompany.name}`);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Select a company from the dropdown
  const selectCompany = (company) => {
    onChange(company);
    setIsOpen(false);
    Toast.success(`Selected ${company.name}`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Modern Select Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-full flex items-center justify-between bg-white px-4 py-3 rounded-lg border cursor-pointer ${
          error
            ? "border-red-500"
            : isOpen
            ? "border-red shadow-sm"
            : "border-gray-300 hover:border-gray-400"
        } transition-all duration-200`}
      >
        {/* When a company is selected */}
        {selectedCompany ? (
          <div className="flex items-center gap-3 w-full pr-8">
            <div className="w-8 h-8 shrink-0 bg-gray-100 flex items-center justify-center overflow-hidden">
              {selectedCompany.logo ? (
                <img
                  src={`${import.meta.env.VITE_URI}${selectedCompany.logo}`}
                  alt={selectedCompany.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML = `<div class="flex items-center justify-center">
                      <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg" class="text-gray-400"><path d="M19 2H9c-1.103 0-2 .897-2 2v5.586l-4.707 4.707A1 1 0 0 0 3 16v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4c0-1.103-.897-2-2-2zm-8 18H5v-5.586l3-3 3 3V20zm8 0h-6v-4a.999.999 0 0 0 .707-1.707L9 9.586V4h10v16z"></path><path d="M11 6h2v2h-2zm4 0h2v2h-2zm0 4.031h2V12h-2zM15 14h2v2h-2zm-8 1h2v2H7z"></path></svg>
                    </div>`;
                  }}
                />
              ) : (
                <RiBuildingLine size={18} className="text-gray-500" />
              )}
            </div>
            <div className="truncate">
              <span className="font-medium">{selectedCompany.name}</span>
            </div>

            {/* Clear selection button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClearSelection();
              }}
              className="absolute right-10 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-red/10 hover:text-red transition-colors"
            >
              <RiCloseLine size={18} />
            </button>
          </div>
        ) : (
          // When no company is selected
          <div className="flex items-center gap-2 text-gray-500">
            <RiBuildingLine size={18} />
            <span>Select Company</span>
          </div>
        )}

        <RiArrowDownSLine
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180 text-red" : "text-gray-400"
          }`}
          size={20}
        />
      </div>

      {/* Search and dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-muted/10 overflow-hidden">
          {/* Search input */}
          <div className="p-3 border-b border-muted.10">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Search companies..."
                className="input input-sm w-full pl-8"
                autoFocus
              />
              <RiSearchLine
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="loading loading-spinner loading-sm text-red"></div>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm
                  ? "No companies match your search"
                  : "No companies available"}
              </div>
            ) : (
              filteredCompanies.map((company, index) => (
                <button
                  key={company.id}
                  type="button"
                  className={`w-full text-left p-3 hover:bg-muted/20 transition-colors relative ${
                    index === highlightedIndex ? "" : ""
                  }`}
                  onClick={() => selectCompany(company)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-md p-1 ${
                        index === highlightedIndex ? "bg-white" : ""
                      } flex items-center justify-center overflow-hidden`}
                    >
                      {company.logo ? (
                        <img
                          src={`${import.meta.env.VITE_URI}${company.logo}`}
                          alt={company.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML = `<div class="flex items-center justify-center">
                              <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg" class="text-gray-400"><path d="M19 2H9c-1.103 0-2 .897-2 2v5.586l-4.707 4.707A1 1 0 0 0 3 16v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4c0-1.103-.897-2-2-2zm-8 18H5v-5.586l3-3 3 3V20zm8 0h-6v-4a.999.999 0 0 0 .707-1.707L9 9.586V4h10v16z"></path><path d="M11 6h2v2h-2zm4 0h2v2h-2zm0 4.031h2V12h-2zM15 14h2v2h-2zm-8 1h2v2H7z"></path></svg>
                            </div>`;
                          }}
                        />
                      ) : (
                        <RiBuildingLine size={18} className="text-muted" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {company.name}
                        {company.id === value && (
                          <RiCheckLine className="text-red" size={18} />
                        )}
                      </div>
                      {company.headOfficeAddress && (
                        <div className="text-sm text-muted">
                          {company.headOfficeAddress}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySelector;
