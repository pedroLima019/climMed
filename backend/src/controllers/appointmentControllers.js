const prisma = require("../lib/prisma");

exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, notes } = req.body;
    const patientId = req.user.userId;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: "doctorId e date são obrigatórios!",
      });
    }

    const doctor = await prisma.user.findUnique({
      where: { id: Number(doctorId) },
    });

    if (!doctor || doctor.role !== "DOCTOR") {
      return res
        .status(404)
        .json({ success: false, message: "Médico não encontrado" });
    }

    const appointmentStart = new Date(date);
    const consultationDuration = doctor.consultationDuration || 30;
    const appointmentEnd = new Date(
      appointmentStart.getTime() + consultationDuration * 60000
    );

    const weekday = appointmentStart.getDay();
    const availability = await prisma.doctorAvailability.findFirst({
      where: { doctorId: doctor.id, weekday },
    });

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: "Médico não possui disponibilidade neste dia",
      });
    }

    const startMinutes =
      appointmentStart.getHours() * 60 + appointmentStart.getMinutes();
    const endMinutes =
      appointmentEnd.getHours() * 60 + appointmentEnd.getMinutes();

    const [availStartHour, availStartMin] = availability.startTime
      .split(":")
      .map(Number);
    const [availEndHour, availEndMin] = availability.endTime
      .split(":")
      .map(Number);

    const availStart = availStartHour * 60 + availStartMin;
    const availEnd = availEndHour * 60 + availEndMin;

    if (startMinutes < availStart || endMinutes > availEnd) {
      return res.status(400).json({
        success: false,
        message: `Consulta fora da disponibilidade do médico (${availability.startTime} - ${availability.endTime})`,
      });
    }

    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId: Number(doctorId),
        status: "SCHEDULED",
        AND: [
          { startDate: { lt: appointmentEnd } },
          { endDate: { gt: appointmentStart } },
        ],
      },
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "Já existe uma consulta nesse horário",
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        startDate: appointmentStart,
        endDate: appointmentEnd,
        notes,
        patientId,
        doctorId: Number(doctorId),
        status: "SCHEDULED",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Consulta criada com sucesso",
      data: appointment,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Erro ao criar agendamento" });
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

    return res.status(200).json({
      success: true,
      message: "Consultas encontradas",
      data: appointments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao buscar agendamentos",
    });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(id) },
      include: { doctor: true, patient: true },
    });

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Consulta não encontrada" });
    }

    if (appointment.patientId !== userId && appointment.doctorId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Você não tem permissão para cancelar a consulta",
      });
    }

    const now = new Date();
    const diffHours = (appointment.startDate - now) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return res.status(400).json({
        success: false,
        message: "Cancelamento permitido apenas até 24 horas antes da consulta",
      });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "CANCELED" },
    });

    return res.json({
      success: true,
      message: "Consulta cancelada com sucesso",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Erro ao cancelar consulta" });
  }
};

exports.getPastAppointments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const pastAppointments = await prisma.appointment.findMany({
      where: {
        OR: [{ patientId: userId }, { doctorId: userId }],
        endDate: { lt: new Date() },
      },
      include: {
        doctor: { select: { id: true, name: true, email: true } },
        patient: { select: { id: true, name: true, email: true } },
      },
      orderBy: { endDate: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "Histórico de consultas encontrado",
      data: pastAppointments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erro ao buscar histórico de consultas",
    });
  }
};
