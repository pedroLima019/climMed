const prisma = require("../lib/prisma");

exports.createAppointment = async (req, res) => {
  const { doctrId, date, notes } = req.body;
  const patientId = req.user.userId 
};
