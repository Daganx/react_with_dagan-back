const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Model pour l'ajout d'un utilisateur ici admin
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Middleware pour hacher le mot de passe avant de sauvegarder l'admin
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Ne hache pas si le mot de passe n'a pas changé

  const salt = await bcrypt.genSalt(10); // Générer un salt
  this.password = await bcrypt.hash(this.password, salt); // Hacher le mot de passe
  next();
});

// Méthode pour comparer le mot de passe entré avec celui en base
adminSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Admin", adminSchema);
