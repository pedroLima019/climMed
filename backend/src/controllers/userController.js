const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, specialtyIds } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    let specialtiesData = undefined;
    if (role === "DOCTOR") {
      if (
        !specialtyIds ||
        Array.isArray(specialtyIds) ||
        specialtyIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Médico deve ter ao menos uma especialidade",
        });
      }

      const validSpecialties = await prisma.specialty.findMany({
        where: { id: { in: specialtyIds } },
      });

      if (validSpecialties.length !== specialtyIds.length) {
        return res.status(400).json({
          success: false,
          message: "Uma ou mais especialidades são inválidas",
        });
      }
      specialtiesDate = { connect: specialtyIds.map((id) => ({ id })) };
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        specialties: specialtiesData,
      },
      include: { specialties: true },
    });

    res.status(201).json({
      success: true,
      message: "Usuário registrado com sucesso",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Senha incorreta",
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login bem-sucedido",
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    const token = Math.random().toString(36).substring(2, 12);

    await prisma.user.update({
      where: { email },
      data: { resetToken: token },
    });

    res.status(200).json({
      success: true,
      message: "Token de recuperação gerado",
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const user = await prisma.user.findFirst({
      where: { resetToken: token },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token inválido ou expirado",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null },
    });

    res.status(200).json({
      success: true,
      message: "Senha redefinida com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await prisma.user.delete({ where: { id: userId } });

    res.status(200).json({
      success: true,
      message: "Conta excluída com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

exports.updateConsultationDuration = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { duration } = req.body;

    if (!duration || duration <= 0) {
      return res.status(400).json({
        success: false,
        message: "A duração deve ser maior que 0",
      });
    }

    const doctor = await prisma.user.findUnique({ where: { id: userId } });

    if (!doctor || doctor.role !== "DOCTOR") {
      return res.status(403).json({
        success: false,
        message: "Apenas médicos podem definir a duração da consulta",
      });
    }

    const updatedDoctor = await prisma.user.update({
      where: { id: userId },
      data: { consultationDuration: duration },
    });

    res.status(200).json({
      success: true,
      message: "Duração da consulta atualizada com sucesso",
      data: {
        id: updatedDoctor.id,
        name: updatedDoctor.name,
        consultationDuration: updatedDoctor.consultationDuration,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, email, phone } = req.body;

    if (!name && !email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Pelo menos um campo deve ser fornecido para atualizar.",
      });
    }

    if (email) {
      const emailExists = await prisma.user.findFirst({
        where: { email, id: { not: userId } },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email já está em uso por outro usuário.",
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name ?? undefined,
        email: email ?? undefined,
        phone: phone ?? undefined,
      },
    });

    if (specialtyIds) {
      const doctor = await prisma.user.findUnique({ where: { id: userId } });

      if (!doctor || doctor.role !== "DOCTOR") {
        return res.status(403).json({
          success: false,
          message: "Apenas médicos podem atualizar espcialidades",
        });
      }

      const validSpecialties = await prisma.specialty.findMany({
        where: {
          id: {
            in: specialtyIds,
          },
        },
      });

      if (validSpecialties.length !== specialtyIds.length) {
        return res.status(400).json({
          success: false,
          message: " Uma ou mais especialidades são inválidas",
        });
      }

      updateData.specialties = { set: specialtyIds.map((id) => ({ id })) };
    }

    const updateUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { specialties: true },
    });
    res.status(200).json({
      success: true,
      message: "Perfil atualizado com sucesso",
      data: updateUser,
    });
  } catch (error) {
    next(error);
  }
};
