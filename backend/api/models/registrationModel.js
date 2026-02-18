import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
    },

    phoneLast4: {
      type: String,
      required: true,
      match: /^[0-9]{4}$/,
    },

    channelPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChannelPartner",
      required: true,
    },
    clientPhoto: {
      type: String, // store image path or URL
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesReportUser",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("CrmSalesRegistration", clientSchema);
