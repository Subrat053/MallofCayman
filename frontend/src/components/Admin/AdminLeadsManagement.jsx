import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineChatAlt2,
  HiOutlineHome,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineFilter,
  HiOutlineAnnotation,
} from "react-icons/hi";

// ─── Constants ────────────────────────────────────────────────────────────────
const LEAD_STATUSES = [
  { value: "new", label: "New", color: "bg-blue-100 text-blue-700" },
  { value: "contacted", label: "Contacted", color: "bg-yellow-100 text-yellow-700" },
  { value: "qualified", label: "Qualified", color: "bg-purple-100 text-purple-700" },
  { value: "closed", label: "Closed", color: "bg-green-100 text-green-700" },
];

const INQUIRY_LABELS = {
  details: "Request Details",
  visit: "Schedule Visit",
  general: "General",
};

// ─── Lead Card ─────────────────────────────────────────────────────────────────
const LeadCard = ({ lead, onStatusChange, onDelete, onNotesUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(lead.adminNotes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const statusOpt = LEAD_STATUSES.find((s) => s.value === lead.status) || LEAD_STATUSES[0];

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      await axios.patch(
        `${server}/property/admin/update-lead-status/${lead._id}`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success("Status updated!");
      onStatusChange();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await axios.patch(
        `${server}/property/admin/update-lead-status/${lead._id}`,
        { adminNotes: notes },
        { withCredentials: true }
      );
      toast.success("Notes saved!");
      onNotesUpdate();
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Top row */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Lead info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusOpt.color}`}>
                {statusOpt.label}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                {INQUIRY_LABELS[lead.inquiryType] || "Inquiry"}
              </span>
              <span className="text-xs text-gray-400 ml-auto sm:ml-0">
                {new Date(lead.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </span>
            </div>

            <h3 className="font-bold text-gray-900 text-base mb-0.5">{lead.name}</h3>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <HiOutlineMail className="w-3.5 h-3.5 text-blue-400" />
                <a href={`mailto:${lead.email}`} className="hover:text-blue-600 transition-colors">
                  {lead.email}
                </a>
              </span>
              <span className="flex items-center gap-1">
                <HiOutlinePhone className="w-3.5 h-3.5 text-blue-400" />
                <a href={`tel:${lead.phone}`} className="hover:text-blue-600 transition-colors">
                  {lead.phone}
                </a>
              </span>
            </div>

            {/* Property reference */}
            {lead.property && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5 w-fit">
                <HiOutlineHome className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <a
                  href={`/real-estate/${lead.property.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline line-clamp-1 max-w-[200px]"
                >
                  {lead.property.title}
                </a>
                {lead.property.price && (
                  <span className="text-gray-400 ml-1">
                    ${Number(lead.property.price).toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right: Status + Actions */}
          <div className="flex flex-col items-end gap-2">
            <select
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={statusLoading}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400 ${statusOpt.color}`}
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Toggle details"
              >
                {expanded ? (
                  <HiOutlineChevronUp className="w-4 h-4" />
                ) : (
                  <HiOutlineChevronDown className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => onDelete(lead._id, lead.name)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Delete lead"
              >
                <HiOutlineTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded: Message + Notes */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50/50 space-y-4">
          {/* Message */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <HiOutlineChatAlt2 className="w-4 h-4" />
              Message from Client
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed bg-white rounded-xl p-3 border border-gray-100">
              {lead.message}
            </p>
          </div>

          {/* Admin Notes */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <HiOutlineAnnotation className="w-4 h-4" />
              Admin Notes
            </h4>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this lead..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-70"
              >
                {savingNotes ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3.5 py-2 rounded-xl hover:bg-blue-700 transition-all font-medium"
            >
              <HiOutlineMail className="w-3.5 h-3.5" />
              Email Client
            </a>
            <a
              href={`tel:${lead.phone}`}
              className="flex items-center gap-1.5 text-xs bg-green-600 text-white px-3.5 py-2 rounded-xl hover:bg-green-700 transition-all font-medium"
            >
              <HiOutlinePhone className="w-3.5 h-3.5" />
              Call Client
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Stats Card ────────────────────────────────────────────────────────────────
const StatsCard = ({ label, value, color, bg }) => (
  <div className={`${bg} rounded-2xl p-4 text-center border border-white/30`}>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
    <p className={`text-xs font-semibold mt-1 ${color} opacity-80`}>{label}</p>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────────
const AdminLeadsManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [filters, setFilters] = useState({ status: "all", search: "" });
  const [appliedFilters, setAppliedFilters] = useState({ status: "all", search: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchLeads = useCallback(async (page = 1, f = appliedFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (f.status !== "all") params.append("status", f.status);
      if (f.search) params.append("search", f.search);

      const { data } = await axios.get(
        `${server}/property/admin/get-leads?${params.toString()}`,
        { withCredentials: true }
      );
      setLeads(data.leads || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(
        `${server}/property/admin/leads-stats`,
        { withCredentials: true }
      );
      setStats(data.stats || []);
      setTotalProperties(data.totalProperties || 0);
    } catch {}
  };

  useEffect(() => {
    fetchLeads(1, appliedFilters);
    fetchStats();
  }, [appliedFilters]);

  const handleDelete = async (id, name) => {
    setDeleteLoading(true);
    try {
      await axios.delete(`${server}/property/admin/delete-lead/${id}`, {
        withCredentials: true,
      });
      toast.success(`Lead from "${name}" deleted`);
      setDeleteConfirm(null);
      fetchLeads(currentPage, appliedFilters);
      fetchStats();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatCount = (statusValue) => {
    const found = stats.find((s) => s._id === statusValue);
    return found ? found.count : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HiOutlineChatAlt2 className="w-7 h-7 text-blue-600" />
          Property Leads
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage inquiry leads from property contact forms
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatsCard label="New Leads" value={getStatCount("new")} color="text-blue-700" bg="bg-blue-50" />
        <StatsCard label="Contacted" value={getStatCount("contacted")} color="text-yellow-700" bg="bg-yellow-50" />
        <StatsCard label="Qualified" value={getStatCount("qualified")} color="text-purple-700" bg="bg-purple-50" />
        <StatsCard label="Closed" value={getStatCount("closed")} color="text-green-700" bg="bg-green-50" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && setAppliedFilters({ ...filters })}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[{ value: "all", label: `All (${total})` }, ...LEAD_STATUSES].map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  const newF = { ...filters, status: s.value };
                  setFilters(newF);
                  setAppliedFilters(newF);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  appliedFilters.status === s.value
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s.label}
                {s.value !== "all" && (
                  <span className="ml-1 opacity-70">({getStatCount(s.value)})</span>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => setAppliedFilters({ ...filters })}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-gray-100"></div>
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <HiOutlineChatAlt2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-600 mb-1">No leads found</h3>
          <p className="text-gray-400 text-sm">Leads will appear here when users submit contact forms</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <LeadCard
              key={lead._id}
              lead={lead}
              onStatusChange={() => { fetchLeads(currentPage, appliedFilters); fetchStats(); }}
              onDelete={(id, name) => setDeleteConfirm({ id, name })}
              onNotesUpdate={() => fetchLeads(currentPage, appliedFilters)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchLeads(page, appliedFilters)}
              className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-blue-50"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Lead</h3>
            <p className="text-gray-600 text-sm mb-5">
              Delete inquiry from <strong>"{deleteConfirm.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id, deleteConfirm.name)}
                disabled={deleteLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-70"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeadsManagement;
