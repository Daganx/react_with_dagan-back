const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin"); // Le modèle Admin
const router = express.Router();

// Route pour la connexion via /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log("Admin not found for email:", email); // Log
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      console.log("Password mismatch for email:", email); // Log
      console.log("Entered password:", password); // Log
      console.log("Stored hash:", admin.password); // Log
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Login successful for email:", email); // Log
    res.status(200).json({ token });
  } catch (err) {
    console.error("Server error:", err); // Log erreur serveur
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
