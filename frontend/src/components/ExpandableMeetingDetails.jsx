const ExpandedMeetingDetails = ({ meeting, report, followUps }) => {
  return (
    <div className="space-y-6">

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {meeting.meetingType === "Client" ? (
          <>
            <Info label="Client Name" value={meeting.clientName} />
            <Info label="Last 5 Digits" value={meeting.phoneLast5} />
            <Info label="Broker Name" value={meeting.brokerName} />
            <Info label="Broker Type" value={meeting.brokerType} />
            <Info label="Client Status" value={meeting.clientStatus} />
          </>
        ) : (
          <>
            <Info label="Firm Name" value={meeting.firmName} />
            <Info label="Owner" value={meeting.ownerName} />
            <Info label="Phone" value={meeting.phoneNumber} />
            <Info label="Email" value={meeting.email} />
            <Info label="Team Size" value={meeting.teamSize} />
            <Info
              label="RERA"
              value={meeting.rera ? "Registered" : "Not Registered"}
            />
          </>
        )}

        <Info label="Location" value={report.address} />
      </div>

      {/* VISITING CARD */}
      {meeting.visitingCard && (
        <div>
          <p className="text-xs font-semibold mb-1">Visiting Card</p>
          <img
            src={`${API_BASE_URL}/${meeting.visitingCard}`}
            className="w-56 rounded border"
          />
        </div>
      )}

      {/* FOLLOW UPS */}
      {followUps?.length > 0 && (
        <div>
          <p className="font-semibold text-sm mb-2">
            Follow-ups ({followUps.length})
          </p>
          <div className="space-y-2">
            {followUps.map(f => (
              <div
                key={f._id}
                className="p-2 border rounded bg-white text-sm"
              >
                <div className="text-xs text-gray-500">
                  {new Date(f.date).toDateString()}
                </div>
                <p>{f.remark}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 uppercase">{label}</p>
    <p className="text-sm">{value || "—"}</p>
  </div>
)
