const express = require("express");
const login = express.Router();
const validatePassword = require("../middleware/validatePassword");
const generateToken = require("../middleware/generateToken");

login.post("/login", validatePassword, (req, res) => {
  const user = req.user;

  const userToken = generateToken(user);

  res.status(200).send({
    statusCode: 200,
    message: "You are successfully logged in",
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      _id: user._id,
      userToken,
    },
  });
});

login.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).send({
    statusCode: 200,
    message: "You have been logged out successfully",
  });
});

module.exports = login;
