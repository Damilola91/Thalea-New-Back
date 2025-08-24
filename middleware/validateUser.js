const validateUser = (req, res, next) => {
  const errors = [];

  const { name, role, email, password } = req.body;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("The Email is Not Valid");
  }

  if (typeof password !== "string" || password.length < 8) {
    errors.push("Password must be at least 8 char");
  }

  if (typeof name !== "string") {
    errors.push("Name must be a string");
  }

  if (typeof role !== "string") {
    errors.push("Surname must be a string");
  }

  if (errors.length > 0) {
    res.status(400).send({ errors });
  } else {
    next();
  }
};

module.exports = validateUser;
