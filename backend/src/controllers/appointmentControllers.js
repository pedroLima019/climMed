const prisma = require("../lib/prisma");

exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, notes } = req.body;
    const patientId = req.user.userId;

    if (!doctorId || !date) {
      return res
        .status(400)
        .json({ error: "doctorId e date são obrigatórios!" });
    }

    const doctor = await prisma.user.findUnique({
      where: { id: Number(doctorId) },
    });

    if (!doctor || doctor.role !== "DOCTOR") {
      return res.status(404).json({ error: "Médico não encontrado" });
    }

    const appointmentDate = new Date(date);
    const weekday = appointmentDate.getDay();

    // 🔹 Verificar se o médico tem disponibilidade no dia
    const availability = await prisma.doctorAvailability.findFirst({
      where: { doctorId: doctor.id, weekday },
    });

    if (!availability) {
      return res
        .status(400)
        .json({ error: "Médico não possui disponibilidade neste dia" });
    }

    const appointmentMinutes =
      appointmentDate.getHours() * 60 + appointmentDate.getMinutes();
    const [startHour, startMinute] = availability.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = availability.endTime.split(":").map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (appointmentMinutes < startTime || appointmentMinutes >= endTime) {
      return res.status(400).json({
        error: `Horário fora da disponibilidade do médico (${availability.startTime} - ${availability.endTime})`,
      });
    }

    const doctorConflict = await prisma.appointment.findFirst({
      where: {
        doctorId: Number(doctorId),
        date: appointmentDate,
        status: "SCHEDULED",
      },
    });

    if (doctorConflict) {
      return res
        .status(400)
        .json({ error: "O médico já possui uma consulta neste horário" });
    }

    const patientConflict = await prisma.appointment.findFirst({
      where: {
        patientId,
        date: appointmentDate,
        status: "SCHEDULED",
      },
    });

    if (patientConflict) {
      return res
        .status(400)
        .json({ error: "Você já possui uma consulta neste horário" });
    }

    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        notes,
        patientId,
        doctorId: Number(doctorId),
      },
    });

    return res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar agendamento" });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [{ patientId: userId }, { doctorId: userId }],
      },
      include: {
        doctor: { select: { id: true, name: true, email: true } },
        patient: { select: { id: true, name: true, email: true } },
      },
    });
    return res.status(200).json(appointments);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar agendamentos" });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointmentId = Number(req.params.id);
    const userId = req.user.userId;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }
    if (appointment.patientId !== userId && appointment.doctorId !== userId) {
      return res.status(403).json({
        error: "Você não tem permissão para cancelar esse agendamento ",
      });
    }

    await prisma.appointment.delete({
      where: { id: appointmentId },
    });

    return res
      .status(203)
      .json({ message: "Agendamento cancelado com sucesso !" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cancelar agendamento !" });
  }
};
