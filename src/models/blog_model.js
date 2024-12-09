const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    summary: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    image: {
      type: String, 
      required: false, 
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
