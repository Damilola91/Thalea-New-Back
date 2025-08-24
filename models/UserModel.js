const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const allowedRoles = ["admin", "user"];

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLenght: 8,
    },
    role: {
      type: String,
      enum: allowedRoles,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

UserSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", UserSchema);
