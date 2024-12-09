const {
  createUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUserById,
} = require("../controllers/user_controllers");
const { authenticateUser } = require("../middleware/auth");

const userRoutes = (app) => {
  app.route("/api/users").get(
    authenticateUser,
    (req, res, next) => {
      if (req.file) {
        return next();
      }
      // Proceed without image if not present
      next();
    },
    getAllUsers
  );
  app.route("/api/register").post(createUser);
  app.route("/api/login").post(loginUser);
  app.route("/api/user/:id").put(updateUserById).get(getUserById);
};

module.exports = userRoutes;
