const mongoose = require("mongoose");
const Schema = mongoose.Schema;

export const UserSchema = new Schema({
  fullName: { type: String, required: "Enter Full Name" },
  email: { type: String, required: "Email is Required" },
  password: { type: String, required: "Password is Required" },
  role:{type: String, default: "reader"},
  created_date: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
