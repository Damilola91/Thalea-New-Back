const express = require("express");
const jwt = require("jsonwebtoken");
const login = express.Router();
const validatePassword = require("../middleware/validatePassword");
const generateToken = require("../middleware/generateToken");

login.post("/login", validatePassword, (req, res) => {
  const user = req.user;

  const userToken = generateToken(user);

  res.cookie("token", userToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 3 * 60 * 60 * 1000,
    path: "/",
  });

  return res.json({
    role: user.role,
    email: user.email,
    id: user._id,
    name: user.name,
  });
});

login.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  });

  return res.json({
    success: true,
    message: "Logout riuscito",
  });
});

// 🔹 nuova rotta /me
login.get("/me", (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Non autenticato" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({
      role: decoded.role,
      email: decoded.email,
      id: decoded._id,
      name: decoded.name,
    });
  } catch (err) {
    return res.status(401).json({ message: "Token non valido" });
  }
});

module.exports = login;
