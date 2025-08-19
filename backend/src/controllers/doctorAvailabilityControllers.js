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

    const availability = await prisma.doctorAvailability.findUnique({
      where: { id: Number(availabilityId) },
    });

    if (!availability) {
      return res.status(404).json({ error: "Disponibilidade não encontrada" });
    }

    const now = new Date();
    const eventDate = new Date(availability.startTime);
    const diff = eventDate - now;
    const limitCancel = 24 * 60 * 60 * 1000;

    if (diff < limitCancel) {
      return res.status(400).json({
        error: "Cancelamento permitido somente com 24 horas de antecedência",
      });
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

    const consultationDuration = doctor.consultationDuration || 30;
    const day = new Date(date);
    const weekday = day.getDay();

    const availability = await prisma.doctorAvailability.findFirst({
      where: { doctorId: doctor.id, weekday },
    });

    if (!availability) {
      return res.status(400).json([]);
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
      current = new Date(current.getTime() + consultationDuration * 60000);
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        status: "SCHEDULED",
        date: {
          gte: new Date(day.setHours(0, 0, 0, 0)),
        },
        endDate: {
          lte: new Date(targetDate.setHours(23, 59, 59, 999)),
        },
      },
    });

    const freeSlots = slots.filter((slots) => {
      return !appointments.some((appt) => {
        const slotEnd = new Date(
          slots.getTime() + consultationDuration * 60000
        );
        return appt.startDate < slotEnd && appt.endDate > slots;
      });
    });

    const formattedSlots = freeSlots.map((s) => {
      const day = String(s.getDay()).padStart(2, "0");
      const month = String(s.getMonth() + 1).padStart(2, "0");
      const fullYear = s.getFullYear();
      const hours = String(s.getHours()).padStart(2, "0");
      const minutes = String(s.getMinutes()).padStart(2, "0");
      return `${day}, ${month}, ${fullYear} ${hours}:${minutes}`;
    });
    return res.json({ doctorId, date, availableSlots: formattedSlots });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Erro ao buscar horários disponíveis" });
  }
};
