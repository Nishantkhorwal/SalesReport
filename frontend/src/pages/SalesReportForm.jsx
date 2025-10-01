import { useState, useEffect } from "react"
import { Calendar, Upload, Camera, Building2, User, CheckCircle2, FileText, Plus } from "lucide-react"

const SalesReportForm = () => {
  const [visitingCard, setVisitingCard] = useState(null)
  const today = new Date().toISOString().split("T")[0]
  const [date, setDate] = useState(today)
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [meeting, setMeeting] = useState({
    meetingType: "Broker", // Default to Broker
    // Broker fields
    firmName: "",
    ownerName: "",
    phoneNumber: "",
    email: "",
    teamSize: "",
    rera: false,
    status: "Interested",
    // Client fields
    clientName: "",
    brokerName: "",
    brokerType: "Direct",
    phoneLast5: "",
    clientStatus: "Hot",
    // Common fields
    remark: "",
    followUps: [{ date: "", remark: "" }],
  })

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const updateFollowUp = (index, field, value) => {
    const updatedFollowUps = [...meeting.followUps]
    updatedFollowUps[index][field] = value
    setMeeting((prev) => ({ ...prev, followUps: updatedFollowUps }))
  }

  const addFollowUp = () => {
    setMeeting((prev) => ({
      ...prev,
      followUps: [...prev.followUps, { date: "", remark: "" }],
    }))
  }
  useEffect(() => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Please allow location to create a report");
      }
    );
  }, []);

  const handleMeetingChange = (field, value) => {
    setMeeting((prev) => ({
      ...prev,
      [field]: field === "rera" ? value === "true" : value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setVisitingCard(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!visitingCard) {
      alert("Please upload a visiting card image before submitting.")
      return
    }
    if (!location.latitude || !location.longitude) {
    alert("Location not captured. Please allow location access.");
    return;
  }
    setIsSubmitting(true)
    const token = localStorage.getItem("token")
    if (!token) {
      alert("Unauthorized")
      setIsSubmitting(false)
      return
    }

    const formData = new FormData()
    formData.append("meetings", JSON.stringify([meeting]))
    formData.append("latitude", location.latitude);
    formData.append("longitude", location.longitude);
    if (visitingCard) formData.append("visitingCard", visitingCard)

    try {
      const res = await fetch(`${API_BASE_URL}/api/report/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      alert("Sales report created successfully")
      // Reset form
      setMeeting({
        meetingType: "Broker",
        firmName: "",
        ownerName: "",
        phoneNumber: "",
        email: "",
        teamSize: "",
        rera: false,
        status: "Interested",
        clientName: "",
        brokerName: "",
        brokerType: "Direct",
        phoneLast5: "",
        clientStatus: "Hot",
        remark: "",
        followUps: [{ date: "", remark: "" }],
      })
      setVisitingCard(null)
      setDate(today)
    } catch (err) {
      alert(`Error: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    // <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
    //   <div className="max-w-4xl mx-auto">
    //     <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
    //       {/* Form Header */}
    //       <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
    //         <h2 className="text-2xl font-semibold text-white flex items-center">
    //           <span className="mr-3">📊</span>
    //           Report Details
    //         </h2>
    //       </div>

    //       <div className="p-8 space-y-8">
    //         {/* Report Info */}
    //         <div className="bg-gray-50 rounded-xl p-6">
    //           <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
    //             <span className="mr-2">📅</span>
    //             Report Information
    //           </h3>
    //           <div className="grid md:grid-cols-2 gap-6">
    //             <div>
    //               <label className="block text-sm font-medium text-gray-700 mb-2">Report Date *</label>
    //               <input
    //                 type="date"
    //                 value={date}
    //                 readOnly
    //                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
    //               />
    //             </div>
    //             <div>
    //               <label className="block text-sm font-medium text-gray-700 mb-2">Visiting Card/ Client Picture</label>
    //               <div className="flex flex-col gap-3">
    //                 <div className="relative flex-1">
    //                   <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" id="visitingCard"/>
    //                   <label htmlFor="visitingCard" className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 flex items-center justify-center text-gray-600 hover:text-blue-600">
    //                     <span className="mr-2">📎</span>{visitingCard ? visitingCard.name : "Choose file or drag here"}
    //                   </label>
    //                 </div>
    //                 <div className="relative flex-1">
    //                   <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" id="cameraCapture"/>
    //                   <label htmlFor="cameraCapture" className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 flex items-center justify-center text-gray-600 hover:text-green-600">
    //                     📷 Take Photo
    //                   </label>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </div>

    //         {/* Meeting Type Selector */}
    //         <div className="bg-green-50 rounded-xl p-6 border border-green-100">
    //           <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Type *</label>
    //           <select
    //             value={meeting.meetingType}
    //             onChange={(e) => handleMeetingChange("meetingType", e.target.value)}
    //             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
    //           >
    //             <option value="Broker">Broker</option>
    //             <option value="Client">Client</option>
    //           </select>
    //         </div>

    //         {/* Meeting Details Section */}
    //         <div className="bg-green-50 rounded-xl p-6 border border-green-100">
    //           <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
    //             <span className="mr-2">🤝</span>
    //             Meeting Details
    //           </h3>

    //           <div className="grid md:grid-cols-2 gap-6">
    //             {meeting.meetingType === "Broker" ? (
    //               <>
    //                 {/* Broker Fields */}
    //                 <div>
    //                   <label className="block text-sm font-medium text-gray-700 mb-2">Firm Name *</label>
    //                   <input type="text" value={meeting.firmName} onChange={(e) => handleMeetingChange("firmName", e.target.value)} required placeholder="Enter firm name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"/>
    //                 </div>
    //                 <div>
    //                   <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name *</label>
    //                   <input type="text" value={meeting.ownerName} onChange={(e) => handleMeetingChange("ownerName", e.target.value)} required placeholder="Enter owner name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"/>
    //                 </div>
    //                 <div>
    //                   <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
    //                   <input type="tel" value={meeting.phoneNumber} onChange={(e) => handleMeetingChange("phoneNumber", e.target.value)} required placeholder="Enter phone number" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"/>
    //                 </div>
    //                 <div>
    //                   <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
    //                   <input type="email" value={meeting.email} onChange={(e) => handleMeetingChange("email", e.target.value)} placeholder="Enter email address" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"/>
    //                 </div>
    //                 <div>
    //                   <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
    //                   <select value={meeting.status} onChange={(e) => handleMeetingChange("status", e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white">
    //                     <option value="Interested">Interested</option>
    //                     <option value="Not Interested">Not Interested</option>
    //                   </select>
    //                 </div>
    //                 <div>
    //                   <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
    //                   <input type="number" value={meeting.teamSize} onChange={(e) => handleMeetingChange("teamSize", e.target.value)} placeholder="Enter team size" min="1" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"/>
    //                 </div>
    //                 <div>
    //                   <label className="block text-sm font-medium text-gray-700 mb-2">RERA Registered</label>
    //                   <select value={meeting.rera} onChange={(e) => handleMeetingChange("rera", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white">
    //                     <option value="false">No</option>
    //                     <option value="true">Yes</option>
    //                   </select>
    //                 </div>
    //               </>
    //             ) : (
    //               <>
    //                 {/* Client Fields */}
    //                 <div>
    //                   <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
    //                   <input type="text" value={meeting.clientName} onChange={(e) => handleMeetingChange("clientName", e.target.value)} required placeholder="Enter client name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"/>
    //                 </div>
    //                 <div>
    //                   <label className="block text-sm font-medium text-gray-700 mb-2">Broker Name *</label>
    //                   <input type="text" value={meeting.brokerName} onChange={(e) => handleMeetingChange("brokerName", e.target.value)} required placeholder="Enter broker name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"/>
    //                 </div>
    //                 <div>
    //                   <label className="block text-sm font-medium text-gray-700 mb-2">Broker Type *</label>
    //                   <select value={meeting.brokerType} onChange={(e) => handleMeetingChange("brokerType", e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white">
    //                     <option value="Direct">Direct</option>
    //                     <option value="Site">Site</option>
    //                     <option value="Reception">Reception</option>
    //                   </select>
    //                 </div>
    //                 <div>
    //                   <label className="block text-sm font-medium text-gray-700 mb-2">Last 5 digits of Phone *</label>
    //                   <input type="text" value={meeting.phoneLast5} onChange={(e) => handleMeetingChange("phoneLast5", e.target.value)} required placeholder="Enter last 5 digits" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"/>
    //                 </div>
    //                 <div>
    //                   <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
    //                   <select value={meeting.clientStatus} onChange={(e) => handleMeetingChange("clientStatus", e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white">
    //                     <option value="Hot">Hot</option>
    //                     <option value="Cold">Cold</option>
    //                     <option value="Dead">Dead</option>
    //                   </select>
    //                 </div>
    //               </>
    //             )}
    //           </div>

    //           {/* Remarks */}
    //           <div className="mt-6">
    //             <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
    //             <textarea value={meeting.remark} onChange={(e) => handleMeetingChange("remark", e.target.value)} placeholder="Enter any additional remarks..." rows="4" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white"/>
    //           </div>
    //         </div>

    //         {/* Follow-Ups */}
    //         <div className="mt-6">
    //           <label className="block text-sm font-medium text-gray-700 mb-4">Follow Ups</label>
    //           {meeting.followUps.map((fup, idx) => (
    //             <div key={idx} className="grid md:grid-cols-2 gap-4 mb-4">
    //               <input type="date" value={fup.date} onChange={(e) => updateFollowUp(idx, "date", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
    //               <input type="text" value={fup.remark} onChange={(e) => updateFollowUp(idx, "remark", e.target.value)} placeholder="Remark" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
    //             </div>
    //           ))}
    //           <button type="button" onClick={addFollowUp} className="mt-2 text-sm text-blue-600 hover:underline">➕ Add another follow-up</button>
    //         </div>

    //         {/* Submit */}
    //         <div className="flex justify-center pt-6">
    //           <button type="submit" disabled={isSubmitting} className={`px-8 py-4 rounded-xl font-semibold text-white text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl"}`}>
    //             {isSubmitting ? "Submitting..." : "📤 Submit Report"}
    //           </button>
    //         </div>
    //       </div>
    //     </form>
    //   </div>
    // </div>

    <div className="min-h-screen bg-[#212425] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-gray-100 rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 bg-gray-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Sales Report</h2>
                <p className="text-sm text-slate-500">Complete the form to submit your report</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                <Calendar className="h-4 w-4 text-slate-500" />
                Report Information
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Report Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50 text-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Visiting Card / Client Picture</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="visitingCard"
                      />
                      <label
                        htmlFor="visitingCard"
                        className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-300 rounded-md cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors"
                      >
                        <Upload className="h-5 w-5 text-slate-400 mb-1" />
                        <span className="text-xs text-slate-600">{visitingCard ? "File selected" : "Upload"}</span>
                      </label>
                    </div>

                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                        id="cameraCapture"
                      />
                      <label
                        htmlFor="cameraCapture"
                        className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-300 rounded-md cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors"
                      >
                        <Camera className="h-5 w-5 text-slate-400 mb-1" />
                        <span className="text-xs text-slate-600">Take Photo</span>
                      </label>
                    </div>
                  </div>
                  {visitingCard && <p className="text-xs text-slate-600 mt-1">{visitingCard.name}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Meeting Type <span className="text-red-500">*</span>
              </label>
              <select
                value={meeting.meetingType}
                onChange={(e) => handleMeetingChange("meetingType", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900"
              >
                <option value="Broker">Broker</option>
                <option value="Client">Client</option>
              </select>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                {meeting.meetingType === "Broker" ? (
                  <Building2 className="h-4 w-4 text-slate-500" />
                ) : (
                  <User className="h-4 w-4 text-slate-500" />
                )}
                Meeting Details
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {meeting.meetingType === "Broker" ? (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Firm Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={meeting.firmName}
                        onChange={(e) => handleMeetingChange("firmName", e.target.value)}
                        required
                        placeholder="Enter firm name"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Owner Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={meeting.ownerName}
                        onChange={(e) => handleMeetingChange("ownerName", e.target.value)}
                        required
                        placeholder="Enter owner name"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={meeting.phoneNumber}
                        onChange={(e) => handleMeetingChange("phoneNumber", e.target.value)}
                        required
                        placeholder="Enter phone number"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Email Address</label>
                      <input
                        type="email"
                        value={meeting.email}
                        onChange={(e) => handleMeetingChange("email", e.target.value)}
                        placeholder="Enter email address"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={meeting.status}
                        onChange={(e) => handleMeetingChange("status", e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900"
                      >
                        <option value="Interested">Interested</option>
                        <option value="Not Interested">Not Interested</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Team Size</label>
                      <input
                        type="number"
                        value={meeting.teamSize}
                        onChange={(e) => handleMeetingChange("teamSize", e.target.value)}
                        placeholder="Enter team size"
                        min="1"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">RERA Registered</label>
                      <select
                        value={meeting.rera}
                        onChange={(e) => handleMeetingChange("rera", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Client Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={meeting.clientName}
                        onChange={(e) => handleMeetingChange("clientName", e.target.value)}
                        required
                        placeholder="Enter client name"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Broker Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={meeting.brokerName}
                        onChange={(e) => handleMeetingChange("brokerName", e.target.value)}
                        required
                        placeholder="Enter broker name"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Broker Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={meeting.brokerType}
                        onChange={(e) => handleMeetingChange("brokerType", e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900"
                      >
                        <option value="Direct">Direct</option>
                        <option value="Site">Site</option>
                        <option value="Reception">Reception</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Last 5 digits of Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={meeting.phoneLast5}
                        onChange={(e) => handleMeetingChange("phoneLast5", e.target.value)}
                        required
                        placeholder="Enter last 5 digits"
                        maxLength={5}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={meeting.clientStatus}
                        onChange={(e) => handleMeetingChange("clientStatus", e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900"
                      >
                        <option value="Hot">Hot</option>
                        <option value="Cold">Cold</option>
                        <option value="Dead">Dead</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Remarks</label>
                <textarea
                  value={meeting.remark}
                  onChange={(e) => handleMeetingChange("remark", e.target.value)}
                  placeholder="Enter any additional remarks..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-200">
              <label className="block text-sm font-medium text-slate-700">Follow Ups</label>
              {meeting.followUps.map((fup, idx) => (
                <div key={idx} className="grid md:grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={fup.date}
                    onChange={(e) => updateFollowUp(idx, "date", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900"
                    required
                  />
                  <input
                    type="text"
                    value={fup.remark}
                    onChange={(e) => updateFollowUp(idx, "remark", e.target.value)}
                    placeholder="Follow-up remark"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addFollowUp}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add another follow-up
              </button>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          All fields marked with <span className="text-red-500">*</span> are required
        </p>
      </div>
    </div>
  )
}

export default SalesReportForm


























































// import { useState } from "react"

// const SalesReportForm = () => {
  
//   const [visitingCard, setVisitingCard] = useState(null)
//   const today = new Date().toISOString().split("T")[0]
//   const [date, setDate] = useState(today)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [meeting, setMeeting] = useState({
//     firmName: "",
//     ownerName: "",
//     phoneNumber: "",
//     email: "",
//     teamSize: "",
//     rera: false,
//     remark: "",
//     status: "Interested", // default
//     followUps: [
//       { date: "", remark: "" } // start with one
//     ],
//   })

//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
//   const updateFollowUp = (index, field, value) => {
//     const updatedFollowUps = [...meeting.followUps];
//     updatedFollowUps[index][field] = value;
//     setMeeting((prev) => ({ ...prev, followUps: updatedFollowUps }));
//   };

//   const addFollowUp = () => {
//     setMeeting((prev) => ({
//       ...prev,
//       followUps: [...prev.followUps, { date: "", remark: "" }],
//     }));
//   };


//   const handleMeetingChange = (field, value) => {
//     setMeeting((prev) => ({
//       ...prev,
//       [field]: field === "rera" ? value === "true" : value,
//     }))
//   }

//   const handleFileChange = (e) => {
//     const file = e.target.files[0]
//     setVisitingCard(file)
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!visitingCard) {
//     alert("Please upload a visiting card image before submitting.");
//     return; // stop form submission
//   }
//     setIsSubmitting(true)

//     const token = localStorage.getItem("token")
//     if (!token) {
//       alert("Unauthorized")
//       setIsSubmitting(false)
//       return
//     }

//     const formData = new FormData()
//     // formData.append("date", date)
//     formData.append("meetings", JSON.stringify([meeting]))
//     if (visitingCard) {
//       formData.append("visitingCard", visitingCard)
//     }

//     try {
//       const res = await fetch(`${API_BASE_URL}/api/report/create`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       })
//       const data = await res.json()
//       if (!res.ok) throw new Error(data.message)
//       alert("Sales report created successfully")

//       // Reset form
//       setDate("")
//       setVisitingCard(null)
//       setMeeting({
//         firmName: "",
//         ownerName: "",
//         phoneNumber: "",
//         email: "",
//         teamSize: "",
//         rera: false,
//         remark: "",
//         status: "Interested",
//         followUps: [{ date: "", remark: "" }],
//       })
//     } catch (err) {
//       alert(`Error: ${err.message}`)
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
//       <div className="max-w-4xl mx-auto">

//         <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
//           {/* Form Header */}
//           <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
//             <h2 className="text-2xl font-semibold text-white flex items-center">
//               <span className="mr-3">📊</span>
//               Report Details
//             </h2>
//           </div>

//           <div className="p-8 space-y-8">
//             {/* Date Section */}
//             <div className="bg-gray-50 rounded-xl p-6">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                 <span className="mr-2">📅</span>
//                 Report Information
//               </h3>
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Report Date *</label>
//                   <input
//                     type="date"
//                     value={date}
//                     readOnly 
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Visiting Card</label>
//                   <div className="flex flex-col gap-3">
//                     {/* Upload / Drag Option */}
//                     <div className="relative flex-1">
//                       <input
//                         type="file"
//                         accept="image/*,.pdf"
//                         onChange={handleFileChange}
//                         className="hidden"
//                         id="visitingCard"
//                       />
//                       <label
//                         htmlFor="visitingCard"
//                         className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors duration-200 flex items-center justify-center text-gray-600 hover:text-blue-600"
//                       >
//                         <span className="mr-2">📎</span>
//                         {visitingCard ? visitingCard.name : "Choose file or drag here"}
//                       </label>
//                     </div>

//                     {/* Capture from Camera Option */}
//                     <div className="relative flex-1">
//                       <input
//                         type="file"
                        
//                         accept="image/*"
//                         capture="environment"
//                         onChange={handleFileChange}
//                         className="hidden"
//                         id="cameraCapture"
                        
//                       />
//                       <label
//                         htmlFor="cameraCapture"
//                         className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 transition-colors duration-200 flex items-center justify-center text-gray-600 hover:text-green-600"
//                       >
//                         📷 Take Photo
//                       </label>
//                     </div>
//                   </div>
//                 </div>

//               </div>
//             </div>

//             {/* Meeting Details Section */}
//             <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
//               <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
//                 <span className="mr-2">🤝</span>
//                 Meeting Details
//               </h3>

//               <div className="grid md:grid-cols-2 gap-6">
//                 {/* Firm Name */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Firm Name *</label>
//                   <input
//                     type="text"
//                     value={meeting.firmName}
//                     onChange={(e) => handleMeetingChange("firmName", e.target.value)}
//                     required
//                     placeholder="Enter firm name"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
//                   />
//                 </div>

//                 {/* Owner Name */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name *</label>
//                   <input
//                     type="text"
//                     value={meeting.ownerName}
//                     onChange={(e) => handleMeetingChange("ownerName", e.target.value)}
//                     required
//                     placeholder="Enter owner name"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
//                   />
//                 </div>

//                 {/* Phone Number */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
//                   <input
//                     type="tel"
//                     value={meeting.phoneNumber}
//                     onChange={(e) => handleMeetingChange("phoneNumber", e.target.value)}
//                     required
//                     placeholder="Enter phone number"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
//                   />
//                 </div>

//                 {/* Email */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
//                   <input
//                     type="email"
//                     value={meeting.email}
//                     onChange={(e) => handleMeetingChange("email", e.target.value)}
//                     placeholder="Enter email address"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
//                   />
//                 </div>
//                 {/* Status */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
//                   <select
//                     value={meeting.status}
//                     onChange={(e) => handleMeetingChange("status", e.target.value)}
//                     required
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
//                   >
//                     <option value="Interested">Interested</option>
//                     <option value="Not Interested">Not Interested</option>
//                   </select>
//                 </div>


//                 {/* Team Size */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
//                   <input
//                     type="number"
//                     value={meeting.teamSize}
//                     onChange={(e) => handleMeetingChange("teamSize", e.target.value)}
//                     placeholder="Enter team size"
//                     min="1"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
//                   />
//                 </div>

//                 {/* RERA Registration */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">RERA Registered</label>
//                   <select
//                     value={meeting.rera}
//                     onChange={(e) => handleMeetingChange("rera", e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
//                   >
//                     <option value="false">No</option>
//                     <option value="true">Yes</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Remarks */}
//               <div className="mt-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
//                 <textarea
//                   value={meeting.remark}
//                   onChange={(e) => handleMeetingChange("remark", e.target.value)}
//                   placeholder="Enter any additional remarks or notes..."
//                   rows="4"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
//                 />
//               </div>
//             </div>
//             {/* Follow-Ups */}
//             <div className="mt-6">
//               <label className="block text-sm font-medium text-gray-700 mb-4">Follow Ups</label>
//               {meeting.followUps.map((fup, idx) => (
//                 <div key={idx} className="grid md:grid-cols-2 gap-4 mb-4">
//                   <input
//                     type="date"
//                     value={fup.date}
//                     onChange={(e) => updateFollowUp(idx, "date", e.target.value)}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                     required
//                   />
//                   <input
//                     type="text"
//                     value={fup.remark}
//                     onChange={(e) => updateFollowUp(idx, "remark", e.target.value)}
//                     placeholder="Remark"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                   />
//                 </div>
//               ))}
//               <button
//                 type="button"
//                 onClick={addFollowUp}
//                 className="mt-2 text-sm text-blue-600 hover:underline"
//               >
//                 ➕ Add another follow-up
//               </button>
//             </div>


//             {/* Submit Button */}
//             <div className="flex justify-center pt-6">
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className={`px-8 py-4 rounded-xl font-semibold text-white text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
//                   isSubmitting
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl"
//                 }`}
//               >
//                 {isSubmitting ? (
//                   <span className="flex items-center">
//                     <svg
//                       className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                       ></path>
//                     </svg>
//                     Submitting...
//                   </span>
//                 ) : (
//                   <span className="flex items-center">
//                     <span className="mr-2">📤</span>
//                     Submit Report
//                   </span>
//                 )}
//               </button>
//             </div>
//           </div>
//         </form>

//         {/* Footer */}
//         <div className="text-center mt-8 text-gray-500 text-sm">
//           <p>All fields marked with * are required</p>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default SalesReportForm
