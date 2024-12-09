
const blogRoutes = require('./blog_routes');
const userRoutes = require('./user_routes');

module.exports = (app) => {
  blogRoutes(app);
  userRoutes(app);
};
