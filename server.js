require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");

// Connexion à MongoDB
connectDB();

// Initialisation de l'application Express
const app = express();

// Configuration de CORS
const allowedOrigins = [
  "http://localhost:5173", // Frontend local
  "https://reactwithdagan.vercel.app", // Frontend déployé sur Vercel
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Autorise les cookies et autres credentials
  })
);

// Middleware pour parser les requêtes
app.use(bodyParser.json());

// Routes
const adminRoutes = require("./routes/adminRoutes");
const articleRoutes = require("./routes/articleRoutes");
const pingRoutes = require("./routes/pingRoutes");

app.use("/api/admin", adminRoutes); // Routes pour l'administration
app.use("/api/articles", articleRoutes); // Routes pour les articles
app.use("/api", pingRoutes); // Routes pour ping hibernate

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Middleware global pour gérer les erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Une erreur est survenue sur le serveur.",
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
