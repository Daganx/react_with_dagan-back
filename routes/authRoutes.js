const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin"); // Assurez-vous que vous avez le modèle Admin
const router = express.Router();

// Route pour l'inscription (enregistrement d'un nouvel utilisateur)
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return res.status(400).json({ message: "Email already exists" });
  }

  // Créer un nouvel admin avec le modèle (le hachage se fait automatiquement)
  const newAdmin = new Admin({
    email,
    password, // Le modèle gère le hachage
  });

  try {
    const savedAdmin = await newAdmin.save();

    const token = jwt.sign({ id: savedAdmin._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
