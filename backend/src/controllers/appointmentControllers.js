const prisma = require("../lib/prisma");

exports.createAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, notes, specialtyId } = req.body;
    const patientId = req.user.userId;

    if (!doctorId || !date || !specialtyId) {
      return res.status(400).json({
        success: false,
        message: "doctorId , date , specialtyId são obrigatórios!",
      });
    }

    const doctor = await prisma.user.findUnique({
      where: { id: Number(doctorId) },
      include: { specialties: true },
    });

    if (!doctor || doctor.role !== "DOCTOR") {
      return res.status(404).json({
        success: false,
        message: "Médico não encontrado",
      });
    }

    const hasSpecialty = doctor.specialties.some(
      (s) => s.id === Number(specialtyId)
    );

    if (!hasSpecialty) {
      return res.status(400).json({
        success: false,
        message: "O médico não possui a especialidade selecionada",
      });
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
        specialtyId: Number(specialtyId),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Consulta criada com sucesso",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// Buscar consultas futuras
exports.getAppointments = async (req, res, next) => {
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
    next(error);
  }
};

// Cancelar consulta
exports.cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(id) },
      include: { doctor: true, patient: true },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Consulta não encontrada",
      });
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
    next(error);
  }
};

// Histórico de consultas
exports.getPastAppointments = async (req, res, next) => {
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
    next(error);
  }
};
