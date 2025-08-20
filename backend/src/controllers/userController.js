const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });
    res
      .status(201)
      .json({
        success: true,
        data: user,
        message: "Usuário registrado com sucesso",
      });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Usuário não encontrado" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res
        .status(401)
        .json({ success: false, message: "Senha incorreta" });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res
      .status(200)
      .json({ success: true, data: { token }, message: "Login bem-sucedido" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Usuário não encontrado" });

    const token = Math.random().toString(36).substring(2, 12);
    await prisma.user.update({ where: { email }, data: { resetToken: token } });

    res
      .status(200)
      .json({
        success: true,
        data: { token },
        message: "Token de recuperação gerado",
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await prisma.user.findFirst({ where: { resetToken: token } });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Token inválido ou expirado" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null },
    });

    res
      .status(200)
      .json({ success: true, message: "Senha redefinida com sucesso" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    await prisma.user.delete({ where: { id: userId } });
    res
      .status(200)
      .json({ success: true, message: "Conta excluída com sucesso" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateConsultationDuration = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { duration } = req.body;

    if (!duration || duration <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "A duração deve ser maior que 0" });
    }

    const doctor = await prisma.user.findUnique({ where: { id: userId } });
    if (!doctor || doctor.role !== "DOCTOR") {
      return res
        .status(403)
        .json({
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
      data: {
        id: updatedDoctor.id,
        name: updatedDoctor.name,
        consultationDuration: updatedDoctor.consultationDuration,
      },
      message: "Duração da consulta atualizada com sucesso",
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Erro ao atualizar duração da consulta",
      });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, phone } = req.body;

    if (!name && !email && !phone) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Pelo menos um campo deve ser fornecido para atualizar.",
        });
    }

    if (email) {
      const emailExists = await prisma.user.findFirst({
        where: { email, id: { not: userId } },
      });
      if (emailExists)
        return res
          .status(400)
          .json({
            success: false,
            message: "Email já está em uso por outro usuário.",
          });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name ?? undefined,
        email: email ?? undefined,
        phone: phone ?? undefined,
      },
    });

    res
      .status(200)
      .json({
        success: true,
        data: updatedUser,
        message: "Perfil atualizado com sucesso",
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao atualizar perfil" });
  }
};
