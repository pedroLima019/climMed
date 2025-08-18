const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentControllers");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, appointmentController.createAppointment);
router.delete("/:id", authMiddleware, appointmentController.deleteAppointment);
router.get("/", authMiddleware, appointmentController.getAppointments);
router.get("/available", authMiddleware, appointmentController.getAppointments);

module.exports = router;
