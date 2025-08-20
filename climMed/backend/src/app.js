const express = require("express");
const cors = require("cors");
const error = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(error);

const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);

const doctorAvailabilityRoutes = require("./routes/doctorAvailabilityRoutes");
app.use("/availability", doctorAvailabilityRoutes);

const appointmentRoutes = require("./routes/appointmentRoutes");
app.use("/appointment", appointmentRoutes);

module.exports = app;
