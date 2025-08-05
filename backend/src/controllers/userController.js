const prisma = require("../lib/prisma");
const bcryp = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcryp.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
    res.status(201).json({ message: "usuário registrado com sucesso", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const isPasswordValid = await bcryp.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ error: "Senha incorreta" });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1D",
      }
    );
    res.status(200).json({ message: "Login bem-sucedido", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "usuário não encontrado" });

    const token = Math.random().toString(36).substring(2, 12);

    await prisma.user.update({
      where: { email },
      data: { resetToken: token },
    });
    res.status(200).json({ message: "Token de recuperação gerado", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await prisma.user.findFirst({ where: { resetToken: token } });
    if (!user)
      return res.status(400).json({ error: "Token inválido ou expirado" });

    const hashed = await bcryp.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null, 
      },
    });

    res.status(200).json({ message: "Senha redefinida com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  const userId = req.user.userId;
  try {
    await prisma.user.delete({ where: { id: userId } });
    res.status(200).json({ message: "conta excluída com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
