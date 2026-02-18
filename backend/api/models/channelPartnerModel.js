import mongoose from "mongoose";

const channelPartnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    ownerName: {
      type: String,
      trim: true,
    },

    phoneNumber: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },
    rmName: {                   
      type: String,
      default: "",              
      trim: true,
    },
  },
  { timestamps: true }
);


export default mongoose.model("ChannelPartner", channelPartnerSchema);
