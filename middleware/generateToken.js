const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      name: user.name,
      email: user.email,
      role: user.role,
      _id: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "3h",
    }
  );
};

module.exports = generateToken;
