const express = require("express");
const user = express.Router();
const UserModel = require("../models/UserModel");
const validateUser = require("../middleware/validateUser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

user.post("/users/create", [validateUser], async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const newUser = new UserModel({
    name,
    email,
    password,
    role,
  });

  try {
    const user = await newUser.save();
    res.status(201).send({
      statusCode: 201,
      message: "User saved successfulluy",
      user,
    });
  } catch (error) {
    next(error);
  }
});

user.patch("/users/:userId", async (req, res, next) => {
  const { userId } = req.params;
  const bodyToUpdate = req.body;

  try {
    if (bodyToUpdate.password) {
      const salt = await bcrypt.genSalt(10);
      bodyToUpdate.password = await bcrypt.hash(bodyToUpdate.password, salt);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: bodyToUpdate },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).send(updatedUser);
  } catch (error) {
    next(error);
  }
});

user.patch("/users/update-password/:userId", async (req, res, next) => {
  const { userId } = req.params;
  const { newPassword, token } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({
      error:
        "La nuova password è obbligatoria e deve contenere almeno 8 caratteri.",
    });
  }

  if (!token) {
    return res.status(401).json({ error: "Token mancante" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Token non valido per questo utente" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Utente non trovato." });
    }

    res.status(200).json({ message: "Password aggiornata con successo!" });
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({ error: "Token non valido o scaduto" });
    }
    next(error);
  }
});

user.get("/users", async (req, res, next) => {
  try {
    const users = await UserModel.find();
    if (users.length === 0) {
      return res.status(404).send({
        statusCode: 404,
        message: "User not found",
      });
    }
    res.status(200).send({
      statusCode: 200,
      users,
    });
  } catch (error) {
    next(error);
  }
});

user.delete("/users/delete/:userId", async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).send({
      statusCode: 400,
      message: "User ID is required",
    });
  }

  try {
    const user = await UserModel.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        message: "User not found with the given User Id",
      });
    }

    res.status(200).send({
      statusCode: 200,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = user;
