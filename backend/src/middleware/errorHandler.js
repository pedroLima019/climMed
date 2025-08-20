module.exports = (err, req, res, next) => {
  console.error("🔥 Erro capturado:", err);

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Erro interno do servidor",
    data: err.data || null,
  });
};
