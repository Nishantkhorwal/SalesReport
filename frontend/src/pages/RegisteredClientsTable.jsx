import { useEffect, useState } from "react"
import {
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  Image,
} from "lucide-react"

const RegisteredClientsTable = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [search, setSearch] = useState("")
  const [createdByRole, setCreatedByRole] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [openMenu, setOpenMenu] = useState(null)
  const [cpModal, setCpModal] = useState(false)
  const [cpLoading, setCpLoading] = useState(false)
  const [cpData, setCpData] = useState(null)
  const [cpError, setCpError] = useState("")


  // Edit modal state
  const [editClient, setEditClient] = useState(null)
  const [editForm, setEditForm] = useState({
    clientName: "",
    phoneLast4: "",
    rmName: "",
  })

  // Delete modal
  const [deleteClient, setDeleteClient] = useState(null)

  // ================= REPORT STATES =================
    const [reportFilterModal, setReportFilterModal] = useState(false)
    const [reportModal, setReportModal] = useState(false)
    const [reportType, setReportType] = useState("monthly")
    const [customStart, setCustomStart] = useState("")
    const [customEnd, setCustomEnd] = useState("")
    const [reportData, setReportData] = useState(null)
    const [reportLoading, setReportLoading] = useState(false)
    const [reportError, setReportError] = useState("")
    const [reportPage, setReportPage] = useState(1)
    const [reportTotalPages, setReportTotalPages] = useState(1)
    const [reportSearch, setReportSearch] = useState("")


    const [clientModal, setClientModal] = useState(false)
    const [selectedPartner, setSelectedPartner] = useState(null)
    const [clientReportData, setClientReportData] = useState([])
    const [clientReportLoading, setClientReportLoading] = useState(false)
    const [clientReportError, setClientReportError] = useState("")
    const [clientReportPage, setClientReportPage] = useState(1)
    const [clientReportTotalPages, setClientReportTotalPages] = useState(1)
    const [clientReportSearch, setClientReportSearch] = useState("")



  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user"))
  const isAdmin = user?.role === "admin"


  const fetchClients = async () => {
    setLoading(true)

    

    const params = new URLSearchParams({
      page,
      ...(search && { search }),
      ...(createdByRole && { createdByRole }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
    })

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/register/get?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const result = await res.json()
      if (!res.ok) throw new Error(result.message)

      setData(result.data)
      setTotalPages(result.totalPages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  const fetchChannelPartnersReport = async (pageNumber = 1) => {
  try {
    setReportLoading(true)
    setReportError("")
    setReportModal(true)

    let query = `type=${reportType}&page=${pageNumber}&limit=10`

    if (reportSearch) {
      query += `&search=${reportSearch}`
    }

    if (reportType === "custom") {
      if (!customStart || !customEnd) {
        setReportError("Please select both start and end dates")
        setReportLoading(false)
        return
      }

      query += `&startDate=${customStart}&endDate=${customEnd}`
    }

    const res = await fetch(
      `${API_BASE_URL}/api/register/report?${query}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const result = await res.json()
    console.log("📊 Full Report Data:", result)

    if (!res.ok || !result.success) {
      throw new Error(result.message || "Failed to fetch report")
    }

    setReportData(result.data)
    setReportTotalPages(result.data.totalPages)
    setReportPage(result.data.currentPage)

  } catch (err) {
    setReportError(err.message)
  } finally {
    setReportLoading(false)
    setReportFilterModal(false)
  }
}



  useEffect(() => {
  fetchClients()
}, [page, search, fromDate, toDate])


useEffect(() => {
  if (clientModal && selectedPartner) {
    fetchClientReportData(clientReportPage)
  }
}, [clientModal, selectedPartner, clientReportPage, fromDate, toDate])






  const applyFilters = () => {
  setPage(1)
}

const openEdit = (client) => {
  setEditClient(client)
  setEditForm({
    clientName: client.clientName,
    phoneLast4: client.phoneLast4,
    rmName: client.channelPartner?.rmName || "",
  })
}
const openClientReportModal = (partnerId) => {
  console.log("Opening modal for partner:", partnerId) // Debug log
  setSelectedPartner(partnerId)
  setClientReportPage(1)
  setClientReportSearch("")
  setClientModal(true)
}
const fetchClientReportData = async (pageNumber = 1) => {
  if (!selectedPartner) return

  try {
    setClientReportLoading(true)
    setClientReportError("")

    let query = `page=${pageNumber}&limit=10`

    if (clientReportSearch) {
      query += `&search=${clientReportSearch}`
    }

    // Add date filters if they exist
    if (fromDate) {
      query += `&startDate=${fromDate}`
    }
    if (toDate) {
      query += `&endDate=${toDate}`
    }

    const res = await fetch(
      `${API_BASE_URL}/api/register/channel-partner/${selectedPartner}/clients?${query}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const result = await res.json()
    

    if (!res.ok || !result.success) {
      throw new Error(result.message)
    }

    // FIX: The data is directly in result.data, not result.data.clients
    setClientReportData(result.data || [])
    setClientReportTotalPages(result.totalPages || 1)
    setClientReportPage(result.page || 1)
     

  } catch (err) {
    setClientReportError(err.message)
  } finally {
    setClientReportLoading(false)
  }
}



  const saveEdit = async () => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/register/register/${editClient._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientName: editForm.clientName,
          phoneLast4: editForm.phoneLast4,
          rmName: editForm.rmName,
        }),
      }
    )

    const result = await res.json()
    if (!res.ok) throw new Error(result.message)

    setData((prev) =>
      prev.map((item) =>
        item._id === editClient._id
          ? { ...item, ...result.data }
          : item
      )
    )
    fetchClients()

    setEditClient(null)
  } catch (err) {
    alert(err.message)
  }
}


  const confirmDelete = async () => {
    try {
      await fetch(
        `${API_BASE_URL}/api/register/register/${deleteClient._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setData((prev) =>
        prev.filter((c) => c._id !== deleteClient._id)
      )

      setDeleteClient(null)
    } catch (err) {
      alert("Delete failed")
    }
  }
  

  const fetchChannelPartnerDetails = async (clientId) => {
  if (!clientId) return

  try {
    setCpLoading(true)
    setCpError("")
    setCpData(null)
    setCpModal(true)

    const res = await fetch(
      `${API_BASE_URL}/api/register/channel-partner/${clientId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const result = await res.json()

    if (!res.ok || !result.success) {
      setCpError(result.message || "No information available")
      return
    }

    setCpData(result.data) // 👈 IMPORTANT
  } catch (err) {
    setCpError("Failed to fetch details")
  } finally {
    setCpLoading(false)
  }
}







  return (
    <div className="min-h-screen ml-5 bg-[#0b1220] p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Registered Clients
          </h1>

          {isAdmin && (
            <button
              onClick={() => setReportFilterModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Channel Partners Report
            </button>
          )}

        </div>

        {/* Filters */}
        <div className="bg-[#111827] border border-white/10 rounded-xl p-4 
                grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 
                gap-3 md:gap-4 items-end">

  {/* Search */}
  <div className="relative w-full">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
    <input
      type="text"
      placeholder="Search.."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full h-10 pl-9 pr-3 
                 bg-[#0b1220] border border-white/10 
                 rounded-md text-sm focus:outline-none"
    />
  </div>

  {/* From Date */}
  <div className="relative w-full">
    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
    <input
      type="date"
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
      className="w-full h-10 pl-9 pr-3 
                 bg-[#0b1220] border border-white/10 
                 rounded-md text-sm"
    />
  </div>

  {/* To Date */}
  <div className="relative w-full">
    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
    <input
      type="date"
      value={toDate}
      onChange={(e) => setToDate(e.target.value)}
      className="w-full h-10 pl-9 pr-3 
                 bg-[#0b1220] border border-white/10 
                 rounded-md text-sm"
    />
  </div>

  {/* Empty div to maintain layout balance on md */}
  <div className="hidden md:block"></div>

  {/* Apply */}
  <button
    onClick={applyFilters}
    className="w-full h-10 
               flex items-center justify-center gap-2 
               bg-indigo-600 hover:bg-indigo-500 
               rounded-md text-sm font-medium 
               transition-colors duration-200"
  >
    <Filter className="h-4 w-4" />
    Apply
  </button>

</div>

        
        {/* REPORT FILTER MODAL */}
        {reportFilterModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#111827] p-6 rounded-xl w-full max-w-md space-y-4">
              <h2 className="text-lg font-semibold">Select Report Type</h2>

              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full p-2 bg-[#0b1220] border border-white/10 rounded"
              >
                <option value="daily">Today</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom Date</option>
              </select>

              {reportType === "custom" && (
                <div className="space-y-3">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full p-2 bg-[#0b1220] border border-white/10 rounded"
                  />
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full p-2 bg-[#0b1220] border border-white/10 rounded"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button onClick={() => setReportFilterModal(false)}>
                  Cancel
                </button>
                <button
                  onClick={fetchChannelPartnersReport}
                  className="bg-indigo-600 px-4 py-2 rounded"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        )}


        {/* GLOBAL REPORT MODAL */}
        {reportModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-[#111827] p-6 rounded-xl w-full max-w-5xl space-y-6 relative">

              <button
                onClick={() => setReportModal(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-semibold text-indigo-400">
                Channel Partners Report ({reportData?.filterType})
              </h2>

              {reportLoading ? (
                <p className="text-white/60">Generating report...</p>
              ) : reportError ? (
                <p className="text-red-400">{reportError}</p>
              ) : reportData ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0b1220] p-4 rounded-lg">
                      <p className="text-white/40 text-sm">Total Partners</p>
                      <p className="text-2xl font-semibold">
                        {reportData.totalPartners}
                      </p>
                    </div>
                    <div className="bg-[#0b1220] p-4 rounded-lg">
                      <p className="text-white/40 text-sm">Total Clients</p>
                      <p className="text-2xl font-semibold">
                        {reportData.grandTotalClients}
                      </p>
                    </div>
                  </div>
                  


                  {/* Table */}
                  <div className="overflow-x-auto max-h-[450px] overflow-y-auto border border-white/10 rounded-lg">
                  <div className="flex px-4 py-3 justify-between items-center">
                    <input
                      type="text"
                      placeholder="Search Channel Partner..."
                      value={reportSearch}
                      onChange={(e) => {
                        setReportSearch(e.target.value)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setReportPage(1)
                          fetchChannelPartnersReport(1)
                        }
                      }}
                      className="w-64 p-2 bg-[#0b1220] border border-white/10 rounded text-sm"
                    />

                    <p className="text-sm text-white/40">
                      Showing Page {reportPage} of {reportTotalPages}
                    </p>
                  </div>
                    <table className="min-w-full text-sm text-left text-white">
                      <thead className="bg-[#0b1220] sticky top-0">
                        <tr className="border-b border-white/10 text-white/60 uppercase text-xs tracking-wider">
                          <th className="px-4 py-3">Rank</th>
                          <th className="px-4 py-3">Channel Partner</th>
                          <th className="px-4 py-3">RM Name</th>
                          <th className="px-4 py-3">Owner Name</th>
                          <th className="px-4 py-3 text-right">Total Clients</th>
                        </tr>
                      </thead>

                      <tbody>
                        {reportData.report.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-6 text-white/40">
                              No data found for selected date range
                            </td>
                          </tr>
                        ) : (
                          reportData.report.map((partner, index) => (
                            <tr
                              key={partner._id}
                              className="border-b border-white/5 hover:bg-white/5 transition"
                            >
                              <td className="px-4 py-3 font-medium">
                                #{index + 1}
                              </td>

                              <td className="px-4 py-3 font-semibold text-indigo-400">
                                {partner.partnerName}
                              </td>

                              <td className="px-4 py-3">
                                {partner.rmName || "Not Assigned"}
                              </td>

                              <td className="px-4 py-3">
                                {partner.ownerName || "-"}
                              </td>
                              <td className="px-4 py-3 text-right font-bold flex justify-end gap-3">
                                {partner.totalClients}

                                <button
                                  onClick={() => openClientReportModal(partner._id)}
                                  className="text-indigo-400 text-xs hover:underline"
                                >
                                  Show Clients
                                </button>
                              </td>

                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    <div className="flex justify-end items-center gap-3 mt-4">
                    <button
                      disabled={reportPage === 1}
                      onClick={() => setReportPage((p) => p - 1)}
                      className="p-2 border border-white/10 rounded-md disabled:opacity-40"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <span className="text-sm">
                      Page {reportPage} of {reportTotalPages}
                    </span>

                    <button
                      disabled={reportPage === reportTotalPages}
                      onClick={() => setReportPage((p) => p + 1)}
                      className="p-2 border border-white/10 rounded-md disabled:opacity-40"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  </div>

                </>
              ) : null}
            </div>
          </div>
        )}



        {/* TABLE */}
      <div className="bg-[#111827] rounded-xl overflow-hidden">
        {/* Horizontal scroll on md & sm */}
        <div className="overflow-x-auto">
          <table className="sm:min-w-[500px] md:min-w-[700px] lg:min-w-[900px] w-full text-sm">
            <thead className="bg-[#0b1220] text-white/70">
              <tr>
                <th className="px-4 py-3 text-left">Client</th>

                {/* Hide on small screens */}
                <th className="px-4 py-3 text-center ">
                  Phone
                </th>

                <th className="px-4 py-3 text-center ">
                  Channel Partner
                </th>

                <th className="px-4 py-3 text-center ">
                  Created By
                </th>

                <th className="px-4 py-3 text-center ">
                  Date
                </th>

                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr
                  key={item._id}
                  className="border-t border-white/5 hover:bg-white/5 transition"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{item.clientName}</span>

                      {item.clientPhoto && (
                        <button
                          onClick={() =>
                            window.open(
                              `${API_BASE_URL}/${item.clientPhoto}`,
                              "_blank"
                            )
                          }
                          className="text-blue-400 hover:text-blue-600 transition"
                          title="View Client Photo"
                        >
                          <Image size={16} />
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center ">
                    ****{item.phoneLast4}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() =>
                        fetchChannelPartnerDetails(item.channelPartner?._id)
                      }

                      className="text-indigo-400 hover:underline hover:text-indigo-300 transition"
                    >
                      {item.channelPartner?.name || "-"}
                    </button>
                  </td>


                  <td className="px-4 py-3 text-center">
                    {item.createdBy?.name || "-"}
                  </td>

                  <td className="px-4 py-3 text-center ">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-3 text-center relative">
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === item._id ? null : item._id)
                      }
                      className="p-1 rounded hover:bg-white/10"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMenu === item._id && (
                      <div className="fixed right-4 mt-2 bg-[#0b1220] border border-white/10 rounded-md shadow-xl z-50 min-w-[140px]">
                        <button
                          onClick={() => {
                            openEdit(item)
                            setOpenMenu(null)
                          }}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 w-full text-left"
                        >
                          <Pencil size={14} /> Edit
                        </button>

                        <button
                          onClick={() => {
                            setDeleteClient(item)
                            setOpenMenu(null)
                          }}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 text-red-400 w-full text-left"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHANNEL PARTNER MODAL */}
      {cpModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#111827] rounded-xl p-6 w-full max-w-md space-y-4 relative">

            <button
              onClick={() => setCpModal(false)}
              className="absolute top-3 right-3 text-white/50 hover:text-white"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-semibold text-indigo-400">
              Channel Partner Details
            </h2>

            {cpLoading ? (
              <p className="text-white/60 text-sm">Loading...</p>
            ) : cpError ? (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-md">
                <p className="text-red-400 text-sm font-medium">
                  No Information Available
                </p>
                <p className="text-white/50 text-xs mt-1">
                  There is no stored meeting record for this channel partner.
                </p>
              </div>
            ) : cpData ? (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-white/40 uppercase text-xs tracking-wide">
                    Relationship Manager
                  </span>
                  <p className="font-semibold text-indigo-400 mt-1">
                    {cpData.rmName || "Not Assigned"}
                  </p>
                </div>
                <div>
                  <span className="text-white/50">Owner Name:</span>
                  <p className="font-medium">{cpData.ownerName || "-"}</p>
                </div>

                <div>
                  <span className="text-white/50">Phone Number:</span>
                  <p className="font-medium">{cpData.phoneNumber || "-"}</p>
                </div>

                <div>
                  <span className="text-white/50">Email:</span>
                  <p className="font-medium">{cpData.email || "-"}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
      {clientModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#111827] p-6 rounded-xl w-full max-w-4xl space-y-4 relative">

            <button
              onClick={() => setClientModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold text-indigo-400">
              Channel Partner Clients
            </h2>

            {/* SEARCH */}
            <div className="flex justify-between items-center">
              <input
                type="text"
                placeholder="Search clients..."
                value={clientReportSearch}
                onChange={(e) => setClientReportSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setClientReportPage(1)
                    fetchClientReportData(1)
                  }
                }}
                className="w-64 p-2 bg-[#0b1220] border border-white/10 rounded text-sm"
              />

              <p className="text-sm text-white/40">
                Page {clientReportPage} of {clientReportTotalPages}
              </p>
            </div>

            {clientReportLoading ? (
              <p className="text-white/60">Loading clients...</p>
            ) : clientReportError ? (
              <p className="text-red-400">{clientReportError}</p>
            ) : (
              <>
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto border border-white/10 rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#0b1220] sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left">Client</th>
                        <th className="px-4 py-3 text-center">Phone</th>
                        <th className="px-4 py-3 text-center">Created By</th>
                        <th className="px-4 py-3 text-center">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientReportData.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-6 text-white/40">
                            No clients found
                          </td>
                        </tr>
                      ) : (
                        clientReportData.map((client) => (
                          <tr key={client._id} className="border-t border-white/5">
                            <td className="px-4 py-3">{client.clientName}</td>
                            <td className="px-4 py-3 text-center">
                              ****{client.phoneLast4}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {client.createdBy?.name}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {new Date(client.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                <div className="flex justify-end items-center gap-3">
                  <button
                    disabled={clientReportPage === 1}
                    onClick={() => setClientReportPage((p) => p - 1)}
                    className="p-2 border border-white/10 rounded-md disabled:opacity-40"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <span className="text-sm">
                    Page {clientReportPage} of {clientReportTotalPages}
                  </span>

                  <button
                    disabled={clientReportPage === clientReportTotalPages}
                    onClick={() => setClientReportPage((p) => p + 1)}
                    className="p-2 border border-white/10 rounded-md disabled:opacity-40"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}




      {/* EDIT MODAL */}
      {editClient && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#111827] rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Edit Client</h2>

            <input
              value={editForm.clientName}
              onChange={(e) =>
                setEditForm({ ...editForm, clientName: e.target.value })
              }
              className="w-full p-2 bg-[#0b1220] border border-white/10 rounded"
              placeholder="Client Name"
            />

            <input
              value={editForm.phoneLast4}
              onChange={(e) =>
                setEditForm({ ...editForm, phoneLast4: e.target.value })
              }
              maxLength={4}
              className="w-full p-2 bg-[#0b1220] border border-white/10 rounded"
              placeholder="Last 4 digits"
            />

            <input
              value={editForm.rmName}
              onChange={(e) =>
                setEditForm({ ...editForm, rmName: e.target.value })
              }
              className="w-full p-2 bg-[#0b1220] border border-white/10 rounded"
              placeholder="Relationship Manager Name"
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setEditClient(null)}>Cancel</button>
              <button
                onClick={saveEdit}
                className="bg-indigo-600 px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteClient && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#111827] rounded-xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">Delete Client</h2>
            <p className="text-white/70">
              Are you sure you want to delete{" "}
              <b>{deleteClient.clientName}</b>?
            </p>

            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteClient(null)}>Cancel</button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}


        {/* Pagination */}
        <div className="flex justify-end items-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="p-2 border border-white/10 rounded-md disabled:opacity-40"
          >
            <ChevronLeft />
          </button>

          <span className="text-sm">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="p-2 border border-white/10 rounded-md disabled:opacity-40"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegisteredClientsTable





