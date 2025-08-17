const prisma = require("../lib/prisma");

exports.createAvailability = async (req, res) => {
  try {
    const { weekday, startTime, endTime } = req.body;

    if (req.user.role !== "DOCTOR") {
      return res
        .status(403)
        .json({ error: "Apenas médicos podem definir disponibilidade" });
    }

    const availability = await prisma.doctorAvailability.create({
      data: {
        doctorId: req.user.userId,
        weekday,
        startTime,
        endTime,
      },
    });
    return res.status(201).json(availability);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar disponibilidade" });
  }
};

exports.getMyAvailability = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res
        .status(403)
        .json({ error: "Apenas médicos podem vizualizar disponibilidade" });
    }

    const availability = await prisma.doctorAvailability.findMany({
      where: { doctorId: req.user.userId },
    });

    return res.status(200).json(availability);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar disponibilidade" });
  }
};

exports.deleteAvailability = async (req, res) => {
  try {
    const { availabilityId } = req.body;

    if (req.user.role !== "DOCTOR") {
      return res
        .status(403)
        .json({ error: "Apenas médicos podem excluir disponibilidade" });
    }

    await prisma.doctorAvailability.delete({
      where: { id: Number(availabilityId) },
    });

    return res
      .status(200)
      .json({ message: "Disponibilidade removida com sucesso " });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir disponibilidade" });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.body;

    if (!doctorId || date) {
      return res.status(400).json({ error: "doctorId e são obrigatórios" });
    }

    const doctor = prisma.user.findUnique({
      where: { id: Number(doctorId) },
    });

    if (!doctor || doctor.role !== "DOCTOR") {
      return res.status(404).json({ error: "Médico não encontrado" });
    }
    const day = new Date(date);
    const weekday = day.getDay();

    const availability = await prisma.doctorAvailability.findFirst({
      where: { doctorId: doctor.id, weekday },
    });

    if (!availability) {
      return res
        .status(400)
        .json({ error: "Médico não possui disponibilidade neste dia " });
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

    while (current < end) {
      slots.push(new Date(current));
      current = new Date(current.getTime() + 30 * 60000);
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        status: "SCHEDULED",
        date: {
          gte: new Date(day.setHours(0, 0, 0, 0)),
          lt: new Date(day.setHours(23, 59, 59, 999)),
        },
      },
    });

    const busySlots = appointments.map((a) => a.date.getTime());

    const freeSlots = slots.filter((s) => !busySlots.includes(s.getTime()));
    return res.json({ doctorId, date, freeSlots });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Erro ao buscar horários disponíveis" });
  }
};
