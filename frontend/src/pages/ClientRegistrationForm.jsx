import { useState, useEffect } from "react";
import { User, Phone, Building2, CheckCircle2, FileText } from "lucide-react";

const ClientRegistrationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [channelPartners, setChannelPartners] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isValidSelection, setIsValidSelection] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [clientPhoto, setClientPhoto] = useState(null);
  const [clientSearch, setClientSearch] = useState("");
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);



  const [form, setForm] = useState({
  clientName: "",
  phoneLast4: "",
  channelPartnerName: "",
  ownerName: "",
  phoneNumber: "",
  email: "",
  rmName: "",
});


  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      clientName: "",
      phoneLast4: "",
      channelPartnerName: "",
      ownerName: "",
      phoneNumber: "",
      email: "",
      rmName: "",
    });
  };

  const submitToBackend = async () => {
  const token = localStorage.getItem("token");

  const formData = new FormData();

  // Append all form fields
  formData.append("clientName", form.clientName);
  formData.append("phoneLast4", form.phoneLast4);
  formData.append("channelPartnerName", form.channelPartnerName);
  formData.append("ownerName", form.ownerName);
  formData.append("phoneNumber", form.phoneNumber);
  formData.append("email", form.email);
  formData.append("rmName", form.rmName);
  

  if (selectedPartner) {
  formData.append("source", selectedPartner.source);
}
  if (selectedPartner?._id) {
    formData.append("channelPartnerId", selectedPartner._id);
  }

  // 🔥 Append photo
  if (clientPhoto) {
    formData.append("clientPhoto", clientPhoto);
  }

  const res = await fetch(`${API_BASE_URL}/api/register/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // ❗ DO NOT set content-type
    },
    body: formData,
  });

  const data = await res.json();
  return { res, data };
};


  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!isValidSelection) {
    alert("Please select a Channel Partner from the dropdown.");
    return;
  }
   if (!form.rmName.trim()) {
    alert("RM Name is required.");
    return;
  }

  setIsSubmitting(true);

  try {
    const { res, data } = await submitToBackend();

    if (!res.ok) throw new Error(data.message);

    alert("Client registered successfully ✅");
    resetForm();
    setSelectedPartner(null);
    setIsValidSelection(false);
    setClientPhoto(null);

  } catch (err) {
    alert(err.message || "Something went wrong");
  } finally {
    setIsSubmitting(false);
  }
};


  const handleModalSubmit = () => {
  if (modalType === "rmOnly") {
    if (!form.rmName.trim()) {
      alert("RM Name is required");
      return;
    }

    setIsValidSelection(true);
    setShowModal(false);
    return;
  }

  if (modalType === "new") {
    if (
      !form.ownerName.trim() ||
      !form.phoneNumber.trim() ||
      !form.email.trim() ||
      !form.rmName.trim()
    ) {
      alert("All partner details are required");
      return;
    }

    setIsValidSelection(true);
    setShowModal(false);
  }
};

const fetchClientSuggestions = async (query) => {
  if (!query.trim()) {
    setClientSuggestions([]);
    return;
  }

  const token = localStorage.getItem("token");

  const res = await fetch(
    `${API_BASE_URL}/api/register/search-report-clients?search=${query}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await res.json();
  console.log(data);

  if (data.success) {
    setClientSuggestions(data.data);
    setShowClientSuggestions(true);
  }
};





  const fetchChannelPartners = async (query) => {
    if (!query.trim()) {
      setChannelPartners([]);
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API_BASE_URL}/api/register/channel-partners?search=${query}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    if (data.success) {
      setChannelPartners(data.data);
      setShowSuggestions(true);
    }
  };
  useEffect(() => {
  const delay = setTimeout(() => {
    if (clientSearch.trim()) {
      fetchClientSuggestions(clientSearch);
    }
  }, 400);

  return () => clearTimeout(delay);
}, [clientSearch]);


  return (
    <div className="min-h-screen bg-[#0b1220] py-8 px-4">
      <div className="max-w-xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-100  rounded-lg shadow-sm border border-slate-200 "
        >
          {/* Header */}
          <div className="border-b   border-slate-200 bg-gray-100 px-6 py-5">
            <div className=" items-center gap-2 lg:gap-0 flex md:flex-col sm:flex-col lg:flex-row justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Client Registration
                  </h2>
                  <p className="text-sm text-slate-500">
                    Register a new client entry
                  </p>
                </div>
              </div>

              {/* 🔍 Search Bar */}
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search existing client..."
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                  }}

                  onFocus={() => setShowClientSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowClientSuggestions(false), 150)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />

                {/* Suggestions Dropdown */}
                {showClientSuggestions && clientSuggestions.length > 0 && (
                  <div className="absolute right-0 mt-1 w-full bg-white border rounded-md shadow max-h-48 overflow-y-auto z-50">
                    {clientSuggestions.map((client) => (
                      <div
                        key={client._id}
                        onMouseDown={() => {
                          handleChange("clientName", client.clientName);

                          // Take last 4 from last 5
                          const last4 = client.phoneLast5.slice(-4);
                          handleChange("phoneLast4", last4);

                          setClientSearch(client.clientName);
                          setShowClientSuggestions(false);
                        }}
                        className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-sm"
                      >
                        <div className="font-medium">{client.clientName}</div>
                        <div className="text-xs text-gray-500">
                          *****{client.phoneLast5}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Body */}
          <div className="p-6 relative space-y-6">
            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Client Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={form.clientName}
                  onChange={(e) =>
                    handleChange("clientName", e.target.value)
                  }
                  required
                  className="w-full pl-10 pr-3 py-2 border rounded-md"
                />
              </div>
            </div>

            {/* Phone Last 4 */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Last 4 digits *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={form.phoneLast4}
                  onChange={(e) =>
                    handleChange(
                      "phoneLast4",
                      e.target.value.replace(/\D/g, "").slice(0, 4)
                    )
                  }
                  required
                  maxLength={4}
                  className="w-full pl-10 pr-3 py-2 border rounded-md"
                />
              </div>
            </div>

            {/* Client Photo */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Client Photo
              </label>

              <input
                type="file"
                accept="image/*"
                capture="environment" // 🔥 opens camera on mobile
                onChange={(e) => setClientPhoto(e.target.files[0])}
                className="w-full mt-1 border p-2 rounded-md bg-white"
              />
            </div>


            {/* Channel Partner */}
            {/* Channel Partner */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700">
                Channel Partner *
              </label>

              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={form.channelPartnerName}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleChange("channelPartnerName", value);
                    setIsValidSelection(false); // reset selection if typing
                    setSelectedPartner(null);
                    fetchChannelPartners(value);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  
                  required
                  className="w-full pl-10 pr-3 py-2 border rounded-md"
                />
              </div>

              {showSuggestions && (
                <div className="absolute z-10 mt-1 left-0 w-full bg-white border rounded-md shadow max-h-48 overflow-y-auto">
                  
                  {/* Existing Partners */}
                  {channelPartners.map((cp, index) => (
                    <div
                      key={cp._id || index}
                      onMouseDown={(e) => {
  e.preventDefault(); // 🔥 THIS IS IMPORTANT

  handleChange("channelPartnerName", cp.name);
  setSelectedPartner(cp);
  setShowSuggestions(false);

  if (!cp.rmName) {
    setModalType("rmOnly");
    setShowModal(true);
    setIsValidSelection(false);
  } else {
    handleChange("rmName", cp.rmName);
    setIsValidSelection(true);
  }
}}


                      className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                    >
                      {cp.name}
                    </div>
                  ))}




                  {/* If no partner found */}
                  {channelPartners.length === 0 && form.channelPartnerName.trim() !== "" && (
                    <div
                      onMouseDown={() => {
                        setSelectedPartner(null);
                        setModalType("new");
                        setShowSuggestions(false);
                        setShowModal(true);
                      }}


                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 cursor-pointer font-medium"
                    >
                      ➕ Create new Channel Partner "{form.channelPartnerName}"
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-slate-900 text-white rounded-md"
            >
              {isSubmitting ? "Saving..." : "Register Client"}
            </button>
          </div>
        </form>

        {/* 🔥 Modal */}
        {showModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 space-y-5 animate-fadeIn">

      <h3 className="text-lg font-semibold text-slate-800">
        {modalType === "rmOnly"
          ? "Assign Relationship Manager"
          : "New Channel Partner Details"}
      </h3>

      {/* Partner Name (readonly) */}
      <div>
        <label className="text-sm text-slate-600">Channel Partner</label>
        <input
          type="text"
          value={form.channelPartnerName}
          disabled
          className="w-full mt-1 border p-2 rounded bg-slate-100"
        />
      </div>

      {/* RM Only Mode */}
      {modalType === "rmOnly" && (
        <div>
          <label className="text-sm text-slate-600">RM Name *</label>
          <input
            type="text"
            value={form.rmName}
            onChange={(e) => handleChange("rmName", e.target.value)}
            className="w-full mt-1 border p-2 rounded focus:ring-2 focus:ring-slate-900"
          />
        </div>
      )}

      {/* Full New Partner Mode */}
      {modalType === "new" && (
        <>
          <input
            type="text"
            placeholder="Owner Name *"
            value={form.ownerName}
            onChange={(e) => handleChange("ownerName", e.target.value)}
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Phone Number *"
            value={form.phoneNumber}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
            className="w-full border p-2 rounded"
          />

          <input
            type="email"
            placeholder="Email *"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            placeholder="RM Name *"
            value={form.rmName}
            onChange={(e) => handleChange("rmName", e.target.value)}
            className="w-full border p-2 rounded"
          />
        </>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 border rounded-md"
        >
          Cancel
        </button>

        <button
          onClick={handleModalSubmit}
          className="px-4 py-2 bg-slate-900 text-white rounded-md"
        >
          Save & Continue
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default ClientRegistrationForm;
