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

    if (!doctor.consultationDuration) {
      return res
        .status(400)
        .json({ error: "Médico não definiu a duração da consulta" });
    }

    const appointmentDate = new Date(date);
    const weekday = appointmentDate.getDay();

    const availability = await prisma.doctorAvailability.findFirst({
      where: { doctorId: doctor.id, weekday },
    });

    if (!availability) {
      return res
        .status(400)
        .json({ error: "Médico não possui disponibilidade neste dia" });
    }

    // Calcular minutos do início da consulta
    const appointmentMinutes =
      appointmentDate.getHours() * 60 + appointmentDate.getMinutes();

    const [startHour, startMinute] = availability.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = availability.endTime.split(":").map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    const appointmentEnd = appointmentMinutes + doctor.consultationDuration;

    // Validar se o horário da consulta + duração cabe dentro da disponibilidade
    if (appointmentMinutes < startTime || appointmentEnd > endTime) {
      return res.status(400).json({
        error: `Consulta excede disponibilidade do médico (${availability.startTime} - ${availability.endTime})`,
      });
    }

    // Conflitos: precisa verificar se o intervalo bate com outra consulta
    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId: Number(doctorId),
        status: "SCHEDULED",
        OR: [
          {
            date: {
              gte: appointmentDate,
              lt: new Date(
                appointmentDate.getTime() + doctor.consultationDuration * 60000
              ),
            },
          },
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
