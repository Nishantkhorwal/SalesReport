import mongoose from "mongoose";

const SalesReportSchema = new mongoose.Schema({
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SalesReportUser",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  location: { // <-- new field
    latitude: { type: Number },
    longitude: { type: Number },
  },
  meetings: [
    {
      meetingType: {
        type: String,
        enum: ["Broker", "Client"],
        default: "Broker",  // ✅ old reports will be treated as Broker
      },
      firmName: { type: String},
      ownerName: { type: String},
      phoneNumber: { type: String},
      email: { type: String },
      visitingCard: { type: String }, // URL/path of uploaded file
      teamSize: { type: Number },
      rera: { type: Boolean }, // true = Yes, false = No
      remark: { type: String },
      status: {
        type: String,
        enum: ["Interested", "Not Interested"],
      },
      followUps: [
        {
          date: { type: Date, required: true }, // Follow-up date
          remark: { type: String },             // Notes about this follow-up
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],

      clientName: { type: String },
      brokerName: { type: String },
      brokerType: {
        type: String,
        enum: ["Direct", "Site", "Reception"],
      },
      phoneLast5: { type: String },
      clientStatus: {
        type: String,
        enum: ["Hot", "Cold", "Dead"],
      },
    },

  ],

  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("CrmSalesReport", SalesReportSchema);
