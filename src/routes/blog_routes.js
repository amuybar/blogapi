const { createBlog, getAllBlogs } = require("../controllers/blog_controller");
const multerConfig = require("../middleware/multer_config");
const { authenticateUser } = require("../middleware/auth");

const blogRoutes = (app) => {
  app.route("/blogs").get(getAllBlogs);

  app.route("/blogs").post(
    authenticateUser,
    multerConfig.uploadBlogImage,
    (req, res, next) => {
      if (req.file) {
        return next();
      }
      // Proceed without image if not present
      next();
    },
    createBlog
  );
};

module.exports = blogRoutes;
