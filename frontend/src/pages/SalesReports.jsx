
import { useEffect, useState } from "react"
import "../App.css"
import { X } from "lucide-react"
import DiwaliDecor from "../components/diwali-decor"
import ImageModal from "../components/ImageModal"


const SalesReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportType, setExportType] = useState("day")
  const [error, setError] = useState(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedUser, setSelectedUser] = useState("all")
  const [currentUser, setCurrentUser] = useState(null)
  const [availableUsers, setAvailableUsers] = useState([])
  const [viewMode, setViewMode] = useState("list")
  const [editingReport, setEditingReport] = useState(null)
  const [editFormData, setEditFormData] = useState({
    date: "",
    meetings: [],
  })
  const[fromDate, setFromDate] = useState("");
  const[toDate, setToDate] = useState("");
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [followUpMeetingId, setFollowUpMeetingId] = useState(null)
  const [followUpSalesReportId, setFollowUpSalesReportId] = useState(null)
  const [followUpDate, setFollowUpDate] = useState("")
  const [followUpRemark, setFollowUpRemark] = useState("")
  
  // New states for follow-ups and notifications
  const [followUps, setFollowUps] = useState({})
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [todaysFollowUps, setTodaysFollowUps] = useState([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [editingFollowUp, setEditingFollowUp] = useState(null)
  const [editFollowUpData, setEditFollowUpData] = useState({
    date: "",
    remark: "",
  })
  const [showAllFollowUpsModal, setShowAllFollowUpsModal] = useState(false)
  const [selectedMeetingFollowUps, setSelectedMeetingFollowUps] = useState([])
  const [selectedMeetingInfo, setSelectedMeetingInfo] = useState(null)
  const [currentMonth,setCurrentMonth] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedManager, setSelectedManager] = useState("all")
  const [availableManagers, setAvailableManagers] = useState([])
  const [todayReports, setTodayReports] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [summaryData, setSummaryData] = useState([])




  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const openFollowUpModal = (salesReportId, meetingId) => {
    console.log("salesReportId",salesReportId);
    console.log("meetingId",meetingId)
    setFollowUpSalesReportId(salesReportId)
    setFollowUpMeetingId(meetingId)
    setShowFollowUpModal(true)
    setFollowUpDate("")
    setFollowUpRemark("")
  }
  const handleDownloadSummary = async () => {
  try {
    const token = localStorage.getItem("token"); // assuming JWT is saved here

    const response = await fetch(`${API_BASE_URL}/api/report/download-summary`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // send token
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    // Convert to blob
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Create temp <a> tag to trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = "report-summary.xlsx"; // filename
    document.body.appendChild(a);
    a.click();

    // Cleanup
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Failed to download summary. Please try again.");
  }
};

  const fetchSummary = async () => {
  const token = localStorage.getItem("token")
  try {
    const res = await fetch(`${API_BASE_URL}/api/report/summary`, {
      headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
    })
    const data = await res.json()
    setSummaryData(data)
    console.log("summary data",data);
  } catch (err) {
    console.error("Error fetching summary:", err)
  }
}





  const fetchReportById = async (reportId) => {
  try {
    const token = localStorage.getItem("token")
    const res = await fetch(`${API_BASE_URL}/api/report/today/${reportId}`, {
      headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
    })
    const data = await res.json()
    if (res.ok) {
      setSelectedReport(data.report)
      setShowReportModal(true)
      console.log("selected report", data.report);
    } else {
      console.error("Failed to fetch report:", data.message)
    }
  } catch (err) {
    console.error("Error fetching report:", err)
  }
}


  // Fetch follow-ups for all meetings
  const fetchFollowUps = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE_URL}/api/report/followups`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok) {
        setFollowUps(data.followUps || {})
      }
    } catch (err) {
      console.error("Failed to fetch follow-ups:", err)
    }
  }
  console.log("selectedMeetingFollowUps",selectedMeetingFollowUps)

  // Fetch today's follow-ups for notifications
  const fetchTodaysFollowUps = async () => {
    try {
      const token = localStorage.getItem("token")
      const today = new Date().toISOString().split("T")[0]
      const res = await fetch(`${API_BASE_URL}/api/report/followups/today`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok) {
        setTodaysFollowUps(data.todaysFollowUps || [])
        setNotificationCount(data.todaysFollowUps?.length || 0)

      }
    } catch (err) {
      console.error("Failed to fetch today's follow-ups:", err)
    }
  }
  console.log("today's follow ups", todaysFollowUps );

  // Mock current user - replace with actual auth logic
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token")

        // Fetch current user
        const userRes = await fetch(`${API_BASE_URL}/api/auth/current-user`, {
          headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        })
        const currentUser = await userRes.json()
        setCurrentUser(currentUser)

        // Fetch available users based on role
        const usersRes = await fetch(`${API_BASE_URL}/api/auth/available-users`, {
          headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        })
        const availableUsers = await usersRes.json()
        setAvailableUsers(availableUsers)

        // Fetch managers if current user is admin
        if (currentUser.role === "admin") {
          const managersRes = await fetch(`${API_BASE_URL}/api/auth/managers`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          })
          const managers = await managersRes.json()
          setAvailableManagers(managers)
        }

      } catch (err) {
        console.error("Failed to fetch user data:", err)
        setError("Failed to load user information")
      }
    }

    fetchUserData()
  }, [])



  const getAddressFromCoords = async (lat, lng) => {
  if (!lat || !lng) return "Location not available";

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
    if (!res.ok) return "Unable to fetch address";

    const data = await res.json();
    return data.display_name || "Address not found";
  } catch (err) {
    console.error("Error fetching address:", err);
    return "Error fetching address";
  }
};


  const fetchReports = async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const query = new URLSearchParams()
      if (startDate) query.append("startDate", startDate)
      if (endDate) query.append("endDate", endDate)
      if (selectedUser !== "all") query.append("userId", selectedUser)
      if (selectedManager !== "all") query.append("managerId", selectedManager)

      query.append("page", page)
      query.append("limit", pagination.limit)

      const queryString = query.toString()
      const url = `${API_BASE_URL}/api/report/get${queryString ? `?${queryString}` : ""}`

      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch reports: ${res.status}`)
      }

      const data = await res.json()

      const reportsWithAddress = await Promise.all(
        data.reports.map(async (report) => {
          if (report.location?.latitude && report.location?.longitude) {
            const roundedLat = parseFloat(report.location.latitude.toFixed(5)); // ~1m–10m accuracy
            const roundedLng = parseFloat(report.location.longitude.toFixed(5));

            const address = await getAddressFromCoords(roundedLat, roundedLng);
            return { ...report, address };
          } else {
            return { ...report, address: "Location not available" };
          }
        })
      );

      setReports(reportsWithAddress || [])
      setCurrentMonth(data.currentMonth);
      setTodayReports(data.today || 0)   

      if (data.pagination) {
        setPagination((prev) => ({
          ...prev,
          page: data.pagination.page,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }))
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch reports")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchReports(1)
      fetchFollowUps()
      fetchTodaysFollowUps()
    }
  }, [currentUser])

  const handleDateFilter = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after end date")
      return
    }
    fetchReports(1) // Reset to page 1 when filters change
  }

  const clearFilters = () => {
    setStartDate("")
    setEndDate("")
    setSelectedUser("all")
    setSelectedManager("all")
    setError(null)
    fetchReports(1)
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "admin":
        return "Administrator"
      case "manager":
        return "Manager"
      case "user":
        return "Sales Representative"
      default:
        return role
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "manager":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "user":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchReports(newPage)
    }
  }

  const totalMeetings = reports.reduce((sum, report) => sum + report.meetings.length, 0)
  const totalReports = reports.length

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const handleEditClick = (report) => {
    setEditingReport(report._id)
    setEditFormData({
      date: report.date,
      meetings: [...report.meetings], // Create a copy of meetings array
    })
  }

  console.log("edit form data" , editFormData)

  const handleEditFormChange = (e, meetingIndex, field) => {
    const updatedMeetings = [...editFormData.meetings]

    if (field === "visitingCard") {
      // Handle file upload separately
      return
    }

    updatedMeetings[meetingIndex][field] = e.target.value
    setEditFormData({
      ...editFormData,
      meetings: updatedMeetings,
    })
  }

  const handleFileChange = (e, meetingIndex) => {
    const file = e.target.files[0]
    if (file) {
      const updatedMeetings = [...editFormData.meetings]
      updatedMeetings[meetingIndex].visitingCardFile = file
      setEditFormData({
        ...editFormData,
        meetings: updatedMeetings,
      })
    }
  }

  const token = localStorage.getItem("token")

  const handleUpdateReport = async () => {
    try {
      const formData = new FormData()

      // Append basic data
      formData.append("date", editFormData.date)
      formData.append("meetings", JSON.stringify(editFormData.meetings))

      // Append files if they exist
      editFormData.meetings.forEach((meeting, index) => {
        if (meeting.visitingCardFile) {
          formData.append("visitingCard", meeting.visitingCardFile)
        }
      })

      const response = await fetch(`${API_BASE_URL}/api/report/${editingReport}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to update report")
      }

      setEditingReport(null)
      fetchReports() // Refresh the reports
    } catch (error) {
      console.error("Error updating report:", error)
      setError(error.message)
    }
  }

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/report/${reportId}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete report")
      }

      // Refresh the reports list
      fetchReports()
    } catch (error) {
      console.error("Error deleting report:", error)
      setError(error.message)
    }
  }

  const submitFollowUp = async () => {
    if (!followUpDate || !followUpRemark) {
      alert("Please fill in both fields")
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/report/${followUpSalesReportId}/follow-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          meetingId: followUpMeetingId,
          date: followUpDate,
          remark: followUpRemark,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to add follow-up")

      alert("Follow-up added!")
      setShowFollowUpModal(false)
      fetchFollowUps() // Refresh follow-ups
      fetchTodaysFollowUps() // Refresh today's follow-ups
    } catch (err) {
      alert("Error: " + err.message)
    }
  }

  // Handle follow-up edit
  const handleEditFollowUp = (followUp) => {
    setEditingFollowUp(followUp._id)
    setEditFollowUpData({
      date: followUp.date.split("T")[0],
      remark: followUp.remark,
    })
  }

  // Update follow-up
  const handleUpdateFollowUp = async (followUpId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/report/follow-up/${followUpId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(editFollowUpData),
      })

      if (!res.ok) throw new Error("Failed to update follow-up")

      setEditingFollowUp(null)
      fetchFollowUps()
      fetchTodaysFollowUps()
    } catch (err) {
      alert("Error: " + err.message)
    }
  }

  // Delete follow-up
  const handleDeleteFollowUp = async (followUpId) => {
    if (!window.confirm("Are you sure you want to delete this follow-up?")) {
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/report/follow-up/${followUpId}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to delete follow-up")

      fetchFollowUps()
      fetchTodaysFollowUps()
    } catch (err) {
      alert("Error: " + err.message)
    }
  }
  console.log("followUps", followUps)

  const openAllFollowUpsModal = (meeting, reportDate) => {
    const meetingFollowUps = followUps
        .filter(item => item.meetingId === meeting._id)
        .map(item => item.followUp);
    const allFollowUps = followUps
        .filter(item => item.meetingId === meeting._id)
        .map(item => ({
            ...item.followUp,          // Spread all follow-up properties
            reportId: item.reportId,   // Include reportId
            user: item.user            // Include user info if needed
        }));

    console.log("Meeting Follow-ups with Report ID:", allFollowUps);
    
    setSelectedMeetingFollowUps(allFollowUps);
    setSelectedMeetingInfo({
      firmName: meeting.firmName,
      ownerName: meeting.ownerName,
      reportDate: reportDate,
      meetingId: meeting._id,
    })
    setShowAllFollowUpsModal(true)
  }

  // Function to categorize follow-ups by date
  const categorizeFollowUps = (followUps) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const past = []
    const todayFollowUps = []
    const future = []

    followUps.forEach((followUp) => {
      const followUpDate = new Date(followUp.date)
      followUpDate.setHours(0, 0, 0, 0)

      if (followUpDate < today) {
        past.push(followUp)
      } else if (followUpDate.getTime() === today.getTime()) {
        todayFollowUps.push(followUp)
      } else {
        future.push(followUp)
      }
    })

    return { past, today: todayFollowUps, future }
  }
  console.log("reports",reports)

//   return (
//     <div className="min-h-screen bg-[#212425]">
//       {/* Header */}
//       <div className="bg-[#212425] ">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 sm:py-5 md:py-0 lg:px-8">
//           <div className="flex flex-col lg:flex-row justify-between gap-10 md:gap-0 items-center py-6">
//             <div>
//               <h1 className="text-3xl font-bold text-white">Sales Reports Dashboard</h1>
//               <div className="flex items-center mt-2 space-x-4">
//                 <span
//                   className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(currentUser.role)}`}
//                 >
//                   {getRoleDisplayName(currentUser.role)}
//                 </span>
//                 <span className="text-white">Welcome, {currentUser.name}</span>
//               </div>
//             </div>

//             <div className="flex items-center space-x-4">
//               {currentUser.role === "admin" && 
//               <button
//                 onClick={() => setShowExportModal(true)}
//                 className="py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
//               >
//                 Export Reports
//               </button>
//               } 
              

//               {/* Notification Bell */}
//               <div className="relative">
//                 <button
//                   onClick={() => setShowNotificationModal(true)}
//                   className="relative py-2 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
//                 >
//                   Today's Follow Up's
//                   {notificationCount > 0 && (
//                     <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
//                       {notificationCount}
//                     </span>
//                   )}
//                 </button>
//               </div>

//               {/* View Toggle */}
//               <div className="flex items-center space-x-2">
//                 <span className="text-sm text-white">View:</span>
//                 <div className="flex rounded-lg border border-indigo-300 overflow-hidden bg-white/10 backdrop-blur-sm">
//                   <button
//                     onClick={() => setViewMode("list")}
//                     className={`px-3 py-1 text-sm font-medium transition-all duration-200 ${
//                       viewMode === "list" ? "bg-white text-indigo-600 shadow-md" : "text-white hover:bg-white/20"
//                     }`}
//                   >
//                     List
//                   </button>
//                   <button
//                     onClick={() => setViewMode("grid")}
//                     className={`px-3 py-1 text-sm font-medium transition-all duration-200 ${
//                       viewMode === "grid" ? "bg-white text-indigo-600 shadow-md" : "text-white hover:bg-white/20"
//                     }`}
//                   >
//                     Grid
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {showExportModal && (
//   <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//     <div className="bg-white rounded-lg shadow-lg p-6 w-96">
//       <h2 className="text-xl font-bold mb-4">Export Sales Reports</h2>
//       <p className="text-gray-600 mb-4">Choose how you want to export reports:</p>

//       {/* Radio Options */}
//       <div className="space-y-2">
//         <label className="flex items-center space-x-2">
//           <input
//             type="radio"
//             value="day"
//             checked={exportType === "day"}
//             onChange={(e) => setExportType(e.target.value)}
//           />
//           <span>Today’s Date</span>
//         </label>
//         <label className="flex items-center space-x-2">
//           <input
//             type="radio"
//             value="week"
//             checked={exportType === "week"}
//             onChange={(e) => setExportType(e.target.value)}
//           />
//           <span>Week Wise</span>
//         </label>
//         <label className="flex items-center space-x-2">
//           <input
//             type="radio"
//             value="month"
//             checked={exportType === "month"}
//             onChange={(e) => setExportType(e.target.value)}
//           />
//           <span>Month Wise</span>
//         </label>
//         <label className="flex items-center space-x-2">
//           <input
//             type="radio"
//             value="custom"
//             checked={exportType === "custom"}
//             onChange={(e) => setExportType(e.target.value)}
//           />
//           <span>Custom Range</span>
//         </label>
//       </div>

//       {/* Custom Date Inputs */}
//       {exportType === "custom" && (
//         <div className="mt-4 space-y-3">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">From Date</label>
//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               className="mt-1 w-full border rounded-lg p-2"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">To Date</label>
//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               className="mt-1 w-full border rounded-lg p-2"
//             />
//           </div>
//         </div>
//       )}

//       {/* Actions */}
//       <div className="flex justify-end space-x-3 mt-6">
//         <button
//           onClick={() => setShowExportModal(false)}
//           className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
//         >
//           Cancel
//         </button>
//         <button
//           onClick={async () => {
//             const today = new Date().toISOString().split("T")[0];
//             const token = localStorage.getItem("token");
//             let url = "";

//             if (exportType === "custom") {
//               if (!fromDate || !toDate) {
//                 alert("Please select both From and To dates");
//                 return;
//               }
//               url = `${API_BASE_URL}/api/report/export?fromDate=${fromDate}&toDate=${toDate}`;
//             } else {
//               url = `${API_BASE_URL}/api/report/export?type=${exportType}&date=${today}`;
//             }

//             const response = await fetch(url, {
//               headers: { Authorization: `Bearer ${token}` },
//             });
//             const blob = await response.blob();
//             const downloadUrl = window.URL.createObjectURL(blob);
//             const a = document.createElement("a");
//             a.href = downloadUrl;
//             a.download =
//               exportType === "custom"
//                 ? `sales_report_${fromDate}_to_${toDate}.xlsx`
//                 : `sales_report_${exportType}_${today}.xlsx`;
//             a.click();
//             a.remove();
//             setShowExportModal(false);
//           }}
//           className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//         >
//           Download
//         </button>
//       </div>
//     </div>
//   </div>
// )}



//       {showNotificationModal && (
//         <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//               <h2 className="text-xl font-semibold text-gray-900">Today's Follow-ups</h2>
//               <button
//                 onClick={() => setShowNotificationModal(false)}
//                 className="text-gray-400 hover:text-gray-600 transition-colors"
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
//               {todaysFollowUps.length === 0 ? (
//                 <div className="text-center py-8">
//                   <svg
//                     className="mx-auto h-12 w-12 text-gray-400"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//                     />
//                   </svg>
//                   <h3 className="mt-2 text-sm font-medium text-gray-900">No follow-ups for today</h3>
//                   <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {todaysFollowUps.map((followUp) => (
//                     <div key={followUp._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                       {editingFollowUp === followUp._id ? (
//                         <div className="space-y-4">
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//                             <input
//                               type="date"
//                               value={editFollowUpData.date}
//                               onChange={(e) => setEditFollowUpData({ ...editFollowUpData, date: e.target.value })}
//                               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
//                             <textarea
//                               value={editFollowUpData.remark}
//                               onChange={(e) => setEditFollowUpData({ ...editFollowUpData, remark: e.target.value })}
//                               rows="3"
//                               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                           </div>
//                           <div className="flex justify-end space-x-2">
//                             {/* <button
//                               onClick={() => setEditingFollowUp(null)}
//                               className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
//                             >
//                               Cancel
//                             </button>
//                             <button
//                               onClick={() => handleUpdateFollowUp(followUp._id)}
//                               className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//                             >
//                               Update
//                             </button> */}
//                           </div>
//                         </div>
//                       ) : (
//                         <div
//                           key={followUp._id}
//                           className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-300"
//                           onClick={() => fetchReportById(followUp.reportId)}
//                         >
//                           <div className="flex justify-between items-start mb-2">
//                             <div>
//                               <h4 className="font-medium text-gray-900">
//                                 <strong>User</strong> : {followUp.user?.name}
//                               </h4>
//                               {followUp.meetingType === "Client" ? (
//                               <>
//                               <h4 className="font-medium text-gray-900">
//                                <strong>Client Name</strong> : {followUp.clientName}
//                               </h4>
//                               </>
//                               ):(
//                                <>
//                                   <h4 className="font-medium text-gray-900">
//                                   <strong>Firm</strong> : {followUp.firmName}
//                                   </h4>
//                                </>
//                               )}
                              
//                             </div>
//                             <div className="flex space-x-2">
//                               {/* <button
//                                 onClick={() => handleEditFollowUp(followUp)}
//                                 className="text-blue-600 hover:text-blue-800 transition-colors"
//                               >
//                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={2}
//                                     d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//                                   />
//                                 </svg>
//                               </button>
//                               <button
//                                 onClick={() => handleDeleteFollowUp(followUp._id)}
//                                 className="text-red-600 hover:text-red-800 transition-colors"
//                               >
//                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={2}
//                                     d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                                   />
//                                 </svg>
//                               </button> */}
//                             </div>
//                           </div>
//                           <div className="bg-white p-3 rounded border">
//                             <p className="text-sm text-gray-800">{followUp.followUp.remark}</p>
//                           </div>
//                           <div className="mt-2 text-xs text-gray-500">
//                             Follow-up Date: {new Date(followUp.followUp.date).toLocaleDateString()}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Report Details Modal */}
//       {showReportModal && selectedReport && (
//         <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center p-4">
//           <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-slate-700">
//             <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex justify-between items-center">
//               <div>
//                 <h2 className="text-2xl font-bold text-white">Sales Report Details</h2>
//                 <p className="text-indigo-100 mt-1">By :{selectedReport?.user.name}</p>
//                 <p className="text-indigo-100 mt-1">
//                   {new Date(selectedReport.date).toLocaleDateString("en-US", {
//                     weekday: "long",
//                     year: "numeric",
//                     month: "long",
//                     day: "numeric",
//                   })}
//                 </p>
//               </div>
//               <button
//                 onClick={() => setShowReportModal(false)}
//                 className="text-white hover:text-indigo-200 transition-colors duration-200 p-2 hover:bg-white/10 rounded-full"
//               >
//                 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
//               <div className="grid gap-6">
//                 {selectedReport.meetings.map((meeting, index) => (
//                   <div
//                     key={meeting._id}
//                     className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
//                   >
//                     {/* Meeting Header */}
//                     <div className="flex items-start justify-between mb-4">
//                       <div className="flex items-center space-x-3">
//                         {meeting?.meetingType === "Client" ? (
//                           <>
//                           <div>
//                           <h3 className="text-xl font-bold text-white">Client Name : {meeting?.clientName}</h3>
//                         </div>
//                           </>
//                         ) : (
//                           <>
//                           <div>
//                           <h3 className="text-xl font-bold text-white">Firm Name : {meeting?.firmName}</h3>
//                         </div>
//                           </>
//                         )}
                        
//                       </div>

//                       {meeting?.meetingType === "Client" ? (
//                        <>
//                        <div
//                         className={`px-3 py-1 rounded-full text-sm font-medium ${
//                           meeting.status === "Hot"
//                             ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
//                             : meeting.status === "Cold"
//                               ? "bg-amber-100 text-amber-800 border border-amber-200"
//                               : meeting.status === "Reception"
//                                 ? "bg-rose-100 text-rose-800 border border-rose-200"
//                                 : "bg-slate-100 text-slate-800 border border-slate-200"
//                         }`}
//                       >
//                         {meeting.clientStatus}
//                       </div>
//                        </>
//                       ) : (
//                        <>
//                        <div
//                         className={`px-3 py-1 rounded-full text-sm font-medium ${
//                           meeting.status === "completed"
//                             ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
//                             : meeting.status === "pending"
//                               ? "bg-amber-100 text-amber-800 border border-amber-200"
//                               : meeting.status === "cancelled"
//                                 ? "bg-rose-100 text-rose-800 border border-rose-200"
//                                 : "bg-slate-100 text-slate-800 border border-slate-200"
//                         }`}
//                       >
//                         {meeting.status}
//                       </div>
//                        </>
//                       )}
//                     </div>

//                     {/* Meeting Details Grid */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                       <div className="space-y-3">
//                         <div className="flex items-center space-x-3">
//                           <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
//                             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                               />
//                             </svg>
//                           </div>
//                           {meeting.meetingType === "Client" ? (
//                            <>
//                            <div>
//                             <p className="text-slate-400 text-sm">Broker</p>
//                             <p className="text-white font-medium">{meeting.brokerName}</p>
//                           </div>
//                            </>
//                           ):(
//                            <>
//                            <div>
//                             <p className="text-slate-400 text-sm">Owner</p>
//                             <p className="text-white font-medium">{meeting.ownerName}</p>
//                           </div>
//                            </> 
//                           )}
                          
//                         </div>

//                         <div className="flex items-center space-x-3">
//                           <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
//                             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
//                               />
//                             </svg>
//                           </div>
//                           {meeting.meetingType === "Client" ? (
//                            <>
//                            <div>
//                             <p className="text-slate-400 text-sm">Last 5 digits</p>
//                             <p className="text-white font-medium">{meeting.phoneLast5}</p>
//                           </div>
//                            </>
//                           ):(
//                            <>
//                            <div>
//                             <p className="text-slate-400 text-sm">Phone</p>
//                             <p className="text-white font-medium">{meeting.phoneNumber}</p>
//                           </div>
//                            </> 
//                           )}
                          
//                         </div>
//                       </div>

//                       <div className="space-y-3">
//                         <div className="flex items-center space-x-3">
//                           <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
//                             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//                               />
//                             </svg>
//                           </div>
//                           {meeting.meetingType === "Client" ? (
//                            <>
//                            <div>
//                             <p className="text-slate-400 text-sm">Broker Type</p>
//                             <p className="text-white font-medium break-all">{meeting.brokerType}</p>
//                           </div>
//                            </>
//                           ):(
//                            <>
//                            <div>
//                             <p className="text-slate-400 text-sm">Email</p>
//                             <p className="text-white font-medium break-all">{meeting.email}</p>
//                           </div>
//                            </> 
//                           )}
                          
//                         </div>
//                       </div>
//                     </div>

//                     {/* Remark Section */}
//                     {meeting.remark && (
//                       <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg p-4 mb-4">
//                         <div className="flex items-start space-x-3">
//                           <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
//                             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
//                               />
//                             </svg>
//                           </div>
//                           <div className="flex-1">
//                             <p className="text-slate-400 text-sm mb-1">Remark</p>
//                             <p className="text-white leading-relaxed">{meeting.remark}</p>
//                           </div>
//                         </div>
//                       </div>
//                     )}
                    
//                     {/* <button className="px-4 py-2 bg-red-600 text-white rounded-md" onClick={() => openFollowUpModal(selectedReport?._id, meeting?._id)}>+ Add Follow Up</button> */}
                    
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}


//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Filters Section */}
//         <div className="bg-gradient-to-r from-coral-50 to-orange-50 rounded-xl shadow-lg border border-coral-200 p-6 mb-8">
//           <div className="flex flex-row justify-between mb-6">
//             <h2 className="text-lg font-semibold text-coral-800 mb-4">Filters & Search</h2>
//             {currentUser.role === "admin" && (
//               <div className="">
//                 <button
//                   onClick={() => {
//                     fetchSummary()
//                     setIsModalOpen(true)
//                   }}
//                   className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-md hover:shadow-xl"
//                 >
//                   View User Summary
//                 </button>
//               </div>
//             )}
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             {/* Date Range */}
//             <div>
//               <label className="block text-sm font-medium text-coral-700 mb-2">Start Date</label>
//               <input
//                 type="date"
//                 className="w-full px-3 py-2 border border-coral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 bg-white"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-coral-700 mb-2">End Date</label>
//               <input
//                 type="date"
//                 className="w-full px-3 py-2 border border-coral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 bg-white"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//               />
//             </div>
//             {/* User Filter - Only show for admin and manager */}
//             {(currentUser.role === "admin" || currentUser.role === "manager") && (
//               <div>
//                 <label className="block text-sm font-medium text-coral-700 mb-2">
//                   {currentUser.role === "admin" ? "All Users" : "Team Members"}
//                 </label>
//                 <select
//                   className="w-full px-3 py-2 border border-coral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 bg-white"
//                   value={selectedUser}
//                   onChange={(e) => setSelectedUser(e.target.value)}
//                 >
//                   <option value="all">All {currentUser.role === "admin" ? "Users" : "Team Members"}</option>
//                   {availableUsers.map((user) => (
//                     <option key={user._id} value={user._id}>
//                       {user.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}
//             {currentUser.role === "admin" && (
//               <div>
//                 <label className="block text-sm font-medium text-coral-700 mb-2">
//                   Filter by Manager
//                 </label>
//                 <select
//                   className="w-full px-3 py-2 border border-coral-300 rounded-lg shadow-sm 
//                             focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 bg-white"
//                   value={selectedManager}
//                   onChange={(e) => setSelectedManager(e.target.value)}
//                 >
//                   <option value="all">All Managers</option>
//                   {availableManagers.map((manager) => (
//                     <option key={manager._id} value={manager._id}>
//                       {manager.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}
            

//             {/* Modal */}
            

//             {/* Action Buttons */}
//             <div className="flex items-end space-x-2">
//               <button
//                 onClick={handleDateFilter}
//                 className="flex-1 bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600 text-black px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
//               >
//                 Apply Filters
//               </button>
//               <button
//                 onClick={clearFilters}
//                 className="px-4 py-2 border border-coral-300 text-coral-700 rounded-lg hover:bg-coral-50 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2 shadow-sm"
//               >
//                 Clear
//               </button>
//             </div>
            
//           </div>
//           {error && (
//             <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg">
//               <p className="text-sm text-rose-600">{error}</p>
//             </div>
//           )}
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-gradient-to-br from-fuchsia-50 to-purple-50 rounded-xl shadow-lg border border-fuchsia-200 p-6 hover:shadow-xl transition-shadow duration-200">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <div className="w-8 h-8 bg-gradient-to-r from-fuchsia-400 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
//                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
//                     />
//                   </svg>
//                 </div>
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-fuchsia-700">Current Month's Reports</p>
//                 <p className="text-2xl font-bold text-fuchsia-900">
//                   {currentMonth}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl shadow-lg border border-sky-200 p-6 hover:shadow-xl transition-shadow duration-200">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <div className="w-8 h-8 bg-gradient-to-r from-sky-400 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
//                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                     />
//                   </svg>
//                 </div>
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-sky-700">Total Reports</p>
//                 <p className="text-2xl font-bold text-sky-900">{totalReports}</p>
//               </div>
//             </div>
//           </div>
//           {/* <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg border border-emerald-200 p-6 hover:shadow-xl transition-shadow duration-200">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-lg flex items-center justify-center shadow-md">
//                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//                     />
//                   </svg>
//                 </div>
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-emerald-700">Total Meetings</p>
//                 <p className="text-2xl font-bold text-emerald-900">{totalMeetings}</p>
//               </div>
//             </div>
//           </div> */}
//           <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl shadow-lg border border-rose-200 p-6 hover:shadow-xl transition-shadow duration-200">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-red-500 rounded-lg flex items-center justify-center shadow-md">
//                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2h6v2m-7-8h8l-1 5H7l1-5z" />
//                   </svg>
//                 </div>
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-rose-700">Today's Reports</p>
//                 <p className="text-2xl font-bold text-rose-900">{todayReports}</p>
//               </div>
//             </div>
//           </div>

          
//         </div>

//         {/* Loading State */}
//         {loading && (
//           <div className="flex justify-center items-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             <span className="ml-3 text-gray-600">Loading reports...</span>
//           </div>
//         )}



//         {isModalOpen && (
//   <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//     <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-6 relative">
//       {/* Close Button */}
//       <button
//         onClick={() => setIsModalOpen(false)}
//         className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
//       >
//         <X size={24} />
//       </button>
//       <div className="flex gap-2">
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">
//           📊 User Report Summary
//         </h2>
//         <div>
//           <button
//             onClick={handleDownloadSummary}
//             className="ml-4 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm"
//           >
//             ⬇️ Download Excel
//           </button>
//         </div>

//       </div> 

//       {/* Scrollable Section */}
//       <div className="max-h-96 overflow-y-auto overflow-x-auto">
//         {summaryData.map((managerGroup) => (
//           <div key={managerGroup.manager.managerId || managerGroup.manager.name} className="mb-6">
//             {/* Manager Header */}
//             <div className="bg-orange-100 px-4 py-2 rounded-t-lg font-semibold text-gray-800">
//               Manager: {managerGroup.manager.name} ({managerGroup.manager.email || "N/A"})
//             </div>

//             <table className="min-w-full border border-gray-200 rounded-b-lg overflow-hidden shadow-sm">
//               <thead className="bg-gradient-to-r from-coral-100 to-orange-100">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                     User
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                     Total Reports
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                     Yesterday
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                     Today
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {managerGroup.users.map((user) => (
//   <tr
//     key={user.userId}
//     className={`transition-colors ${
//       user.isManager ? "bg-yellow-50 font-semibold" : "hover:bg-gray-50"
//     }`}
//   >
//     <td className="px-4 py-3 text-gray-800">
//       {user.isManager ? `⭐ Manager: ${user.name}` : user.name}
//     </td>
//     <td className="px-4 py-3 text-left text-gray-700">{user.totalReports}</td>
//     <td className="px-4 py-3 text-left text-gray-700">{user.yesterdayReports}</td>
//     <td className="px-4 py-3 text-left text-gray-700">{user.todayReports}</td>
//   </tr>
// ))}

//               </tbody>
//             </table>
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// )}



//         {/* Empty State */}
//         {!loading && reports.length === 0 && (
//           <div className="text-center py-12">
//             <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//               />
//             </svg>
//             <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
//             <p className="mt-1 text-sm text-gray-500">
//               {startDate || endDate
//                 ? "Try adjusting your date filters."
//                 : "Get started by creating your first sales report."}
//             </p>
//           </div>
//         )}

//         {/* Improved Follow-Up Modal */}
//         {showFollowUpModal && (
//           <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
//             <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
//               <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//                 <h2 className="text-xl font-semibold text-gray-900">Add Follow-Up</h2>
//                 <button
//                   onClick={() => setShowFollowUpModal(false)}
//                   className="text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>

//               <div className="p-6 space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
//                   <input
//                     type="date"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     value={followUpDate}
//                     onChange={(e) => setFollowUpDate(e.target.value)}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Remark</label>
//                   <textarea
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     rows="4"
//                     placeholder="Enter follow-up details..."
//                     value={followUpRemark}
//                     onChange={(e) => setFollowUpRemark(e.target.value)}
//                   />
//                 </div>
//               </div>

//               <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
//                 <button
//                   onClick={() => setShowFollowUpModal(false)}
//                   className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={submitFollowUp}
//                   className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
//                 >
//                   Add Follow-Up
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Edit Report Modal */}
//         {editingReport && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
//             <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//               <div className="flex flex-row justify-between gap-3">
//                 <h3 className="text-lg font-semibold mb-4">Edit Report & Add Follow-Up</h3>
//                 <button className="px-4 py-0 bg-red-600 text-white rounded-md" onClick={() => openFollowUpModal(editingReport, editFormData.meetings[0]._id)}>+ Add Follow Up</button>
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//                 <input
//                   type="date"
//                   value={editFormData.date.split("T")[0]}
//                   onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
//                   className="w-full px-3 py-2 border rounded-md"
//                 />
//               </div>

//               {editFormData.meetings.map((meeting, meetingIndex) => (
//                 <div key={meetingIndex} className="mb-6 p-4 border rounded-lg">
//                   <h4 className="font-medium mb-3">Meeting {meetingIndex + 1}</h4>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {meeting.meetingType === "Client" ? (

//                     <>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
//                       <input
//                         type="text"
//                         value={meeting.clientName}
//                         onChange={(e) => handleEditFormChange(e, meetingIndex, "clientName")}
//                         className="w-full px-3 py-2 border rounded-md"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Last 5 Digit</label>
//                       <input
//                         type="text"
//                         value={meeting.phoneLast5}
//                         onChange={(e) => handleEditFormChange(e, meetingIndex, "phoneLast5")}
//                         className="w-full px-3 py-2 border rounded-md"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Broker Name</label>
//                       <input
//                         type="text"
//                         value={meeting.brokerName}
//                         onChange={(e) => handleEditFormChange(e, meetingIndex, "brokerName")}
//                         className="w-full px-3 py-2 border rounded-md"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Broker Type</label>
//                       <select
//                         value={meeting.brokerType}
//                         onChange={(e) => handleEditFormChange(e, meetingIndex, "brokerType")}
//                         className="w-full px-3 py-2 border rounded-md"
//                       >
//                         <option value="Direct">Direct</option>
//                         <option value="Site">Site</option>
//                         <option value="Reception">Reception</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Client Status</label>
//                       <select
//                         value={meeting.clientStatus}
//                         onChange={(e) => handleEditFormChange(e, meetingIndex, "clientStatus")}
//                         className="w-full px-3 py-2 border rounded-md"
//                       >
//                         <option value="Hot">Hot</option>
//                         <option value="Cold">Cold</option>
//                         <option value="Dead">Dead</option>
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Visiting Card</label>
//                       {meeting.visitingCard && (
//                         <div className="mb-2">
//                           <img
//                             src={`${API_BASE_URL}/${meeting.visitingCard}`}
//                             alt="Current visiting card"
//                             className="h-20 object-contain"
//                           />
//                         </div>
//                       )}
//                       <input
//                         type="file"
//                         onChange={(e) => handleFileChange(e, meetingIndex)}
//                         className="w-full text-sm"
//                         accept="image/*,.pdf"
//                       />
//                     </div>
                    
//                     </>  
//                     ):( 
//                     <>  
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Firm Name</label>
//                       <input
//                         type="text"
//                         value={meeting.firmName}
//                         onChange={(e) => handleEditFormChange(e, meetingIndex, "firmName")}
//                         className="w-full px-3 py-2 border rounded-md"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//                       <select
//                         value={meeting.status}
//                         onChange={(e) => handleEditFormChange(e, meetingIndex, "status")}
//                         className="w-full px-3 py-2 border rounded-md"
//                       >
//                         <option value="Interested">Interested</option>
//                         <option value="Not Interested">Not Interested</option>
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
//                       <input
//                         type="text"
//                         value={meeting.ownerName}
//                         onChange={(e) => handleEditFormChange(e, meetingIndex, "ownerName")}
//                         className="w-full px-3 py-2 border rounded-md"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Visiting Card</label>
//                       {meeting.visitingCard && (
//                         <div className="mb-2">
//                           <img
//                             src={`${API_BASE_URL}/${meeting.visitingCard}`}
//                             alt="Current visiting card"
//                             className="h-20 object-contain"
//                           />
//                         </div>
//                       )}
//                       <input
//                         type="file"
//                         onChange={(e) => handleFileChange(e, meetingIndex)}
//                         className="w-full text-sm"
//                         accept="image/*,.pdf"
//                       />
//                     </div>
//                     </>
//                     )}
//                   </div>
//                 </div>
//               ))}

//               <div className="flex justify-end space-x-3 mt-4">
//                 <button onClick={() => setEditingReport(null)} className="px-4 py-2 border border-gray-300 rounded-md">
//                   Cancel
//                 </button>
//                 <button onClick={handleUpdateReport} className="px-4 py-2 bg-blue-600 text-white rounded-md">
//                   Update Report
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {showAllFollowUpsModal && (
//           <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
//             <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
//               <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//                 <div>
//                   <h2 className="text-xl font-semibold text-gray-900">All Follow-ups</h2>
//                   {selectedMeetingInfo && (
//                     <p className="text-sm text-gray-600 mt-1">
//                       {selectedMeetingInfo.firmName} - {selectedMeetingInfo.ownerName}
//                     </p>
//                   )}
//                 </div>
//                 <button
//                   onClick={() => setShowAllFollowUpsModal(false)}
//                   className="text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>

//               <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
//                 {selectedMeetingFollowUps.length === 0 ? (
//                   <div className="text-center py-8">
//                     <svg
//                       className="mx-auto h-12 w-12 text-gray-400"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                       />
//                     </svg>
//                     <h3 className="mt-2 text-sm font-medium text-gray-900">No follow-ups found</h3>
//                     <p className="mt-1 text-sm text-gray-500">This meeting doesn't have any follow-ups yet.</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-6">
//                     {(() => {
//                       const { past, today, future } = categorizeFollowUps(selectedMeetingFollowUps)

//                       return (
//                         <>
//                           {/* Future Follow-ups */}
//                           {future.length > 0 && (
//                             <div>
//                               <div className="flex items-center mb-4">
//                                 <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
//                                 <h3 className="text-lg font-semibold text-gray-900">
//                                   Upcoming Follow-ups ({future.length})
//                                 </h3>
//                               </div>
//                               <div className="space-y-3 ml-6">
//                                 {future.map((followUp) => (
//                                   <div key={followUp._id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
//                                     {editingFollowUp === followUp._id ? (
//                                       <div className="space-y-4">
//                                         <div>
//                                           <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//                                           <input
//                                             type="date"
//                                             value={editFollowUpData.date}
//                                             onChange={(e) =>
//                                               setEditFollowUpData({ ...editFollowUpData, date: e.target.value })
//                                             }
//                                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                           />
//                                         </div>
//                                         <div>
//                                           <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
//                                           <textarea
//                                             value={editFollowUpData.remark}
//                                             onChange={(e) =>
//                                               setEditFollowUpData({ ...editFollowUpData, remark: e.target.value })
//                                             }
//                                             rows="3"
//                                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                           />
//                                         </div>
//                                         <div className="flex justify-end space-x-2">
//                                           <button
//                                             onClick={() => setEditingFollowUp(null)}
//                                             className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
//                                           >
//                                             Cancel
//                                           </button>
//                                           <button
//                                             onClick={() => {
//                                               handleUpdateFollowUp(followUp._id)
//                                               // Refresh the modal data
//                                               const updatedFollowUps = selectedMeetingFollowUps.map((f) =>
//                                                 f._id === followUp._id ? { ...f, ...editFollowUpData } : f,
//                                               )
//                                               setSelectedMeetingFollowUps(updatedFollowUps)
//                                             }}
//                                             className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//                                           >
//                                             Update
//                                           </button>
//                                         </div>
//                                       </div>
//                                     ) : (
//                                       <div>
//                                         <div className="flex justify-between items-start mb-2">
//                                           <div className="flex items-center">
//                                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-3">
//                                               {new Date(followUp.date).toLocaleDateString("en-US", {
//                                                 weekday: "short",
//                                                 month: "short",
//                                                 day: "numeric",
//                                                 year: "numeric",
//                                               })}
//                                             </span>
//                                             <span className="text-xs text-gray-500">
//                                               {Math.ceil(
//                                                 (new Date(followUp.date) - new Date()) / (1000 * 60 * 60 * 24),
//                                               )}{" "}
//                                               days from now
//                                             </span>
//                                           </div>
//                                           <div className="flex space-x-2">
//                                             {/* <button
//                                               onClick={() => handleEditFollowUp(followUp)}
//                                               className="text-blue-600 hover:text-blue-800 transition-colors"
//                                             >
//                                               <svg
//                                                 className="w-4 h-4"
//                                                 fill="none"
//                                                 stroke="currentColor"
//                                                 viewBox="0 0 24 24"
//                                               >
//                                                 <path
//                                                   strokeLinecap="round"
//                                                   strokeLinejoin="round"
//                                                   strokeWidth={2}
//                                                   d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//                                                 />
//                                               </svg>
//                                             </button>
//                                             <button
//                                               onClick={() => {
//                                                 handleDeleteFollowUp(followUp._id)
//                                                 setSelectedMeetingFollowUps((prev) =>
//                                                   prev.filter((f) => f._id !== followUp._id),
//                                                 )
//                                               }}
//                                               className="text-red-600 hover:text-red-800 transition-colors"
//                                             >
//                                               <svg
//                                                 className="w-4 h-4"
//                                                 fill="none"
//                                                 stroke="currentColor"
//                                                 viewBox="0 0 24 24"
//                                               >
//                                                 <path
//                                                   strokeLinecap="round"
//                                                   strokeLinejoin="round"
//                                                   strokeWidth={2}
//                                                   d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                                                 />
//                                               </svg>
//                                             </button> */}
//                                           </div>
//                                         </div>
//                                         <div className="bg-white p-3 rounded border border-blue-100">
//                                           <p className="text-sm text-gray-800">{followUp.remark}</p>
//                                         </div>
//                                       </div>
//                                     )}
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           )}

//                           {/* Today's Follow-ups */}
//                           {today.length > 0 && (
//                             <div>
//                               <div className="flex items-center mb-4">
//                                 <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
//                                 <h3 className="text-lg font-semibold text-gray-900">
//                                   Today's Follow-ups ({today.length})
//                                 </h3>
//                               </div>
//                               <div className="space-y-3 ml-6">
//                                 {today.map((followUp) => (
//                                   <div
//                                     key={followUp._id}
//                                     className="bg-orange-50 rounded-lg p-4 border border-orange-200"
//                                   >
//                                     {editingFollowUp === followUp._id ? (
//                                       <div className="space-y-4">
//                                         <div>
//                                           <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//                                           <input
//                                             type="date"
//                                             value={editFollowUpData.date}
//                                             onChange={(e) =>
//                                               setEditFollowUpData({ ...editFollowUpData, date: e.target.value })
//                                             }
//                                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//                                           />
//                                         </div>
//                                         <div>
//                                           <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
//                                           <textarea
//                                             value={editFollowUpData.remark}
//                                             onChange={(e) =>
//                                               setEditFollowUpData({ ...editFollowUpData, remark: e.target.value })
//                                             }
//                                             rows="3"
//                                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//                                           />
//                                         </div>
//                                         <div className="flex justify-end space-x-2">
//                                           <button
//                                             onClick={() => setEditingFollowUp(null)}
//                                             className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
//                                           >
//                                             Cancel
//                                           </button>
//                                           <button
//                                             onClick={() => {
//                                               handleUpdateFollowUp(followUp._id)
//                                               const updatedFollowUps = selectedMeetingFollowUps.map((f) =>
//                                                 f._id === followUp._id ? { ...f, ...editFollowUpData } : f,
//                                               )
//                                               setSelectedMeetingFollowUps(updatedFollowUps)
//                                             }}
//                                             className="px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
//                                           >
//                                             Update
//                                           </button>
//                                         </div>
//                                       </div>
//                                     ) : (
//                                       <div>
//                                         <div className="flex justify-between items-start mb-2">
//                                           <div className="flex items-center">
//                                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mr-3">
//                                               Today
//                                             </span>
//                                             <span className="text-xs text-orange-600 font-medium">Due Now</span>
//                                           </div>
//                                           <div className="flex space-x-2">
//                                             {/* <button
//                                               onClick={() => handleEditFollowUp(followUp)}
//                                               className="text-orange-600 hover:text-orange-800 transition-colors"
//                                             >
//                                               <svg
//                                                 className="w-4 h-4"
//                                                 fill="none"
//                                                 stroke="currentColor"
//                                                 viewBox="0 0 24 24"
//                                               >
//                                                 <path
//                                                   strokeLinecap="round"
//                                                   strokeLinejoin="round"
//                                                   strokeWidth={2}
//                                                   d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//                                                 />
//                                               </svg>
//                                             </button>
//                                             <button
//                                               onClick={() => {
//                                                 handleDeleteFollowUp(followUp._id)
//                                                 setSelectedMeetingFollowUps((prev) =>
//                                                   prev.filter((f) => f._id !== followUp._id),
//                                                 )
//                                               }}
//                                               className="text-red-600 hover:text-red-800 transition-colors"
//                                             >
//                                               <svg
//                                                 className="w-4 h-4"
//                                                 fill="none"
//                                                 stroke="currentColor"
//                                                 viewBox="0 0 24 24"
//                                               >
//                                                 <path
//                                                   strokeLinecap="round"
//                                                   strokeLinejoin="round"
//                                                   strokeWidth={2}
//                                                   d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                                                 />
//                                               </svg>
//                                             </button> */}
//                                           </div>
//                                         </div>
//                                         <div className="bg-white p-3 rounded border border-orange-100">
//                                           <p className="text-sm text-gray-800">{followUp.remark}</p>
//                                         </div>
//                                       </div>
//                                     )}
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           )}

//                           {/* Past Follow-ups */}
//                           {past.length > 0 && (
//                             <div>
//                               <div className="flex items-center mb-4">
//                                 <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
//                                 <h3 className="text-lg font-semibold text-gray-900">Past Follow-ups ({past.length})</h3>
//                               </div>
//                               <div className="space-y-3 ml-6">
//                                 {past.map((followUp) => (
//                                   <div key={followUp._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                                     {editingFollowUp === followUp._id ? (
//                                       <div className="space-y-4">
//                                         <div>
//                                           <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//                                           <input
//                                             type="date"
//                                             value={editFollowUpData.date}
//                                             onChange={(e) =>
//                                               setEditFollowUpData({ ...editFollowUpData, date: e.target.value })
//                                             }
//                                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
//                                           />
//                                         </div>
//                                         <div>
//                                           <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
//                                           <textarea
//                                             value={editFollowUpData.remark}
//                                             onChange={(e) =>
//                                               setEditFollowUpData({ ...editFollowUpData, remark: e.target.value })
//                                             }
//                                             rows="3"
//                                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
//                                           />
//                                         </div>
//                                         <div className="flex justify-end space-x-2">
//                                           <button
//                                             onClick={() => setEditingFollowUp(null)}
//                                             className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
//                                           >
//                                             Cancel
//                                           </button>
//                                           <button
//                                             onClick={() => {
//                                               handleUpdateFollowUp(followUp._id)
//                                               const updatedFollowUps = selectedMeetingFollowUps.map((f) =>
//                                                 f._id === followUp._id ? { ...f, ...editFollowUpData } : f,
//                                               )
//                                               setSelectedMeetingFollowUps(updatedFollowUps)
//                                             }}
//                                             className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
//                                           >
//                                             Update
//                                           </button>
//                                         </div>
//                                       </div>
//                                     ) : (
//                                       <div>
//                                         <div className="flex justify-between items-start mb-2">
//                                           <div className="flex items-center">
//                                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-3">
//                                               {new Date(followUp.date).toLocaleDateString("en-US", {
//                                                 weekday: "short",
//                                                 month: "short",
//                                                 day: "numeric",
//                                                 year: "numeric",
//                                               })}
//                                             </span>
//                                             <span className="text-xs text-gray-500">
//                                               {Math.abs(
//                                                 Math.ceil(
//                                                   (new Date(followUp.date) - new Date()) / (1000 * 60 * 60 * 24),
//                                                 ),
//                                               )}{" "}
//                                               days ago
//                                             </span>
//                                           </div>
//                                           <div className="flex space-x-2">
//                                             {/* <button
//                                               onClick={() => handleEditFollowUp(followUp)}
//                                               className="text-gray-600 hover:text-gray-800 transition-colors"
//                                             >
//                                               <svg
//                                                 className="w-4 h-4"
//                                                 fill="none"
//                                                 stroke="currentColor"
//                                                 viewBox="0 0 24 24"
//                                               >
//                                                 <path
//                                                   strokeLinecap="round"
//                                                   strokeLinejoin="round"
//                                                   strokeWidth={2}
//                                                   d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//                                                 />
//                                               </svg>
//                                             </button>
//                                             <button
//                                               onClick={() => {
//                                                 handleDeleteFollowUp(followUp._id)
//                                                 setSelectedMeetingFollowUps((prev) =>
//                                                   prev.filter((f) => f._id !== followUp._id),
//                                                 )
//                                               }}
//                                               className="text-red-600 hover:text-red-800 transition-colors"
//                                             >
//                                               <svg
//                                                 className="w-4 h-4"
//                                                 fill="none"
//                                                 stroke="currentColor"
//                                                 viewBox="0 0 24 24"
//                                               >
//                                                 <path
//                                                   strokeLinecap="round"
//                                                   strokeLinejoin="round"
//                                                   strokeWidth={2}
//                                                   d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                                                 />
//                                               </svg>
//                                             </button> */}
//                                           </div>
//                                         </div>
//                                         <div className="bg-white p-3 rounded border border-gray-100">
//                                           <p className="text-sm text-gray-800">{followUp.remark}</p>
//                                         </div>
//                                       </div>
//                                     )}
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           )}
//                         </>
//                       )
//                     })()}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Reports Display */}
//         {!loading && reports.length > 0 && (
//           <>
//             <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "space-y-6"}>
//               {reports?.map((report) => (
//                 <div key={report._id} className="bg-white rounded-lg shadow-sm border border-coral-300 overflow-hidden relative">
//                   {/* Report Header */}
//                   <div className="px-6 py-4 bg-gradient-to-r from-coral-50 to-orange-50 border-b border-b-white">
//                     <div className="flex justify-between items-center">
//                       <div>
//                           {currentUser.role === "admin" && report.user.managerId?.name && (
//                             <h3 className="text-lg font-semibold text-gray-900">
//                               Manager - {report.user.managerId.name}
//                              </h3>  
                            
//                           )}
                          
                       
//                         {report?.user?.name && (
//                         <p className="text-sm text-black font-bold mt-1">
//                           By: {report.user.name}
//                           {report.user.role && (
//                             <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(report.user.role)}`}>
//                               {getRoleDisplayName(report.user.role)}
//                             </span>
//                           )}
//                           <span className="ml-3 text-xs text-gray-500">
//                           {new Date(report.date).toLocaleDateString("en-US", {
//                             weekday: "long",
//                             year: "numeric",
//                             month: "long",
//                             day: "numeric",
//                           })}
//                           </span>
                          
//                         </p>
//                       )}
//                       </div>
//                       <div className="flex flex-row">
//                       {(currentUser.role === "user" || currentUser.role === "manager") && (
//                         <div className="flex flex-row gap-2">
//                           <button
//                             onClick={() => handleDeleteReport(report._id)}
//                             className="p-2 text-gray-500 hover:text-red-600 transition-colors"
//                             title="Delete report"
//                           >
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-5 w-5"
//                               viewBox="0 0 20 20"
//                               fill="currentColor"
//                             >
//                               <path
//                                 fillRule="evenodd"
//                                 d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
//                                 clipRule="evenodd"
//                               />
//                             </svg>
//                           </button>

//                           <button
//                             onClick={() => handleEditClick(report)}
//                             className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
//                           >
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-5 w-5"
//                               viewBox="0 0 20 20"
//                               fill="currentColor"
//                             >
//                               <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//                             </svg>
//                           </button>
//                           {/* <button
//                             onClick={() => openFollowUpModal(report._id, report.meetings[0]._id)}
//                             className="p-2 text-gray-500 hover:text-green-600 transition-colors"
//                             title="Add Follow-Up"
//                           >
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-5 w-5"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                             >
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                             </svg>
//                           </button> */}
//                         </div>
//                       )}
//                       <button
//                             onClick={() => openAllFollowUpsModal(report.meetings[0], report.date)}
//                             className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
//                             title="View All Follow-ups"
//                           >
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-5 w-5"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
//                               />
//                             </svg>
//                       </button>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Meetings */}
//                   <div className="p-6 bg-gradient-to-r from-coral-50 to-orange-50  shadow-lg border border-coral-200">
//                     <div className="space-y-6 bg-gray-50">
//                       {report.meetings.map((meeting, idx) => (
//                         <div key={idx} className="space-y-4 ">
//                           <div className="border border-gray-200 bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
//                             <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
//                               {/* Meeting Details */}

//                               {meeting.meetingType === "Client" ? (
//                               <>
//                                 <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
//                                 <div>
//                                   <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                                     Client Name
//                                   </label>
//                                   <p className="text-sm text-gray-900 mt-1">{meeting.clientName}</p>
//                                 </div>
//                                 <div>
//                                   <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                                     Last 5 Digits
//                                   </label>
                                
//                                     {meeting.phoneLast5 ? (
//                                       <p  className="hover:text-blue-600 transition-colors">
//                                         {meeting.phoneLast5}
//                                       </p>
//                                     ) : (
//                                       <span className="text-gray-400">Not provided</span>
//                                     )}
                                  
//                                 </div>
//                                 <div>
//                                   <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                                     Broker Name
//                                   </label>
//                                   <p className="text-sm text-gray-900 mt-1">
                               
//                                       {meeting.brokerName}
                                    
//                                   </p>
//                                 </div>
//                                 <div>
//                                   <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                                     Broker Type 
//                                   </label>
//                                   <p className="text-sm text-gray-900 mt-1">
//                                       {meeting.brokerType}
                                   
//                                   </p>
//                                 </div>
//                                 <div>
//                                   <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                                     Location
//                                   </label>
                                  
//                                     {report.address && (
//                                     <p className="hover:text-blue-600 transition-colors">
//                                       📍 {report.address}
//                                     </p>
//                                     )}
                                 
//                                 </div>
//                                 <div>
//                                   <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                                     Client Status 
//                                   </label>
//                                   <p className="text-sm text-gray-900 mt-1">
                                    
//                                       {meeting.clientStatus}
                                   
//                                   </p>
//                                 </div>
//                                 </div>
//                               </>
//                             ) : (
//                               <>
//                                 <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
//                                   <div>
//                                     <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                                       Firm Name
//                                     </label>
//                                     <p className="text-sm font-medium text-gray-900 mt-1">{meeting.firmName}</p>
//                                   </div>
//                                   <div>
//                                     <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                                       Owner
//                                     </label>
//                                     <p className="text-sm font-medium text-gray-900 mt-1">{meeting.ownerName}</p>
//                                   </div>
//                                   <div>
//                                     <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                                       Phone
//                                     </label>
//                                     <p className="text-sm text-gray-900 mt-1">
//                                       <a
//                                         href={`tel:${meeting.phoneNumber}`}
//                                         className="hover:text-blue-600 transition-colors"
//                                       >
//                                         {meeting.phoneNumber}
//                                       </a>
//                                     </p>
//                                   </div>
//                                   <div>
//                                     <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                                       Email
//                                     </label>
//                                     <p className="text-sm text-gray-900 mt-1">
//                                       {meeting.email ? (
//                                         <a
//                                           href={`mailto:${meeting.email}`}
//                                           className="hover:text-blue-600 transition-colors"
//                                         >
//                                           {meeting.email}
//                                         </a>
//                                       ) : (
//                                         <span className="text-gray-400">Not provided</span>
//                                       )}
//                                     </p>
//                                   </div>
//                                   <div>
//                                     <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                                       Team Size
//                                     </label>
//                                     <p className="text-sm text-gray-900 mt-1">
//                                       {meeting.teamSize || <span className="text-gray-400">Not specified</span>}
//                                     </p>
//                                   </div>
//                                   <div>
//                                     <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                                       RERA Status
//                                     </label>
//                                     <p className="text-sm mt-1">
//                                       <span
//                                         className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                                           meeting.rera ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
//                                         }`}
//                                       >
//                                         {meeting.rera ? "Registered" : "Not Registered"}
//                                       </span>
//                                     </p>
//                                   </div>
//                                   <div>
//                                   <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                                     Location
//                                   </label>
                                  
//                                     {report.address && (
//                                     <p className="hover:text-blue-600 transition-colors">
//                                       📍 {report.address}
//                                     </p>
//                                     )}
                                 
//                                 </div>
//                                   <div>
//                                     <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                                       Status
//                                     </label>
//                                     <p className="text-sm mt-1">
//                                       <span
//                                         className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                                           meeting.status === "Interested" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
//                                         }`}
//                                       >
//                                         {meeting.status}
//                                       </span>
//                                     </p>
//                                   </div>
//                                   {/* {meeting.remark && (
//                                     <div className="md:col-span-2">
//                                       <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                                         Remarks
//                                       </label>
//                                       <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-2 rounded border">
//                                         {meeting.remark}
//                                       </p>
//                                     </div>
//                                   )} */}
//                                 </div>
//                               </>

//                               )}
//                               {/* Visiting Card */}
//                               {meeting.visitingCard && (
//                                 <div className="lg:ml-6 flex-shrink-0">
//                                   <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
//                                   {meeting.meetingType === "Client" ? "Client Picture" :  "Visiting Card"}
//                                   </label>
//                                   <div className="relative group">
//                                     <img
//                                       src={`${API_BASE_URL}/${meeting.visitingCard}`}
//                                       alt="Visiting Card"
//                                       className="w-48 h-auto rounded-lg shadow-md border border-gray-200 group-hover:shadow-lg transition-shadow duration-200"
//                                       onError={(e) => {
//                                         const target = e.target
//                                         target.src = "/placeholder.svg?height=120&width=200&text=Image+Not+Found"
//                                       }}
//                                     />
                                    
//                                     <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200"></div>
//                                   </div>
//                                   <a
//                                     target="_blank"
//                                     className="text-blue-500 hover:text-blue-800"
//                                     href={`${API_BASE_URL}/${meeting.visitingCard}`}
//                                     download
//                                   >
//                                     Download
//                                   </a>

//                                 </div>
//                               )}
//                             </div>
//                           </div>

//                           {/* Follow-ups Section */}
//                           {followUps[meeting._id] && followUps[meeting._id].length > 0 && (
//                             <div className="ml-4 border-l-2 border-blue-200 pl-4">
//                               <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
//                                 <svg
//                                   className="w-4 h-4 mr-2 text-blue-600"
//                                   fill="none"
//                                   stroke="currentColor"
//                                   viewBox="0 0 24 24"
//                                 >
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                                 </svg>
//                                 Follow-ups ({followUps[meeting._id].length})
//                               </h4>
//                               <div className="space-y-3">
//                                 {followUps[meeting._id].map((followUp) => (
//                                   <div key={followUp._id} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
//                                     {editingFollowUp === followUp._id ? (
//                                       <div className="space-y-3">
//                                         <div>
//                                           <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
//                                           <input
//                                             type="date"
//                                             value={editFollowUpData.date}
//                                             onChange={(e) =>
//                                               setEditFollowUpData({ ...editFollowUpData, date: e.target.value })
//                                             }
//                                             className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                                           />
//                                         </div>
//                                         <div>
//                                           <label className="block text-xs font-medium text-gray-700 mb-1">Remark</label>
//                                           <textarea
//                                             value={editFollowUpData.remark}
//                                             onChange={(e) =>
//                                               setEditFollowUpData({ ...editFollowUpData, remark: e.target.value })
//                                             }
//                                             rows="2"
//                                             className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                                           />
//                                         </div>
//                                         <div className="flex justify-end space-x-2">
//                                           <button
//                                             onClick={() => setEditingFollowUp(null)}
//                                             className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
//                                           >
//                                             Cancel
//                                           </button>
//                                           <button
//                                             onClick={() => handleUpdateFollowUp(followUp._id)}
//                                             className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//                                           >
//                                             Update
//                                           </button>
//                                         </div>
//                                       </div>
//                                     ) : (
//                                       <div>
//                                         <div className="flex justify-between items-start mb-2">
//                                           <div className="text-xs text-blue-700 font-medium">
//                                             {new Date(followUp.date).toLocaleDateString("en-US", {
//                                               weekday: "short",
//                                               year: "numeric",
//                                               month: "short",
//                                               day: "numeric",
//                                             })}
//                                           </div>
//                                           <div className="flex space-x-1">
//                                             <button
//                                               onClick={() => handleEditFollowUp(followUp)}
//                                               className="text-blue-600 hover:text-blue-800 transition-colors"
//                                             >
//                                               <svg
//                                                 className="w-3 h-3"
//                                                 fill="none"
//                                                 stroke="currentColor"
//                                                 viewBox="0 0 24 24"
//                                               >
//                                                 <path
//                                                   strokeLinecap="round"
//                                                   strokeLinejoin="round"
//                                                   strokeWidth={2}
//                                                   d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//                                                 />
//                                               </svg>
//                                             </button>
//                                             <button
//                                               onClick={() => handleDeleteFollowUp(followUp._id)}
//                                               className="text-red-600 hover:text-red-800 transition-colors"
//                                             >
//                                               <svg
//                                                 className="w-3 h-3"
//                                                 fill="none"
//                                                 stroke="currentColor"
//                                                 viewBox="0 0 24 24"
//                                               >
//                                                 <path
//                                                   strokeLinecap="round"
//                                                   strokeLinejoin="round"
//                                                   strokeWidth={2}
//                                                   d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                                                 />
//                                               </svg>
//                                             </button>
//                                           </div>
//                                         </div>
//                                         <p className="text-sm text-gray-800 bg-white p-2 rounded border border-blue-100">
//                                           {followUp.remark}
//                                         </p>
//                                       </div>
//                                     )}
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="mt-8 flex items-center justify-between">
//               <div className="text-sm text-white">
//                 Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
//                 <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{" "}
//                 <span className="font-medium">{pagination.total}</span> results
//               </div>

//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => handlePageChange(pagination.page - 1)}
//                   disabled={pagination.page === 1}
//                   className={`px-4 py-2 border rounded-md ${pagination.page === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50"}`}
//                 >
//                   Previous
//                 </button>

//                 {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
//                   let pageNum
//                   if (pagination.totalPages <= 5) {
//                     pageNum = i + 1
//                   } else if (pagination.page <= 3) {
//                     pageNum = i + 1
//                   } else if (pagination.page >= pagination.totalPages - 2) {
//                     pageNum = pagination.totalPages - 4 + i
//                   } else {
//                     pageNum = pagination.page - 2 + i
//                   }

//                   return (
//                     <button
//                       key={pageNum}
//                       onClick={() => handlePageChange(pageNum)}
//                       className={`px-4 py-2 border rounded-md ${pagination.page === pageNum ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
//                     >
//                       {pageNum}
//                     </button>
//                   )
//                 })}

//                 <button
//                   onClick={() => handlePageChange(pagination.page + 1)}
//                   disabled={pagination.page === pagination.totalPages}
//                   className={`px-4 py-2 border rounded-md ${pagination.page === pagination.totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50"}`}
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   )



return (
    <div className="min-h-screen bg-[#212425] diwali-theme">
      <div className="diwali-bg" aria-hidden="true"></div>

      <div className="diwali-banner" role="status">
        <span className="sr-only">Seasonal greeting</span>
        <p>
          <span className="spark" aria-hidden="true"></span>
          As Diwali approaches, may your days be filled with light, joy, and prosperity!
          <span className="spark" aria-hidden="true"></span>
        </p>
      </div>

      <div className="diwali-fireworks" aria-hidden="true">
        <div className="firework f1"></div>
        <div className="firework f2"></div>
        <div className="firework f3"></div>
        <div className="firework f4"></div>
        <div className="firework f5"></div>
        <div className="firework f6"></div>
      </div>


      <DiwaliDecor/>
      <ImageModal/>

      
      
      {/* Header */}
      <div className="bg-[#212425] ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 sm:py-5 md:py-0 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between gap-10 md:gap-0 items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Sales Reports Dashboard</h1>
              <div className="flex items-center mt-2 space-x-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(currentUser.role)}`}
                >
                  {getRoleDisplayName(currentUser.role)}
                </span>
                <span className="text-white">Welcome, {currentUser.name}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {currentUser.role === "admin" && (
                <button
                  onClick={() => setShowExportModal(true)}
                  className="py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Export Reports
                </button>
              )}

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotificationModal(true)}
                  className="relative py-2 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Today's Follow Up's
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                      {notificationCount}
                    </span>
                  )}
                </button>
              </div>

              {/* View Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white">View:</span>
                <div className="flex rounded-lg border border-indigo-300 overflow-hidden bg-white/10 backdrop-blur-sm">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1 text-sm font-medium transition-all duration-200 ${
                      viewMode === "list" ? "bg-white text-indigo-600 shadow-md" : "text-white hover:bg-white/20"
                    }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1 text-sm font-medium transition-all duration-200 ${
                      viewMode === "grid" ? "bg-white text-indigo-600 shadow-md" : "text-white hover:bg-white/20"
                    }`}
                  >
                    Grid
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showExportModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Export Sales Reports</h2>
            <p className="text-gray-600 mb-4">Choose how you want to export reports:</p>

            {/* Radio Options */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="day"
                  checked={exportType === "day"}
                  onChange={(e) => setExportType(e.target.value)}
                />
                <span>Today’s Date</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="week"
                  checked={exportType === "week"}
                  onChange={(e) => setExportType(e.target.value)}
                />
                <span>Week Wise</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="month"
                  checked={exportType === "month"}
                  onChange={(e) => setExportType(e.target.value)}
                />
                <span>Month Wise</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="custom"
                  checked={exportType === "custom"}
                  onChange={(e) => setExportType(e.target.value)}
                />
                <span>Custom Range</span>
              </label>
            </div>

            {/* Custom Date Inputs */}
            {exportType === "custom" && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="mt-1 w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="mt-1 w-full border rounded-lg p-2"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const today = new Date().toISOString().split("T")[0]
                  const token = localStorage.getItem("token")
                  let url = ""

                  if (exportType === "custom") {
                    if (!fromDate || !toDate) {
                      alert("Please select both From and To dates")
                      return
                    }
                    url = `${API_BASE_URL}/api/report/export?fromDate=${fromDate}&toDate=${toDate}`
                  } else {
                    url = `${API_BASE_URL}/api/report/export?type=${exportType}&date=${today}`
                  }

                  const response = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                  })
                  const blob = await response.blob()
                  const downloadUrl = window.URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = downloadUrl
                  a.download =
                    exportType === "custom"
                      ? `sales_report_${fromDate}_to_${toDate}.xlsx`
                      : `sales_report_${exportType}_${today}.xlsx`
                  a.click()
                  a.remove()
                  setShowExportModal(false)
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {showNotificationModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Today's Follow-ups</h2>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {todaysFollowUps.length === 0 ? (
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No follow-ups for today</h3>
                  <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaysFollowUps.map((followUp) => (
                    <div key={followUp._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      {editingFollowUp === followUp._id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                              type="date"
                              value={editFollowUpData.date}
                              onChange={(e) => setEditFollowUpData({ ...editFollowUpData, date: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                            <textarea
                              value={editFollowUpData.remark}
                              onChange={(e) => setEditFollowUpData({ ...editFollowUpData, remark: e.target.value })}
                              rows="3"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            {/* <button
                              onClick={() => setEditingFollowUp(null)}
                              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateFollowUp(followUp._id)}
                              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Update
                            </button> */}
                          </div>
                        </div>
                      ) : (
                        <div
                          key={followUp._id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-300"
                          onClick={() => fetchReportById(followUp.reportId)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                <strong>User</strong> : {followUp.user?.name}
                              </h4>
                              {followUp.meetingType === "Client" ? (
                                <>
                                  <h4 className="font-medium text-gray-900">
                                    <strong>Client Name</strong> : {followUp.clientName}
                                  </h4>
                                </>
                              ) : (
                                <>
                                  <h4 className="font-medium text-gray-900">
                                    <strong>Firm</strong> : {followUp.firmName}
                                  </h4>
                                </>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              {/* <button
                                onClick={() => handleEditFollowUp(followUp)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteFollowUp(followUp._id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button> */}
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <p className="text-sm text-gray-800">{followUp.followUp.remark}</p>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Follow-up Date: {new Date(followUp.followUp.date).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-slate-700">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Sales Report Details</h2>
                <p className="text-indigo-100 mt-1">By :{selectedReport?.user.name}</p>
                <p className="text-indigo-100 mt-1">
                  {new Date(selectedReport.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-white hover:text-indigo-200 transition-colors duration-200 p-2 hover:bg-white/10 rounded-full"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid gap-6">
                {selectedReport.meetings.map((meeting, index) => (
                  <div
                    key={meeting._id}
                    className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    {/* Meeting Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {meeting?.meetingType === "Client" ? (
                          <>
                            <div>
                              <h3 className="text-xl font-bold text-white">Client Name : {meeting?.clientName}</h3>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <h3 className="text-xl font-bold text-white">Firm Name : {meeting?.firmName}</h3>
                            </div>
                          </>
                        )}
                      </div>

                      {meeting?.meetingType === "Client" ? (
                        <>
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              meeting.status === "Hot"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : meeting.status === "Cold"
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : meeting.status === "Reception"
                                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                                    : "bg-slate-100 text-slate-800 border border-slate-200"
                            }`}
                          >
                            {meeting.clientStatus}
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              meeting.status === "completed"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : meeting.status === "pending"
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : meeting.status === "cancelled"
                                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                                    : "bg-slate-100 text-slate-800 border border-slate-200"
                            }`}
                          >
                            {meeting.status}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Meeting Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          {meeting.meetingType === "Client" ? (
                            <>
                              <div>
                                <p className="text-slate-400 text-sm">Broker</p>
                                <p className="text-white font-medium">{meeting.brokerName}</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <p className="text-slate-400 text-sm">Owner</p>
                                <p className="text-white font-medium">{meeting.ownerName}</p>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                          </div>
                          {meeting.meetingType === "Client" ? (
                            <>
                              <div>
                                <p className="text-slate-400 text-sm">Last 5 digits</p>
                                <p className="text-white font-medium">{meeting.phoneLast5}</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <p className="text-slate-400 text-sm">Phone</p>
                                <p className="text-white font-medium">{meeting.phoneNumber}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          {meeting.meetingType === "Client" ? (
                            <>
                              <div>
                                <p className="text-slate-400 text-sm">Broker Type</p>
                                <p className="text-white font-medium break-all">{meeting.brokerType}</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <p className="text-slate-400 text-sm">Email</p>
                                <p className="text-white font-medium break-all">{meeting.email}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remark Section */}
                    {meeting.remark && (
                      <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-400 text-sm mb-1">Remark</p>
                            <p className="text-white leading-relaxed">{meeting.remark}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* <button className="px-4 py-2 bg-red-600 text-white rounded-md" onClick={() => openFollowUpModal(selectedReport?._id, meeting?._id)}>+ Add Follow Up</button> */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <div className="bg-gradient-to-r from-coral-50 to-orange-50 rounded-xl shadow-lg border border-coral-200 p-6 mb-8">
          <div className="flex flex-row justify-between mb-6">
            <h2 className="text-lg font-semibold text-coral-800 mb-4">Filters & Search</h2>
            {currentUser.role === "admin" && (
              <div className="">
                <button
                  onClick={() => {
                    fetchSummary()
                    setIsModalOpen(true)
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-md hover:shadow-xl"
                >
                  View User Summary
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-coral-700 mb-2">Start Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-coral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 bg-white"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-coral-700 mb-2">End Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-coral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 bg-white"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            {/* User Filter - Only show for admin and manager */}
            {(currentUser.role === "admin" || currentUser.role === "manager") && (
              <div>
                <label className="block text-sm font-medium text-coral-700 mb-2">
                  {currentUser.role === "admin" ? "All Users" : "Team Members"}
                </label>
                <select
                  className="w-full px-3 py-2 border border-coral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 bg-white"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="all">All {currentUser.role === "admin" ? "Users" : "Team Members"}</option>
                  {availableUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {currentUser.role === "admin" && (
              <div>
                <label className="block text-sm font-medium text-coral-700 mb-2">Filter by Manager</label>
                <select
                  className="w-full px-3 py-2 border border-coral-300 rounded-lg shadow-sm 
                            focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 bg-white"
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                >
                  <option value="all">All Managers</option>
                  {availableManagers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Modal */}

            {/* Action Buttons */}
            <div className="flex items-end space-x-2">
              <button
                onClick={handleDateFilter}
                className="flex-1 bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600 text-black px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-coral-300 text-coral-700 rounded-lg hover:bg-coral-50 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2 shadow-sm"
              >
                Clear
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <p className="text-sm text-rose-600">{error}</p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-fuchsia-50 to-purple-50 rounded-xl shadow-lg border border-fuchsia-200 p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-fuchsia-400 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-fuchsia-700">Current Month's Reports</p>
                <p className="text-2xl font-bold text-fuchsia-900">{currentMonth}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl shadow-lg border border-sky-200 p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-sky-400 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-sky-700">Total Reports</p>
                <p className="text-2xl font-bold text-sky-900">{totalReports}</p>
              </div>
            </div>
          </div>
          {/* <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg border border-emerald-200 p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-emerald-700">Total Meetings</p>
                <p className="text-2xl font-bold text-emerald-900">{totalMeetings}</p>
              </div>
            </div>
          </div> */}
          <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl shadow-lg border border-rose-200 p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2h6v2m-7-8h8l-1 5H7l1-5z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-rose-700">Today's Reports</p>
                <p className="text-2xl font-bold text-rose-900">{todayReports}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading reports...</span>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-6 relative">
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
              <div className="flex gap-2">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 User Report Summary</h2>
                <div>
                  <button
                    onClick={handleDownloadSummary}
                    className="ml-4 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    ⬇️ Download Excel
                  </button>
                </div>
              </div>

              {/* Scrollable Section */}
              <div className="max-h-96 overflow-y-auto overflow-x-auto">
                {summaryData.map((managerGroup) => (
                  <div key={managerGroup.manager.managerId || managerGroup.manager.name} className="mb-6">
                    {/* Manager Header */}
                    <div className="bg-orange-100 px-4 py-2 rounded-t-lg font-semibold text-gray-800">
                      Manager: {managerGroup.manager.name} ({managerGroup.manager.email || "N/A"})
                    </div>

                    <table className="min-w-full border border-gray-200 rounded-b-lg overflow-hidden shadow-sm">
                      <thead className="bg-gradient-to-r from-coral-100 to-orange-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Reports</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Yesterday</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Today</th>
                        </tr>
                      </thead>
                      <tbody>
                        {managerGroup.users.map((user) => (
                          <tr
                            key={user.userId}
                            className={`transition-colors ${
                              user.isManager ? "bg-yellow-50 font-semibold" : "hover:bg-gray-50"
                            }`}
                          >
                            <td className="px-4 py-3 text-gray-800">
                              {user.isManager ? `⭐ Manager: ${user.name}` : user.name}
                            </td>
                            <td className="px-4 py-3 text-left text-gray-700">{user.totalReports}</td>
                            <td className="px-4 py-3 text-left text-gray-700">{user.yesterdayReports}</td>
                            <td className="px-4 py-3 text-left text-gray-700">{user.todayReports}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && reports.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {startDate || endDate
                ? "Try adjusting your date filters."
                : "Get started by creating your first sales report."}
            </p>
          </div>
        )}

        {/* Improved Follow-Up Modal */}
        {showFollowUpModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Add Follow-Up</h2>
                <button
                  onClick={() => setShowFollowUpModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Remark</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    placeholder="Enter follow-up details..."
                    value={followUpRemark}
                    onChange={(e) => setFollowUpRemark(e.target.value)}
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowFollowUpModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitFollowUp}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Add Follow-Up
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Report Modal */}
        {editingReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex flex-row justify-between gap-3">
                <h3 className="text-lg font-semibold mb-4">Edit Report & Add Follow-Up</h3>
                <button
                  className="px-4 py-0 bg-red-600 text-white rounded-md"
                  onClick={() => openFollowUpModal(editingReport, editFormData.meetings[0]._id)}
                >
                  + Add Follow Up
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={editFormData.date.split("T")[0]}
                  onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              {editFormData.meetings.map((meeting, meetingIndex) => (
                <div key={meetingIndex} className="mb-6 p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Meeting {meetingIndex + 1}</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {meeting.meetingType === "Client" ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                          <input
                            type="text"
                            value={meeting.clientName}
                            onChange={(e) => handleEditFormChange(e, meetingIndex, "clientName")}
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last 5 Digit</label>
                          <input
                            type="text"
                            value={meeting.phoneLast5}
                            onChange={(e) => handleEditFormChange(e, meetingIndex, "phoneLast5")}
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Broker Name</label>
                          <input
                            type="text"
                            value={meeting.brokerName}
                            onChange={(e) => handleEditFormChange(e, meetingIndex, "brokerName")}
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Broker Type</label>
                          <select
                            value={meeting.brokerType}
                            onChange={(e) => handleEditFormChange(e, meetingIndex, "brokerType")}
                            className="w-full px-3 py-2 border rounded-md"
                          >
                            <option value="Direct">Direct</option>
                            <option value="Site">Site</option>
                            <option value="Reception">Reception</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Client Status</label>
                          <select
                            value={meeting.clientStatus}
                            onChange={(e) => handleEditFormChange(e, meetingIndex, "clientStatus")}
                            className="w-full px-3 py-2 border rounded-md"
                          >
                            <option value="Hot">Hot</option>
                            <option value="Cold">Cold</option>
                            <option value="Dead">Dead</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Visiting Card</label>
                          {meeting.visitingCard && (
                            <div className="mb-2">
                              <img
                                src={`${API_BASE_URL}/${meeting.visitingCard}`}
                                alt="Current visiting card"
                                className="h-20 object-contain"
                              />
                            </div>
                          )}
                          <input
                            type="file"
                            onChange={(e) => handleFileChange(e, meetingIndex)}
                            className="w-full text-sm"
                            accept="image/*,.pdf"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Firm Name</label>
                          <input
                            type="text"
                            value={meeting.firmName}
                            onChange={(e) => handleEditFormChange(e, meetingIndex, "firmName")}
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            value={meeting.status}
                            onChange={(e) => handleEditFormChange(e, meetingIndex, "status")}
                            className="w-full px-3 py-2 border rounded-md"
                          >
                            <option value="Interested">Interested</option>
                            <option value="Not Interested">Not Interested</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                          <input
                            type="text"
                            value={meeting.ownerName}
                            onChange={(e) => handleEditFormChange(e, meetingIndex, "ownerName")}
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Visiting Card</label>
                          {meeting.visitingCard && (
                            <div className="mb-2">
                              <img
                                src={`${API_BASE_URL}/${meeting.visitingCard}`}
                                alt="Current visiting card"
                                className="h-20 object-contain"
                              />
                            </div>
                          )}
                          <input
                            type="file"
                            onChange={(e) => handleFileChange(e, meetingIndex)}
                            className="w-full text-sm"
                            accept="image/*,.pdf"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-end space-x-3 mt-4">
                <button onClick={() => setEditingReport(null)} className="px-4 py-2 border border-gray-300 rounded-md">
                  Cancel
                </button>
                <button onClick={handleUpdateReport} className="px-4 py-2 bg-blue-600 text-white rounded-md">
                  Update Report
                </button>
              </div>
            </div>
          </div>
        )}

        {showAllFollowUpsModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">All Follow-ups</h2>
                  {selectedMeetingInfo && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedMeetingInfo.firmName} - {selectedMeetingInfo.ownerName}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowAllFollowUpsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {selectedMeetingFollowUps.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No follow-ups found</h3>
                    <p className="mt-1 text-sm text-gray-500">This meeting doesn't have any follow-ups yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(() => {
                      const { past, today, future } = categorizeFollowUps(selectedMeetingFollowUps)

                      return (
                        <>
                          {/* Future Follow-ups */}
                          {future.length > 0 && (
                            <div>
                              <div className="flex items-center mb-4">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Upcoming Follow-ups ({future.length})
                                </h3>
                              </div>
                              <div className="space-y-3 ml-6">
                                {future.map((followUp) => (
                                  <div key={followUp._id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    {editingFollowUp === followUp._id ? (
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                          <input
                                            type="date"
                                            value={editFollowUpData.date}
                                            onChange={(e) =>
                                              setEditFollowUpData({ ...editFollowUpData, date: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                                          <textarea
                                            value={editFollowUpData.remark}
                                            onChange={(e) =>
                                              setEditFollowUpData({ ...editFollowUpData, remark: e.target.value })
                                            }
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                          <button
                                            onClick={() => setEditingFollowUp(null)}
                                            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => {
                                              handleUpdateFollowUp(followUp._id)
                                              // Refresh the modal data
                                              const updatedFollowUps = selectedMeetingFollowUps.map((f) =>
                                                f._id === followUp._id ? { ...f, ...editFollowUpData } : f,
                                              )
                                              setSelectedMeetingFollowUps(updatedFollowUps)
                                            }}
                                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                          >
                                            Update
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <div className="flex justify-between items-start mb-2">
                                          <div className="flex items-center">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-3">
                                              {new Date(followUp.date).toLocaleDateString("en-US", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                              })}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {Math.ceil(
                                                (new Date(followUp.date) - new Date()) / (1000 * 60 * 60 * 24),
                                              )}{" "}
                                              days from now
                                            </span>
                                          </div>
                                          <div className="flex space-x-2">
                                            {/* <button
                                              onClick={() => handleEditFollowUp(followUp)}
                                              className="text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                              <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                              </svg>
                                            </button>
                                            <button
                                              onClick={() => {
                                                handleDeleteFollowUp(followUp._id)
                                                setSelectedMeetingFollowUps((prev) =>
                                                  prev.filter((f) => f._id !== followUp._id),
                                                )
                                              }}
                                              className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                              <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                              </svg>
                                            </button> */}
                                          </div>
                                        </div>
                                        <div className="bg-white p-3 rounded border border-blue-100">
                                          <p className="text-sm text-gray-800">{followUp.remark}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Today's Follow-ups */}
                          {today.length > 0 && (
                            <div>
                              <div className="flex items-center mb-4">
                                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Today's Follow-ups ({today.length})
                                </h3>
                              </div>
                              <div className="space-y-3 ml-6">
                                {today.map((followUp) => (
                                  <div
                                    key={followUp._id}
                                    className="bg-orange-50 rounded-lg p-4 border border-orange-200"
                                  >
                                    {editingFollowUp === followUp._id ? (
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                          <input
                                            type="date"
                                            value={editFollowUpData.date}
                                            onChange={(e) =>
                                              setEditFollowUpData({ ...editFollowUpData, date: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                                          <textarea
                                            value={editFollowUpData.remark}
                                            onChange={(e) =>
                                              setEditFollowUpData({ ...editFollowUpData, remark: e.target.value })
                                            }
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                          />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                          <button
                                            onClick={() => setEditingFollowUp(null)}
                                            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => {
                                              handleUpdateFollowUp(followUp._id)
                                              const updatedFollowUps = selectedMeetingFollowUps.map((f) =>
                                                f._id === followUp._id ? { ...f, ...editFollowUpData } : f,
                                              )
                                              setSelectedMeetingFollowUps(updatedFollowUps)
                                            }}
                                            className="px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                                          >
                                            Update
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <div className="flex justify-between items-start mb-2">
                                          <div className="flex items-center">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mr-3">
                                              Today
                                            </span>
                                            <span className="text-xs text-orange-600 font-medium">Due Now</span>
                                          </div>
                                          <div className="flex space-x-2">
                                            {/* <button
                                              onClick={() => handleEditFollowUp(followUp)}
                                              className="text-orange-600 hover:text-orange-800 transition-colors"
                                            >
                                              <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                              </svg>
                                            </button>
                                            <button
                                              onClick={() => {
                                                handleDeleteFollowUp(followUp._id)
                                                setSelectedMeetingFollowUps((prev) =>
                                                  prev.filter((f) => f._id !== followUp._id),
                                                )
                                              }}
                                              className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                              <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                              </svg>
                                            </button> */}
                                          </div>
                                        </div>
                                        <div className="bg-white p-3 rounded border border-orange-100">
                                          <p className="text-sm text-gray-800">{followUp.remark}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Past Follow-ups */}
                          {past.length > 0 && (
                            <div>
                              <div className="flex items-center mb-4">
                                <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                                <h3 className="text-lg font-semibold text-gray-900">Past Follow-ups ({past.length})</h3>
                              </div>
                              <div className="space-y-3 ml-6">
                                {past.map((followUp) => (
                                  <div key={followUp._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    {editingFollowUp === followUp._id ? (
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                          <input
                                            type="date"
                                            value={editFollowUpData.date}
                                            onChange={(e) =>
                                              setEditFollowUpData({ ...editFollowUpData, date: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                                          <textarea
                                            value={editFollowUpData.remark}
                                            onChange={(e) =>
                                              setEditFollowUpData({ ...editFollowUpData, remark: e.target.value })
                                            }
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                                          />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                          <button
                                            onClick={() => setEditingFollowUp(null)}
                                            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => {
                                              handleUpdateFollowUp(followUp._id)
                                              const updatedFollowUps = selectedMeetingFollowUps.map((f) =>
                                                f._id === followUp._id ? { ...f, ...editFollowUpData } : f,
                                              )
                                              setSelectedMeetingFollowUps(updatedFollowUps)
                                            }}
                                            className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                          >
                                            Update
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <div className="flex justify-between items-start mb-2">
                                          <div className="flex items-center">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-3">
                                              {new Date(followUp.date).toLocaleDateString("en-US", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                              })}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {Math.abs(
                                                Math.ceil(
                                                  (new Date(followUp.date) - new Date()) / (1000 * 60 * 60 * 24),
                                                ),
                                              )}{" "}
                                              days ago
                                            </span>
                                          </div>
                                          <div className="flex space-x-2">
                                            {/* <button
                                              onClick={() => handleEditFollowUp(followUp)}
                                              className="text-gray-600 hover:text-gray-800 transition-colors"
                                            >
                                              <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                              </svg>
                                            </button>
                                            <button
                                              onClick={() => {
                                                handleDeleteFollowUp(followUp._id)
                                                setSelectedMeetingFollowUps((prev) =>
                                                  prev.filter((f) => f._id !== followUp._id),
                                                )
                                              }}
                                              className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                              <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                              </svg>
                                            </button> */}
                                          </div>
                                        </div>
                                        <div className="bg-white p-3 rounded border border-gray-100">
                                          <p className="text-sm text-gray-800">{followUp.remark}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reports Display */}
        {!loading && reports.length > 0 && (
          <>
            <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "space-y-6"}>
              {reports?.map((report) => (
                <div
                  key={report._id}
                  className="bg-white rounded-lg shadow-sm border border-coral-300 overflow-hidden relative"
                >
                  {/* Report Header */}
                  <div className="px-6 py-4 bg-gradient-to-r from-coral-50 to-orange-50 border-b border-b-white">
                    <div className="flex justify-between items-center">
                      <div>
                        {currentUser.role === "admin" && report.user.managerId?.name && (
                          <h3 className="text-lg font-semibold text-gray-900">
                            Manager - {report.user.managerId.name}
                          </h3>
                        )}

                        {report?.user?.name && (
                          <p className="text-sm text-black font-bold mt-1">
                            By: {report.user.name}
                            {report.user.role && (
                              <span
                                className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(report.user.role)}`}
                              >
                                {getRoleDisplayName(report.user.role)}
                              </span>
                            )}
                            <span className="ml-3 text-xs text-gray-500">
                              {new Date(report.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="flex flex-row">
                        {(currentUser.role === "user" || currentUser.role === "manager") && (
                          <div className="flex flex-row gap-2">
                            <button
                              onClick={() => handleDeleteReport(report._id)}
                              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                              title="Delete report"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>

                            <button
                              onClick={() => handleEditClick(report)}
                              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            {/* <button
                            onClick={() => openFollowUpModal(report._id, report.meetings[0]._id)}
                            className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                            title="Add Follow-Up"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button> */}
                          </div>
                        )}
                        <button
                          onClick={() => openAllFollowUpsModal(report.meetings[0], report.date)}
                          className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                          title="View All Follow-ups"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Meetings */}
                  <div className="p-6 bg-gradient-to-r from-coral-50 to-orange-50  shadow-lg border border-coral-200">
                    <div className="space-y-6 bg-gray-50">
                      {report.meetings.map((meeting, idx) => (
                        <div key={idx} className="space-y-4 ">
                          <div className="border border-gray-200 bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
                              {/* Meeting Details */}

                              {meeting.meetingType === "Client" ? (
                                <>
                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Client Name
                                      </label>
                                      <p className="text-sm text-gray-900 mt-1">{meeting.clientName}</p>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Last 5 Digits
                                      </label>

                                      {meeting.phoneLast5 ? (
                                        <p className="hover:text-blue-600 transition-colors">{meeting.phoneLast5}</p>
                                      ) : (
                                        <span className="text-gray-400">Not provided</span>
                                      )}
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Broker Name
                                      </label>
                                      <p className="text-sm text-gray-900 mt-1">{meeting.brokerName}</p>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Broker Type
                                      </label>
                                      <p className="text-sm text-gray-900 mt-1">{meeting.brokerType}</p>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Location
                                      </label>

                                      {report.address && (
                                        <p className="hover:text-blue-600 transition-colors">📍 {report.address}</p>
                                      )}
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Client Status
                                      </label>
                                      <p className="text-sm text-gray-900 mt-1">{meeting.clientStatus}</p>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Firm Name
                                      </label>
                                      <p className="text-sm font-medium text-gray-900 mt-1">{meeting.firmName}</p>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Owner
                                      </label>
                                      <p className="text-sm font-medium text-gray-900 mt-1">{meeting.ownerName}</p>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Phone
                                      </label>
                                      <p className="text-sm text-gray-900 mt-1">
                                        <a
                                          href={`tel:${meeting.phoneNumber}`}
                                          className="hover:text-blue-600 transition-colors"
                                        >
                                          {meeting.phoneNumber}
                                        </a>
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Email
                                      </label>
                                      <p className="text-sm text-gray-900 mt-1">
                                        {meeting.email ? (
                                          <a
                                            href={`mailto:${meeting.email}`}
                                            className="hover:text-blue-600 transition-colors"
                                          >
                                            {meeting.email}
                                          </a>
                                        ) : (
                                          <span className="text-gray-400">Not provided</span>
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Team Size
                                      </label>
                                      <p className="text-sm text-gray-900 mt-1">
                                        {meeting.teamSize || <span className="text-gray-400">Not specified</span>}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        RERA Status
                                      </label>
                                      <p className="text-sm mt-1">
                                        <span
                                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            meeting.rera ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                          }`}
                                        >
                                          {meeting.rera ? "Registered" : "Not Registered"}
                                        </span>
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Location
                                      </label>

                                      {report.address && (
                                        <p className="hover:text-blue-600 transition-colors">📍 {report.address}</p>
                                      )}
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Status
                                      </label>
                                      <p className="text-sm mt-1">
                                        <span
                                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            meeting.status === "Interested"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-red-100 text-red-800"
                                          }`}
                                        >
                                          {meeting.status}
                                        </span>
                                      </p>
                                    </div>
                                    {/* {meeting.remark && (
                                    <div className="md:col-span-2">
                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Remarks
                                      </label>
                                      <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-2 rounded border">
                                        {meeting.remark}
                                      </p>
                                    </div>
                                  )} */}
                                  </div>
                                </>
                              )}
                              {/* Visiting Card */}
                              {meeting.visitingCard && (
                                <div className="lg:ml-6 flex-shrink-0">
                                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
                                    {meeting.meetingType === "Client" ? "Client Picture" : "Visiting Card"}
                                  </label>
                                  <div className="relative group">
                                    <img
                                      src={`${API_BASE_URL}/${meeting.visitingCard}`}
                                      alt="Visiting Card"
                                      className="w-48 h-auto rounded-lg shadow-md border border-gray-200 group-hover:shadow-lg transition-shadow duration-200"
                                      onError={(e) => {
                                        const target = e.target
                                        target.src = "/placeholder.svg?height=120&width=200&text=Image+Not+Found"
                                      }}
                                    />

                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200"></div>
                                  </div>
                                  <a
                                    target="_blank"
                                    className="text-blue-500 hover:text-blue-800"
                                    href={`${API_BASE_URL}/${meeting.visitingCard}`}
                                    download
                                    rel="noreferrer"
                                  >
                                    Download
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Follow-ups Section */}
                          {followUps[meeting._id] && followUps[meeting._id].length > 0 && (
                            <div className="ml-4 border-l-2 border-blue-200 pl-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                <svg
                                  className="w-4 h-4 mr-2 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Follow-ups ({followUps[meeting._id].length})
                              </h4>
                              <div className="space-y-3">
                                {followUps[meeting._id].map((followUp) => (
                                  <div key={followUp._id} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                    {editingFollowUp === followUp._id ? (
                                      <div className="space-y-3">
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                                          <input
                                            type="date"
                                            value={editFollowUpData.date}
                                            onChange={(e) =>
                                              setEditFollowUpData({ ...editFollowUpData, date: e.target.value })
                                            }
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">Remark</label>
                                          <textarea
                                            value={editFollowUpData.remark}
                                            onChange={(e) =>
                                              setEditFollowUpData({ ...editFollowUpData, remark: e.target.value })
                                            }
                                            rows="2"
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                          <button
                                            onClick={() => setEditingFollowUp(null)}
                                            className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => handleUpdateFollowUp(followUp._id)}
                                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                          >
                                            Update
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <div className="flex justify-between items-start mb-2">
                                          <div className="text-xs text-blue-700 font-medium">
                                            {new Date(followUp.date).toLocaleDateString("en-US", {
                                              weekday: "short",
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                            })}
                                          </div>
                                          <div className="flex space-x-1">
                                            <button
                                              onClick={() => handleEditFollowUp(followUp)}
                                              className="text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                              <svg
                                                className="w-3 h-3"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                              </svg>
                                            </button>
                                            <button
                                              onClick={() => handleDeleteFollowUp(followUp._id)}
                                              className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                              <svg
                                                className="w-3 h-3"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                              </svg>
                                            </button>
                                          </div>
                                        </div>
                                        <p className="text-sm text-gray-800 bg-white p-2 rounded border border-blue-100">
                                          {followUp.remark}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-white">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{" "}
                <span className="font-medium">{pagination.total}</span> results
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-4 py-2 border rounded-md ${pagination.page === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i
                  } else {
                    pageNum = pagination.page - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 border rounded-md ${pagination.page === pageNum ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`px-4 py-2 border rounded-md ${pagination.page === pagination.totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )

  
}

export default SalesReports

