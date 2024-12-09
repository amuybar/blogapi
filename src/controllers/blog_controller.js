const Blog = require("../models/blog_model");
const { uploadImageToS3 } = require("../../utils/s3");

const { validationResult } = require("express-validator");

// Utility function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

/**
 * Create a new blog post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createBlog = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  try {
    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      try {
        imageUrl = await uploadImageToS3(req.file.path, req.file.filename);
      } catch (uploadError) {
        return res.status(500).json({
          message: "Image upload failed",
          error: uploadError.message,
        });
      }
    }

    // Generate unique slug
    const slug = generateSlug(req.body.title);

    // Create blog entry
    const newBlog = new Blog({
      title: req.body.title,
      slug: slug,
      summary: req.body.summary,
      body: req.body.body,
      image: imageUrl,
      author: req.body.author || null,
    });

    // Save blog
    await newBlog.save();

    // Respond with created blog
    res.status(201).json({
      message: "Blog created successfully",
      blog: newBlog,
    });
  } catch (error) {
    // Log the error for server-side tracking
    console.error("Blog creation error:", error);

    res.status(500).json({
      message: "Failed to create blog",
      error: "Internal server error",
    });
  }
};

/**
 * Get all blogs with pagination and optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllBlogs = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;

    // Filtering and sorting
    const query = {};
    const sortOptions = { createdAt: -1 }; // Sort by most recent

    // Execute query
    const blogs = await Blog.find(query)
      .populate("author", "firstName lastName email")
      .sort(sortOptions)
      .limit(limit)
      .skip(skipIndex);

    // Get total count for pagination
    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total,
    });
  } catch (error) {
    console.error("Get blogs error:", error);
    res.status(500).json({
      message: "Failed to retrieve blogs",
      error: "Internal server error",
    });
  }
};

/**
 * Get a specific blog by slug
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate("author", "name email")
      .lean();

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
        slug: req.params.slug,
      });
    }

    res.json(blog);
  } catch (error) {
    console.error("Get blog by slug error:", error);
    res.status(500).json({
      message: "Failed to retrieve blog",
      error: "Internal server error",
    });
  }
};
