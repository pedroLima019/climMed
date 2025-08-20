module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== "DOCTOR") {
    return res
      .status(403)
      .json({ error: "Apenas médicos têm permissão para acessar está rota" });
  }
  next();
};
