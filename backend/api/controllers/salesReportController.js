import CrmSalesReport from '../models/salesReportModel.js';
import SalesReportUser from '../models/userModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from "exceljs";




export const createSalesReport = async (req, res) => {
  try {
    const { meetings} = req.body;

    // Parse meetings from JSON string
    let parsedMeetings;
    try {
      parsedMeetings = JSON.parse(meetings);
      if (!Array.isArray(parsedMeetings)) throw new Error();
    } catch {
      return res.status(400).json({ message: 'Meetings must be a valid JSON array' });
    }

    const visitingCardFile = req.file;

    // Prepare formatted meetings with status & followUps
    const formattedMeetings = parsedMeetings.map((meeting) => {
      // Validate status
      const validStatuses = ["Interested", "Not Interested"];
      if (!validStatuses.includes(meeting.status)) {
        throw new Error(`Invalid status '${meeting.status}' for meeting with firm '${meeting.firmName}'`);
      }

      // Prepare followUps array (optional)
      const followUps = Array.isArray(meeting.followUps)
        ? meeting.followUps.map((followUp) => ({
            date: new Date(followUp.date),
            remark: followUp.remark || "",
          }))
        : [];

      return {
        firmName: meeting.firmName,
        ownerName: meeting.ownerName,
        phoneNumber: meeting.phoneNumber,
        email: meeting.email,
        teamSize: meeting.teamSize,
        rera: meeting.rera,
        remark: meeting.remark,
        status: meeting.status,
        visitingCard: visitingCardFile ? `uploads/${visitingCardFile.filename}` : null,
        followUps,
      };
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const report = await CrmSalesReport.create({
      user: req.user.id,
      date : today,
      meetings: formattedMeetings,
    });

    res.status(201).json({
      message: 'Sales report created successfully',
      report,
    });
  } catch (err) {
    console.error('Sales report creation failed:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// export const getSalesReports = async (req, res) => {
//   try {
//     const { role, id } = req.user;
//     const { 
//       startDate, 
//       endDate, 
//       userId, 
//       page = 1,    // Add page parameter with default value 1
//       limit = 10    // Add limit parameter with default value 10
//     } = req.query;

//     const query = {};

//     // Date filtering (unchanged)
//     if (startDate || endDate) {
//       query.date = {};
//       if (startDate) query.date.$gte = new Date(startDate);
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         query.date.$lte = end;
//       }
//     }

//     // User filtering logic - updated to handle specific user selection
//     if (userId && userId !== 'all') {
//       // If a specific user is selected, verify the requesting user has permission
//       if (role === 'admin') {
//         query.user = userId; // Admins can view any user's reports
//       } else if (role === 'manager') {
//         // Verify the requested user is under this manager
//         const isTeamMember = await SalesReportUser.exists({ _id: userId, managerId: id });
//         if (!isTeamMember) {
//           return res.status(403).json({ message: 'You can only view your team members\' reports' });
//         }
//         query.user = userId;
//       } else if (role === 'user') {
//         // Regular users can only view their own reports
//         if (userId !== id) {
//           return res.status(403).json({ message: 'You can only view your own reports' });
//         }
//         query.user = id;
//       }
//     } else {
//       // No specific user selected - apply role-based default filtering
//       if (role === 'user') {
//         query.user = id;
//       } else if (role === 'manager') {
//         const assignedUsers = await SalesReportUser.find({ managerId: id }, '_id');
//         const userIds = assignedUsers.map(user => user._id);
//         query.user = { $in: userIds };
//       }
//       // Admin sees all - no user filter needed
//     }

//     // Convert page and limit to numbers
//     const pageNumber = parseInt(page);
//     const limitNumber = parseInt(limit);
//     const skip = (pageNumber - 1) * limitNumber;

//     // Get total count of documents (for pagination info)
//     const total = await CrmSalesReport.countDocuments(query);

//     const reports = await CrmSalesReport.find(query)
//       .populate({
//         path: 'user',
//         select: 'name email role managerId',
//         populate: {
//           path: 'managerId',
//           select: '_id name'
//         }
//       })
//       .sort({ date: -1 })
//       .skip(skip)
//       .limit(limitNumber);


//     const firstDayOfMonth = new Date();
//     firstDayOfMonth.setDate(1);
//     firstDayOfMonth.setHours(0, 0, 0, 0);

//     const lastDayOfMonth = new Date(firstDayOfMonth);
//     lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1);
//     lastDayOfMonth.setDate(0);
//     lastDayOfMonth.setHours(23, 59, 59, 999);

//     const currentMonthQuery = {
//       ...query,
//       date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
//     };

//     const currentMonthCount = await CrmSalesReport.countDocuments(currentMonthQuery);  

//     res.status(200).json({ 
//       reports,
//       pagination: {
//         total,
//         page: pageNumber,
//         limit: limitNumber,
//         totalPages: Math.ceil(total / limitNumber)
//       },
//       currentMonth: currentMonthCount
//     });

//   } catch (err) {
//     console.error('Error fetching sales reports:', err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

export const getSalesReports = async (req, res) => {
  try {
    const { role, id } = req.user;
    const { 
      startDate, 
      endDate, 
      userId, 
      managerId,   // <-- new filter
      page = 1,    
      limit = 10   
    } = req.query;

    const query = {};

    // Date filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Manager filter (new logic)
    // Manager filter (new logic)
    if (managerId && managerId !== "all") {
      // Get all users under this manager
      const teamMembers = await SalesReportUser.find({ managerId }, "_id");
      const teamUserIds = teamMembers.map(u => u._id);

      // Always include manager's own ID as well
      teamUserIds.push(managerId);

      // If no team members + no manager found, return empty result
      if (teamUserIds.length === 0) {
        return res.status(200).json({
          reports: [],
          pagination: { total: 0, page: 1, limit: limit, totalPages: 0 },
          currentMonth: 0,
          today: 0
        });
      }

      query.user = { $in: teamUserIds };
    }


    // User filter (same as before)
    if (userId && userId !== "all") {
      if (role === "admin") {
        query.user = userId;
      } else if (role === "manager") {
        const isTeamMember = await SalesReportUser.exists({ _id: userId, managerId: id });
        if (!isTeamMember) {
          return res.status(403).json({ message: "You can only view your team members' reports" });
        }
        query.user = userId;
      } else if (role === "user") {
        if (userId !== id) {
          return res.status(403).json({ message: "You can only view your own reports" });
        }
        query.user = id;
      }
    } else {
      // Role-based fallback
      if (role === "user") {
        query.user = id;
      } else if (role === "manager" && !managerId) {
        const assignedUsers = await SalesReportUser.find({ managerId: id }, "_id");
        const userIds = assignedUsers.map(user => user._id);

        // Include manager’s own reports too
        userIds.push(id);

        query.user = { $in: userIds };
      }
      // Admin sees all
    }

    // Pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Total count
    const total = await CrmSalesReport.countDocuments(query);

    const reports = await CrmSalesReport.find(query)
      .populate({
        path: "user",
        select: "name email role managerId",
        populate: {
          path: "managerId",
          select: "_id name"
        }
      })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNumber);

    // Current month count
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const lastDayOfMonth = new Date(firstDayOfMonth);
    lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1);
    lastDayOfMonth.setDate(0);
    lastDayOfMonth.setHours(23, 59, 59, 999);

    const currentMonthQuery = {
      ...query,
      date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    };

    const currentMonthCount = await CrmSalesReport.countDocuments(currentMonthQuery);
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    const todayQuery = {
      ...query,
      date: { $gte: startOfDay, $lte: endOfDay }
    }

    const todayCount = await CrmSalesReport.countDocuments(todayQuery)

    res.status(200).json({
      reports,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      },
      currentMonth: currentMonthCount,
      today: todayCount,
    });

  } catch (err) {
    console.error("Error fetching sales reports:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const editSalesReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { meetings, date } = req.body;
    const visitingCardFile = req.file;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find the report
     const report = await CrmSalesReport.findById(reportId)
      .populate({
        path: 'user',
        select: 'managerId',
        populate: {
          path: 'managerId',
          select: '_id'
        }
      });
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Authorization check - only the creator can edit
    const isCreator = report.user._id.toString() === userId;
    const isAdmin = userRole === 'admin';
    const isManagerOfCreator = userRole === 'manager' && report.user.managerId?._id?.toString() === userId;

    if (!isCreator && !isManagerOfCreator && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to edit this report' });
    }

    // Parse meetings if provided
    let parsedMeetings = report.meetings;
    if (meetings) {
      try {
        parsedMeetings = JSON.parse(meetings);
        if (!Array.isArray(parsedMeetings)) throw new Error();
      } catch {
        return res.status(400).json({ message: 'Meetings must be a valid JSON array' });
      }
    }

    // Handle visiting card updates
    if (visitingCardFile) {
      // Delete old visiting card if exists
      if (report.meetings[0]?.visitingCard) {
        const oldFilePath = path.join(process.cwd(), report.meetings[0].visitingCard);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      // Update all meetings with new visiting card path
      parsedMeetings = parsedMeetings.map(meeting => ({
        ...meeting,
        visitingCard: `uploads/${visitingCardFile.filename}`
      }));
    }

    // Prepare update data
    const updateData = {};
    if (date) updateData.date = date;
    if (meetings) updateData.meetings = parsedMeetings;

    // Update the report
    const updatedReport = await CrmSalesReport.findByIdAndUpdate(
      reportId,
      updateData,
      { new: true }
    ).populate('user', 'name email role');

    res.status(200).json({
      message: 'Report updated successfully',
      report: updatedReport
    });

  } catch (err) {
    console.error('Error updating sales report:', err);
    res.status(500).json({ 
      message: 'Failed to update report', 
      error: err.message 
    });
  }
};


export const deleteSalesReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { id: userId, role: userRole } = req.user;

    // Find the report first to check ownership
    const report = await CrmSalesReport.findById(reportId)
      .populate({
        path: 'user',
        select: 'managerId',
        populate: {
          path: 'managerId',
          select: '_id'
        }
      });
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Authorization check - only the creator can edit
    const isCreator = report.user._id.toString() === userId;
    const isAdmin = userRole === 'admin';
    const isManagerOfCreator = userRole === 'manager' && report.user.managerId?._id?.toString() === userId;

    if (!isCreator && !isManagerOfCreator && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to edit this report' });
    }

    // Delete any associated visiting card files
    if (report.meetings && report.meetings.length > 0) {
      for (const meeting of report.meetings) {
        if (meeting.visitingCard) {
          const __filename = fileURLToPath(import.meta.url);
          const __dirname = path.dirname(__filename);
          const filePath = path.join(__dirname, '../', meeting.visitingCard);
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
              if (err) console.error('Error deleting file:', err);
            });
          }
        }
      }
    }

    // Delete the report
    await CrmSalesReport.findByIdAndDelete(reportId);

    res.status(200).json({ 
      success: true,
      message: 'Report deleted successfully' 
    });

  } catch (err) {
    console.error('Error deleting sales report:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete report',
      error: err.message 
    });
  }
};


export const addFollowUpToMeeting = async (req, res) => {
  try {
    const { salesReportId } = req.params;
    const { meetingId, date, remark } = req.body;

    if (!meetingId || !date) {
      return res.status(400).json({ message: "meetingId and date are required" });
    }

    const report = await CrmSalesReport.findById(salesReportId);
    if (!report) {
      return res.status(404).json({ message: "Sales report not found" });
    }

    const meeting = report.meetings.id(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found in this report" });
    }

    if (!Array.isArray(meeting.followUps)) {
      meeting.followUps = [];
    }

    meeting.followUps.push({
      date: new Date(date),
      remark: remark || "",
    });

    await report.save();

    res.status(200).json({
      message: "Follow-up added successfully",
      updatedMeeting: meeting,
    });
  } catch (err) {
    console.error("Error adding follow-up:", err);
    res.status(500).json({
      message: "Failed to add follow-up",
      error: err.message,
    });
  }
};


export const getAllFollowUps = async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    let userFilter = {};

    if (role === 'user') {
      userFilter.user = userId;
    } else if (role === 'manager') {
      const teamMembers = await SalesReportUser.find({ managerId: userId }, '_id');
      const teamIds = teamMembers.map(member => member._id);

      // Include manager's own ID
      teamIds.push(userId);

      userFilter.user = { $in: teamIds };
    }
    // Admin sees all — no filter

    const reports = await CrmSalesReport.find(userFilter).populate('user', 'name email');

    const followUps = [];

    reports.forEach(report => {
      report.meetings.forEach(meeting => {
        if (Array.isArray(meeting.followUps)) {
          meeting.followUps.forEach(fu => {
            followUps.push({
              reportId: report._id,
              user: report.user,
              meetingId: meeting._id,
              firmName: meeting.firmName,
              followUp: fu,
            });
          });
        }
      });
    });

    res.status(200).json({ followUps });

  } catch (err) {
    console.error('Error fetching follow-ups:', err);
    res.status(500).json({ message: 'Failed to fetch follow-ups', error: err.message });
  }
};


export const getTodaysFollowUps = async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    let userFilter = {};

    if (role === 'user') {
      userFilter.user = userId;
    } else if (role === 'manager') {
      const teamMembers = await SalesReportUser.find({ managerId: userId }, '_id');
      const teamIds = teamMembers.map(member => member._id);

      // include manager's own reports too
      teamIds.push(userId);

      userFilter.user = { $in: teamIds };
    }
    // Admin sees all — no filter

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const reports = await CrmSalesReport.find(userFilter).populate('user', 'name email');

    const todaysFollowUps = [];

    reports.forEach(report => {
      report.meetings.forEach(meeting => {
        if (Array.isArray(meeting.followUps)) {
          meeting.followUps.forEach(fu => {
            const fuDate = new Date(fu.date);
            if (fuDate >= todayStart && fuDate <= todayEnd) {
              todaysFollowUps.push({
                reportId: report._id,
                user: report.user,
                meetingId: meeting._id,
                firmName: meeting.firmName,
                followUp: fu,
              });
            }
          });
        }
      });
    });

    res.status(200).json({ todaysFollowUps });

  } catch (err) {
    console.error('Error fetching today\'s follow-ups:', err);
    res.status(500).json({ message: 'Failed to fetch today\'s follow-ups', error: err.message });
  }
};


export const getSalesReportById = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { id: userId, role: userRole } = req.user;

    // Find the report
    const report = await CrmSalesReport.findById(reportId)
      .populate({
        path: 'user',
        select: 'name email role managerId',
        populate: {
          path: 'managerId',
          select: '_id name'
        }
      });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Authorization check (same logic as edit/delete)
    const isCreator = report.user._id.toString() === userId;
    const isAdmin = userRole === 'admin';
    const isManagerOfCreator =
      userRole === 'manager' && report.user.managerId?._id?.toString() === userId;

    if (!isCreator && !isManagerOfCreator && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this report' });
    }

    res.status(200).json({ report });
  } catch (err) {
    console.error('Error fetching sales report:', err);
    res.status(500).json({
      message: 'Failed to fetch sales report',
      error: err.message
    });
  }
};





export const exportSalesReportsToExcel = async (req, res) => {
  try {
    const { type, date } = req.query; 
    // type can be "day" | "week" | "month"
    // date is the reference date from frontend (YYYY-MM-DD)

    if (!type || !date) {
      return res.status(400).json({ message: "type and date are required" });
    }

    const refDate = new Date(date);
    let startDate, endDate;

    if (type === "day") {
      startDate = new Date(refDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(refDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (type === "week") {
      const day = refDate.getDay(); // 0=Sunday
      startDate = new Date(refDate);
      startDate.setDate(refDate.getDate() - day); 
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (type === "month") {
      startDate = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      return res.status(400).json({ message: "Invalid type. Must be day, week, or month" });
    }

    // Fetch reports in range
    const reports = await CrmSalesReport.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate("user", "name email");

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Reports");

    // Define columns
    worksheet.columns = [
      { header: "Report Date", key: "date", width: 15 },
      { header: "User Name", key: "userName", width: 20 },
      { header: "User Email", key: "userEmail", width: 25 },
      { header: "Firm Name", key: "firmName", width: 20 },
      { header: "Owner Name", key: "ownerName", width: 20 },
      { header: "Phone Number", key: "phoneNumber", width: 15 },
      { header: "Email", key: "email", width: 20 },
      { header: "Team Size", key: "teamSize", width: 10 },
      { header: "RERA", key: "rera", width: 15 },
      { header: "Remark", key: "remark", width: 30 },
      { header: "Status", key: "status", width: 15 },
      { header: "Follow Ups", key: "followUps", width: 40 }
    ];

    // Add rows
    reports.forEach(report => {
      report.meetings.forEach(meeting => {
        worksheet.addRow({
          date: report.date.toISOString().split("T")[0],
          userName: report.user?.name || "N/A",
          userEmail: report.user?.email || "N/A",
          firmName: meeting.firmName,
          ownerName: meeting.ownerName,
          phoneNumber: meeting.phoneNumber,
          email: meeting.email,
          teamSize: meeting.teamSize,
          rera: meeting.rera,
          remark: meeting.remark,
          status: meeting.status,
          followUps: (meeting.followUps || [])
            .map(f => `${f.date.toISOString().split("T")[0]} - ${f.remark}`)
            .join("\n")
        });
      });
    });

    // Set response headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=sales_reports_${type}_${date}.xlsx`
    );

    // Send Excel file
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error exporting reports to Excel:", err);
    res.status(500).json({ message: "Failed to export reports", error: err.message });
  }
};




export const getReportsSummary = async (req, res) => {
  try {
    // Only admin can access
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Previous day range
    const yesterdayStart = new Date(startOfDay);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const yesterdayEnd = new Date(endOfDay);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    // Total reports per user
    const totalReports = await CrmSalesReport.aggregate([
      { $group: { _id: "$user", totalReports: { $sum: 1 } } }
    ]);

    // Today's reports per user
    const todayReports = await CrmSalesReport.aggregate([
      { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: "$user", todayReports: { $sum: 1 } } }
    ]);

    // Yesterday's reports per user
    const yesterdayReports = await CrmSalesReport.aggregate([
      { $match: { date: { $gte: yesterdayStart, $lte: yesterdayEnd } } },
      { $group: { _id: "$user", yesterdayReports: { $sum: 1 } } }
    ]);

    // Convert arrays to maps for quick lookup
    const totalMap = new Map(totalReports.map(r => [r._id.toString(), r.totalReports]));
    const todayMap = new Map(todayReports.map(r => [r._id.toString(), r.todayReports]));
    const yesterdayMap = new Map(yesterdayReports.map(r => [r._id.toString(), r.yesterdayReports]));

    // Fetch all users (non-managers) with their managers populated
    const users = await SalesReportUser.find({ role: "user" })
      .select("name email managerId")
      .populate({ path: "managerId", select: "name email" });

    // Group users by manager
    const managerMap = new Map();

    users.forEach(user => {
      const managerId = user.managerId ? user.managerId._id.toString() : "no-manager";
      const managerData = user.managerId
        ? { managerId: user.managerId._id, name: user.managerId.name, email: user.managerId.email }
        : { managerId: null, name: "No Manager", email: null };

      if (!managerMap.has(managerId)) {
        managerMap.set(managerId, { manager: managerData, users: [] });
      }

      managerMap.get(managerId).users.push({
        userId: user._id,
        name: user.name,
        email: user.email,
        totalReports: totalMap.get(user._id.toString()) || 0,
        todayReports: todayMap.get(user._id.toString()) || 0,
        yesterdayReports: yesterdayMap.get(user._id.toString()) || 0
      });
    });

    // Convert map to array for response
    const summary = Array.from(managerMap.values());

    res.json(summary);

  } catch (error) {
    console.error("Error fetching report summary:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




export const downloadReportsSummary = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

    // Aggregations
    const totalReports = await CrmSalesReport.aggregate([
      { $group: { _id: "$user", totalReports: { $sum: 1 } } }
    ]);
    const todayReports = await CrmSalesReport.aggregate([
      { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: "$user", todayReports: { $sum: 1 } } }
    ]);
    const yesterdayReports = await CrmSalesReport.aggregate([
      { $match: { date: { $gte: startOfYesterday, $lte: endOfYesterday } } },
      { $group: { _id: "$user", yesterdayReports: { $sum: 1 } } }
    ]);

    // Convert to maps
    const totalMap = new Map(totalReports.map(r => [r._id.toString(), r.totalReports]));
    const todayMap = new Map(todayReports.map(r => [r._id.toString(), r.todayReports]));
    const yesterdayMap = new Map(yesterdayReports.map(r => [r._id.toString(), r.yesterdayReports]));

    // Get all users with manager
    const users = await SalesReportUser.find({ role: "user" })
      .select("name email managerId")
      .populate({ path: "managerId", select: "name email" });

    // Group manager-wise
    const managerMap = new Map();
    users.forEach(user => {
      const managerId = user.managerId ? user.managerId._id.toString() : "no-manager";
      const managerData = user.managerId
        ? { managerId: user.managerId._id, name: user.managerId.name, email: user.managerId.email }
        : { managerId: null, name: "No Manager", email: null };

      if (!managerMap.has(managerId)) {
        managerMap.set(managerId, { manager: managerData, users: [] });
      }

      managerMap.get(managerId).users.push({
        name: user.name,
        email: user.email,
        totalReports: totalMap.get(user._id.toString()) || 0,
        yesterdayReports: yesterdayMap.get(user._id.toString()) || 0,
        todayReports: todayMap.get(user._id.toString()) || 0
      });
    });

    const summary = Array.from(managerMap.values());

    // 📊 Generate Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Report Summary");

    // Headers
    worksheet.columns = [
      { header: "Manager", key: "manager", width: 25 },
      { header: "Manager Email", key: "managerEmail", width: 30 },
      { header: "User", key: "user", width: 25 },
      { header: "User Email", key: "userEmail", width: 30 },
      { header: "Total Reports", key: "total", width: 15 },
      { header: "Yesterday", key: "yesterday", width: 15 },
      { header: "Today", key: "today", width: 15 },
    ];

    // Data
    summary.forEach(managerGroup => {
      managerGroup.users.forEach(user => {
        worksheet.addRow({
          manager: managerGroup.manager.name,
          managerEmail: managerGroup.manager.email || "N/A",
          user: user.name,
          userEmail: user.email,
          total: user.totalReports,
          yesterday: user.yesterdayReports,
          today: user.todayReports,
        });
      });
    });

    // Format header bold
    worksheet.getRow(1).font = { bold: true };

    // Send file
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=report-summary.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};






