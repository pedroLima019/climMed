const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentControllers");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, appointmentController.createAppointment);
router.get("/", authMiddleware, appointmentController.getAppointments);
router.put(
  "/:id/cancel",
  authMiddleware,
  appointmentController.cancelAppointment
);
router.get("/past", authMiddleware, appointmentController.getPastAppointments);

module.exports = router;
