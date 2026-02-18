import express from "express";
import { deleteRegisteredClient, getChannelPartnerDetails, getChannelPartnerReport, getChannelPartners, getClientsByChannelPartner, getRegisteredClients, registerClient, searchClientsFromReport, updateRegisteredClient } from "../controllers/registrationController.js";
import { authenticateUser } from '../middleware/auth.js';
import upload from '../multerConfig.js';


const router = express.Router();

router.post("/",authenticateUser, upload.single("clientPhoto"), registerClient);
router.get("/get",authenticateUser, getRegisteredClients);
router.get("/channel-partners", authenticateUser, getChannelPartners);
router.get("/channel-partner/:partnerId",authenticateUser, getChannelPartnerDetails);
router.put(
  "/register/:id",
  authenticateUser, 
  updateRegisteredClient
);

router.delete(
  "/register/:id",
  authenticateUser, // auth middleware
  deleteRegisteredClient
);

router.get(
  "/report",
  authenticateUser,
  getChannelPartnerReport
);

router.get(
  "/channel-partner/:partnerId/clients",
  authenticateUser,
  getClientsByChannelPartner
);

router.get(
  "/search-report-clients",
  authenticateUser,
  searchClientsFromReport
);



export default router;
