import CrmSalesRegistration from "../models/registrationModel.js";
import SalesReportUser from "../models/userModel.js";
import ChannelPartner from "../models/channelPartnerModel.js";
import CrmSalesReport from "../models/salesReportModel.js";

/**
 * @desc    Register / Create a new client
 * @route   POST /api/clients
 * @access  Private / Public (as per your auth)
 */
export const registerClient = async (req, res) => {
  try {
    const createdBy = req.user.id;

    if (!createdBy) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const {
      clientName,
      phoneLast4,
      channelPartnerId, // 🔥 new
      channelPartnerName, // optional (for new creation only)
      ownerName,
      phoneNumber,
      email,
      rmName,
    } = req.body;

    // =========================
    // BASIC VALIDATION
    // =========================
    if (!clientName || !phoneLast4 || !rmName) {
      return res.status(400).json({
        success: false,
        message: "Client name and phone are required",
      });
    }

    if (!/^[0-9]{4}$/.test(phoneLast4)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain exactly last 4 digits",
      });
    }

    // =========================
    // DUPLICATE CLIENT CHECK
    // =========================
    const existingClient = await CrmSalesRegistration.findOne({
      clientName: clientName.trim(),
      phoneLast4,
    });

    if (existingClient) {
      return res.status(409).json({
        success: false,
        message: "Client already registered",
      });
    }
    let clientPhotoPath = null;

    if (req.file) {
      clientPhotoPath = req.file.path; 
      // or req.file.filename depending on your multer setup
    }

    let partnerId = null;

if (channelPartnerId) {
  const partner = await ChannelPartner.findById(channelPartnerId);

  if (!partner) {
    return res.status(404).json({
      success: false,
      message: "Channel Partner not found",
    });
  }

  partnerId = partner._id;

} else if (channelPartnerName) {

  const normalizedName = channelPartnerName.trim();

  // 1️⃣ Check DB first
  let existingPartner = await ChannelPartner.findOne({
    name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
  });

  if (existingPartner) {
    partnerId = existingPartner._id;

  } else {

    // 2️⃣ Check CrmSalesReport EXACT MATCH
    const report = await CrmSalesReport.findOne({
      meetings: {
        $elemMatch: {
          meetingType: "Broker",
          firmName: normalizedName,
        },
      },
    });

    if (report) {
      const meetingData = report.meetings.find(
        m =>
          m.meetingType === "Broker" &&
          m.firmName.trim().toLowerCase() === normalizedName.toLowerCase()
      );

      if (!meetingData) {
        return res.status(400).json({
          success: false,
          message: "Partner data mismatch",
        });
      }

      const newPartner = await ChannelPartner.create({
        name: meetingData.firmName.trim(),
        ownerName: meetingData.ownerName || "",
        phoneNumber: meetingData.phoneNumber || "",
        email: meetingData.email || "",
      });

      partnerId = newPartner._id;

    } else {

      // 3️⃣ Manual creation ONLY here
      if (!ownerName || !phoneNumber || !email) {
        return res.status(400).json({
          success: false,
          message:
            "Owner name, phone number and email are required for new channel partner",
        });
      }

      const newPartner = await ChannelPartner.create({
        name: normalizedName,
        ownerName,
        phoneNumber,
        email,
      });

      partnerId = newPartner._id;
    }
  }

} else {
  return res.status(400).json({
    success: false,
    message: "Channel Partner selection is required",
  });
}


    // ====================================================
    // CREATE CLIENT (FINAL STEP)
    // ====================================================

    // ✅ SAVE rmName IN CHANNEL PARTNER (WITHOUT CHANGING OTHER FIELDS)
    if (partnerId && rmName) {
      await ChannelPartner.findByIdAndUpdate(
        partnerId,
        { $set: { rmName: rmName.trim() } },
        { new: true }
      );
    }

    const client = await CrmSalesRegistration.create({
      clientName: clientName.trim(),
      phoneLast4,
      channelPartner: partnerId, // 🔥 ObjectId saved
      clientPhoto: clientPhotoPath,
      createdBy,
    });

    return res.status(201).json({
      success: true,
      message: "Client registered successfully",
      data: client,
    });

  } catch (error) {
    console.error("Register Client Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while registering client",
    });
  }
};



export const getChannelPartners = async (req, res) => {
  try {
    const { search = "" } = req.query;

    if (!search.trim()) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }
    const escapeRegex = (string) =>
      string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const safeSearch = escapeRegex(search.trim());

    const regex = new RegExp(safeSearch, "i");

    // ================================
    // 1️⃣ Fetch from ChannelPartner DB
    // ================================
    const dbPartners = await ChannelPartner.find({
      name: regex,
    })
      .select("_id name ownerName phoneNumber email rmName")
      .limit(10);

    // Format them
    const formattedDBPartners = dbPartners.map((cp) => ({
      _id: cp._id,
      name: cp.name,
      ownerName: cp.ownerName,
      phoneNumber: cp.phoneNumber,
      email: cp.email,
      rmName: cp.rmName || "",
      source: "database",
    }));

    // ==========================================
    // 2️⃣ Fetch from CrmSalesReport (Broker Only)
    // ==========================================
    const reports = await CrmSalesReport.find({
      meetings: {
        $elemMatch: {
          meetingType: "Broker",
          firmName: regex,
        },
      },
    }).select("meetings");

    const reportPartners = [];

    reports.forEach((report) => {
      report.meetings.forEach((meeting) => {
        if (
          meeting.meetingType === "Broker" &&
          regex.test(meeting.firmName)
        ) {
          reportPartners.push({
            _id: null, // ❗ not saved in ChannelPartner yet
            name: meeting.firmName,
            ownerName: meeting.ownerName,
            phoneNumber: meeting.phoneNumber,
            email: meeting.email,
            rmName: "", 
            source: "report",
          });
        }
      });
    });

    // ====================================
    // 3️⃣ Merge + Remove Duplicates
    // ====================================
    const combined = [...formattedDBPartners, ...reportPartners];

    const uniqueMap = new Map();

    combined.forEach((item) => {
      const key = item.name.trim().toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    const finalResult = Array.from(uniqueMap.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      data: finalResult,
    });

  } catch (error) {
    console.error("Get Channel Partners Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch channel partners",
    });
  }
};



export const getRegisteredClients = async (req, res) => {
  try {
    const { id, role } = req.user;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const {
      search,
      createdByRole, // user | manager
      fromDate,
      toDate,
    } = req.query;

    let filter = {};

    // =========================
    // 🔐 ROLE-BASED VISIBILITY
    // =========================

    if (role === "user") {
      filter.createdBy = id;
    }

    if (role === "manager") {
      const usersUnderManager = await SalesReportUser.find(
        { managerId: id },
        "_id"
      );

      const userIds = usersUnderManager.map((u) => u._id);
      filter.createdBy = { $in: [id, ...userIds] };
    }

    // admin → no restriction

    // =========================
    // 🔍 SEARCH BY CLIENT NAME
    // =========================
   if (search) {
  const regex = new RegExp(search.trim(), "i");

  // 1️⃣ Find matching channel partners
  const matchingPartners = await ChannelPartner.find({
    name: regex,
  }).select("_id");

  const partnerIds = matchingPartners.map((p) => p._id);

  filter.$or = [
    { clientName: regex },
    { phoneLast4: regex },
    { channelPartner: { $in: partnerIds } },
  ];
}



    // =========================
    // 👤 FILTER BY CREATOR ROLE
    // =========================
    if (createdByRole && ["user", "manager"].includes(createdByRole)) {
  const usersWithRole = await SalesReportUser.find(
    { role: createdByRole },
    "_id"
  );

  const roleUserIds = usersWithRole.map((u) => u._id.toString());

  if (filter.createdBy) {
    // Normalize to array
    const existingIds = Array.isArray(filter.createdBy.$in)
      ? filter.createdBy.$in.map((id) => id.toString())
      : [filter.createdBy.toString()];

    const finalIds = existingIds.filter((id) =>
      roleUserIds.includes(id)
    );

    filter.createdBy = { $in: finalIds };
  } else {
    filter.createdBy = { $in: roleUserIds };
  }
}


    // =========================
    // 📅 DATE RANGE FILTER
    // =========================
    if (fromDate || toDate) {
      filter.createdAt = {};

      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate);
      }

      if (toDate) {
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endOfDay;
      }
    }

    // =========================
    // 🔢 PAGINATION DATA
    // =========================
    const totalCount = await CrmSalesRegistration.countDocuments(filter);

    const clients = await CrmSalesRegistration.find(filter)
      .populate({
        path: "createdBy",
        select: "name email role",
      })
      .populate({
        path: "channelPartner",
        select: "name ownerName phoneNumber email rmName",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      data: clients,
    });
  } catch (error) {
    console.error("Get Registered Clients Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching clients",
    });
  }
};
// 🔎 Search Clients from CrmSalesReport
export const searchClientsFromReport = async (req, res) => {
  try {
    const { search = "" } = req.query;

    if (!search.trim()) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const regex = new RegExp(search.trim(), "i");

    const reports = await CrmSalesReport.aggregate([
      { $unwind: "$meetings" },

      {
        $match: {
          $or: [
            { "meetings.clientName": regex },
            { "meetings.phoneLast5": regex }
          ]
        }
      },

      {
        $project: {
          _id: 0,
          clientName: "$meetings.clientName",
          phoneLast5: "$meetings.phoneLast5"
        }
      },

      { $limit: 20 }
    ]);

    return res.status(200).json({
      success: true,
      data: reports,
    });

  } catch (error) {
    console.error("Search Clients From Report Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while searching clients",
    });
  }
};



export const updateRegisteredClient = async (req, res) => {
  try {
    const { id: clientId } = req.params;
    const { id: userId, role } = req.user;

    const { clientName, phoneLast4, rmName  } = req.body;

    // 🔎 Fetch existing client
    const client = await CrmSalesRegistration.findById(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // =========================
    // 🔐 AUTHORIZATION CHECK
    // =========================

    if (role === "user") {
      if (client.createdBy.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to edit this client",
        });
      }
    }

    if (role === "manager") {
      const usersUnderManager = await SalesReportUser.find(
        { managerId: userId },
        "_id"
      );

      const allowedIds = [
        userId,
        ...usersUnderManager.map((u) => u._id.toString()),
      ];

      if (!allowedIds.includes(client.createdBy.toString())) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to edit this client",
        });
      }
    }

    // admin → full access

    // =========================
    // 🧪 VALIDATION
    // =========================

    if (phoneLast4 && !/^[0-9]{4}$/.test(phoneLast4)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain exactly 4 digits",
      });
    }

    // =========================
    // 🚫 DUPLICATE CHECK
    // =========================

    const newName = clientName?.trim() || client.clientName;
    const newPhone = phoneLast4 || client.phoneLast4;

    const duplicate = await CrmSalesRegistration.findOne({
      _id: { $ne: clientId },
      clientName: newName,
      phoneLast4: newPhone,
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Another client with same name and phone already exists",
      });
    }

    // =========================
    // ✏️ UPDATE FIELDS
    // =========================

    if (clientName) client.clientName = newName;
    if (phoneLast4) client.phoneLast4 = newPhone;


    await client.save();

    if (rmName && client.channelPartner) {
      await ChannelPartner.findByIdAndUpdate(
        client.channelPartner,
        { $set: { rmName: rmName.trim() } }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Client updated successfully",
      data: client,
    });

  } catch (error) {
    console.error("Update Registered Client Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating client",
    });
  }
};



/**
 * @desc    Delete a registered client
 * @route   DELETE /api/register/:id
 * @access  Private (User / Manager / Admin)
 */
export const deleteRegisteredClient = async (req, res) => {
  try {
    const { id: clientId } = req.params;
    const { id: userId, role } = req.user;

    // 🔎 Find client
    const client = await CrmSalesRegistration.findById(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // =========================
    // 🔐 AUTHORIZATION CHECK
    // =========================

    if (role === "user") {
      if (client.createdBy.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to delete this client",
        });
      }
    }

    if (role === "manager") {
      const usersUnderManager = await SalesReportUser.find(
        { managerId: userId },
        "_id"
      );

      const allowedIds = [
        userId,
        ...usersUnderManager.map((u) => u._id.toString()),
      ];

      if (!allowedIds.includes(client.createdBy.toString())) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to delete this client",
        });
      }
    }

    // admin → full access

    // =========================
    // 🗑 DELETE CLIENT
    // =========================
    await client.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("Delete Registered Client Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting client",
    });
  }
};






export const getChannelPartnerDetails = async (req, res) => {
  try {
    const { partnerId } = req.params;

    if (!partnerId) {
      return res.status(400).json({
        success: false,
        message: "Channel Partner ID is required",
      });
    }

    // 1️⃣ Find Channel Partner directly
    const partner = await ChannelPartner.findById(partnerId);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Channel Partner not found",
      });
    }

    // 2️⃣ Return details
    return res.status(200).json({
      success: true,
      data: {
        channelPartnerName: partner.name,
        ownerName: partner.ownerName || "",
        phoneNumber: partner.phoneNumber || "",
        email: partner.email || "",
        rmName: partner.rmName || "",
      },
    });

  } catch (error) {
    console.error("Error fetching channel partner:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching channel partner details",
    });
  }
};



export const getChannelPartnerReport = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1
    let limit = parseInt(req.query.limit) || 10

    if (page < 1) page = 1
    if (limit < 1) limit = 10

    const skip = (page - 1) * limit

    const {
      type,
      startDate,
      endDate,
      search = "",
    } = req.query;
    

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);

    let dateMatch = {};
    const now = new Date();

    // =========================
    // 📅 DATE FILTER
    // =========================

    if (type === "daily") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      dateMatch = { createdAt: { $gte: start, $lte: end } };
    }

    else if (type === "weekly") {
      const firstDay = new Date();
      const day = firstDay.getDay();
      const diff = firstDay.getDate() - day;

      firstDay.setDate(diff);
      firstDay.setHours(0, 0, 0, 0);

      dateMatch = { createdAt: { $gte: firstDay, $lte: now } };
    }

    else if (type === "monthly") {
      const firstDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
      firstDay.setHours(0, 0, 0, 0);

      dateMatch = { createdAt: { $gte: firstDay, $lte: now } };
    }

    else if (type === "custom") {
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "startDate and endDate are required",
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      dateMatch = { createdAt: { $gte: start, $lte: end } };
    }

    // =========================
    // 🔎 AGGREGATION PIPELINE
    // =========================

    const pipeline = [
      { $match: dateMatch },

      {
        $lookup: {
          from: "channelpartners",
          localField: "channelPartner",
          foreignField: "_id",
          as: "partner",
        },
      },

      { $unwind: "$partner" },

      // 🔍 SEARCH FILTER
      ...(search
        ? [
            {
              $match: {
                "partner.name": {
                  $regex: search,
                  $options: "i",
                },
              },
            },
          ]
        : []),

      {
        $group: {
          _id: "$partner._id",
          partnerName: { $first: "$partner.name" },
          rmName: { $first: "$partner.rmName" },
          ownerName: { $first: "$partner.ownerName" },
          totalClients: { $sum: 1 },
        },
      },

      { $sort: { totalClients: -1 } },
    ];

    // =========================
    // 📊 GET TOTAL COUNT
    // =========================

    const totalResults = await CrmSalesRegistration.aggregate(pipeline);
    const totalPartners = totalResults.length;

    const grandTotalClients = totalResults.reduce(
      (acc, item) => acc + item.totalClients,
      0
    );

    // =========================
    // 📄 PAGINATION
    // =========================

    pipeline.push(
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize }
    );

    const report = await CrmSalesRegistration.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      data: {
        filterType: type || "all",
        totalPartners,
        grandTotalClients,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalPartners / pageSize),
        report,
      },
    });

  } catch (error) {
    console.error("Channel Partner Report Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while generating report",
    });
  }
};



export const getClientsByChannelPartner = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { id: userId, role } = req.user;

    if (!partnerId) {
      return res.status(400).json({
        success: false,
        message: "Channel Partner ID is required",
      });
    }

    // =========================
    // 📄 PAGINATION
    // =========================
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    const {
      search,
      type,
      startDate,
      endDate,
    } = req.query;

    let filter = {
      channelPartner: partnerId,
    };

    // =========================
    // 🔐 ROLE-BASED VISIBILITY
    // =========================
    if (role === "user") {
      filter.createdBy = userId;
    }

    if (role === "manager") {
      const usersUnderManager = await SalesReportUser.find(
        { managerId: userId },
        "_id"
      );

      const allowedIds = [
        userId,
        ...usersUnderManager.map((u) => u._id),
      ];

      filter.createdBy = { $in: allowedIds };
    }

    // =========================
    // 🔍 SEARCH FILTER
    // =========================
    if (search) {
      const regex = new RegExp(search.trim(), "i");

      filter.$or = [
        { clientName: regex },
        { phoneLast4: regex },
      ];
    }

    // =========================
    // 📅 DATE FILTER
    // =========================
    const now = new Date();

    if (type === "daily") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      filter.createdAt = { $gte: start, $lte: end };
    }

    else if (type === "weekly") {
      const firstDay = new Date();
      const day = firstDay.getDay();
      const diff = firstDay.getDate() - day;

      firstDay.setDate(diff);
      firstDay.setHours(0, 0, 0, 0);

      filter.createdAt = { $gte: firstDay, $lte: now };
    }

    else if (type === "monthly") {
      const firstDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

      firstDay.setHours(0, 0, 0, 0);

      filter.createdAt = { $gte: firstDay, $lte: now };
    }

    else if (type === "custom") {
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "startDate and endDate are required",
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filter.createdAt = { $gte: start, $lte: end };
    }

    // =========================
    // 🔢 TOTAL COUNT
    // =========================
    const totalCount = await CrmSalesRegistration.countDocuments(filter);

    // =========================
    // 📦 FETCH DATA
    // =========================
    const clients = await CrmSalesRegistration.find(filter)
      .populate({
        path: "createdBy",
        select: "name email role",
      })
      .populate({
        path: "channelPartner",
        select: "name ownerName phoneNumber email rmName",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      partnerId,
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      data: clients,
    });

  } catch (error) {
    console.error("Get Clients By Channel Partner Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching channel partner clients",
    });
  }
};












