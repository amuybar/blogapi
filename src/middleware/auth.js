const jwt = require("jsonwebtoken");

// Authentication middleware
exports.authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Invalid token:", err);
    res.status(401).json({ error: "Invalid token." });
  }
};

// Authorization middleware for roles
exports.authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        console.log(req)
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: "Access denied. Insufficient permissions." });
      }
      next();
    };
  };
  