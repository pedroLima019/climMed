const prisma = require("../lib/prisma");

exports.createAvailability = async (req, res) => {
  try {
    const { weekday, startTime, endTime } = req.body;

    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado: apenas médicos podem definir disponibilidade.",
      });
    }

    const availability = await prisma.doctorAvailability.create({
      data: {
        doctorId: req.user.userId,
        weekday,
        startTime,
        endTime,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Disponibilidade criada com sucesso.",
      data: availability,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erro interno: não foi possível criar disponibilidade.",
    });
  }
};

exports.getMyAvailability = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({
        success: false,
        message:
          "Acesso negado: apenas médicos podem visualizar disponibilidade.",
      });
    }

    const availability = await prisma.doctorAvailability.findMany({
      where: { doctorId: req.user.userId },
    });

    return res.status(200).json({
      success: true,
      message: "Disponibilidades carregadas com sucesso.",
      data: availability,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro interno: não foi possível buscar disponibilidade.",
    });
  }
};

exports.deleteAvailability = async (req, res) => {
  try {
    const { availabilityId } = req.body;

    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado: apenas médicos podem excluir disponibilidade.",
      });
    }

    const availability = await prisma.doctorAvailability.findUnique({
      where: { id: Number(availabilityId) },
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Não encontrado: disponibilidade inexistente.",
      });
    }

    const now = new Date();
    const eventDate = new Date(availability.startTime);
    const diff = eventDate - now;
    const limitCancel = 24 * 60 * 60 * 1000;

    if (diff < limitCancel) {
      return res.status(400).json({
        success: false,
        message: "Cancelamento permitido apenas com 24 horas de antecedência.",
      });
    }

    await prisma.doctorAvailability.delete({
      where: { id: Number(availabilityId) },
    });

    return res.status(200).json({
      success: true,
      message: "Disponibilidade removida com sucesso.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro interno: não foi possível excluir disponibilidade.",
    });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.body;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos: doctorId e date são obrigatórios.",
      });
    }

    const doctor = await prisma.user.findUnique({
      where: { id: Number(doctorId) },
    });

    if (!doctor || doctor.role !== "DOCTOR") {
      return res.status(404).json({
        success: false,
        message: "Não encontrado: médico inexistente.",
      });
    }

    const consultationDuration = doctor.consultationDuration || 30;
    const day = new Date(date);
    const weekday = day.getDay();

    const availability = await prisma.doctorAvailability.findFirst({
      where: { doctorId: doctor.id, weekday },
    });

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: "Médico não possui disponibilidade neste dia.",
      });
    }

    const [startHour, startMinute] = availability.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = availability.endTime.split(":").map(Number);

    let slots = [];
    let current = new Date(day);
    current.setHours(startHour, startMinute, 0, 0);

    const end = new Date(day);
    end.setHours(endHour, endMinute, 0, 0);

    while (current.getTime() + consultationDuration * 60000 <= end.getTime()) {
      slots.push({
        start: new Date(current),
        end: new Date(current.getTime() + consultationDuration * 60000),
      });
      current = new Date(current.getTime() + consultationDuration * 60000);
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        status: "SCHEDULED",
        startDate: {
          gte: new Date(day.setHours(0, 0, 0, 0)),
          lt: new Date(day.setHours(23, 59, 59, 999)),
        },
      },
      select: { startDate: true, endDate: true },
    });

    const freeSlots = slots.filter(
      (slot) =>
        !appointments.some(
          (appt) => slot.start < appt.endDate && slot.end > appt.startDate
        )
    );

    return res.status(200).json({
      success: true,
      message: "Horários disponíveis carregados com sucesso.",
      data: {
        doctorId,
        date,
        slots: freeSlots,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erro interno: não foi possível buscar horários disponíveis.",
    });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { availabilityId, weekday, startTime, endTime } = req.body;

    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado: apenas médicos podem editar disponibilidade.",
      });
    }

    const availability = await prisma.doctorAvailability.findUnique({
      where: { id: Number(availabilityId) },
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Não encontrado: disponibilidade inexistente.",
      });
    }

    const day = new Date();
    day.setDate(day.getDate() + ((weekday - day.getDay() + 7) % 7));

    const [startHour, startMinute] = (startTime ?? availability.startTime)
      .split(":")
      .map(Number);
    const [endHour, endMinute] = (endTime ?? availability.endTime)
      .split(":")
      .map(Number);

    const startOfDay = new Date(day);
    startOfDay.setHours(startHour, startMinute, 0, 0);

    const endOfDay = new Date(day);
    endOfDay.setHours(endHour, endMinute, 0, 0);

    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: availability.doctorId,
        status: "SCHEDULED",
        startDate: { lt: endOfDay },
        endDate: { gt: startOfDay },
      },
    });

    if (conflictingAppointments.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Não é possível alterar disponibilidade com consultas já agendadas.",
      });
    }

    const updatedAvailability = await prisma.doctorAvailability.update({
      where: { id: Number(availabilityId) },
      data: {
        weekday: weekday ?? availability.weekday,
        startTime: startTime ?? availability.startTime,
        endTime: endTime ?? availability.endTime,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Disponibilidade atualizada com sucesso.",
      data: updatedAvailability,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erro interno: não foi possível atualizar disponibilidade.",
    });
  }
};
