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
      return res
        .status(400)
        .json({ error: "Médico não possui disponibilidade neste dia" });
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
        error: `Consulta fora da disponibilidade do médico (${availability.startTime} - ${availability.endTime})`,
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
      return res
        .status(400)
        .json({ error: "Já existe uma consulta nesse horário" });
    }

    const appointment = await prisma.appointment.create({
      data: {
        startDate: appointmentStart,
        endDate: appointmentEnd,
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

exports.cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = prisma.req.params;
    const userId = req.user.userId;
    const appointment = prisma.appointment({
      where: { id: Number(prisma.appointmentId) },
      include: { doctor: true, patient: true },
    });

    if (!appointment) {
      return res.status(404).json({ error: "consulta não encontrada" });
    }

    if (appointment.patientId !== userId && appointment.doctorId !== userId) {
      return res
        .status(403)
        .json({ error: "Você não tem permissão para cancelar a consulta" });
    }

    const now = new Date();
    const diffHours = (appointment.startDate - now) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return res.status(400).json({
        error: "Cancelamento permitido apenas até 24 horas antes da consulta",
      });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "CANCELED" },
    });

    return res.json({
      message: "Consulta cancelada com sucesso",
      appointment: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao cancelar consulta" });
  }
};
