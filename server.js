require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");

// Connexion à MongoDB
connectDB();

// Initialisation de l'application Express
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const articleRoutes = require("./routes/articleRoutes");

app.use("/api/auth", authRoutes); // Routes pour l'authentification
app.use("/api/auth", adminRoutes); // Routes pour l'administration
app.use("/api/articles", articleRoutes); // Routes pour les articles

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
