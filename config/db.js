const mongoose = require("mongoose");

// Connexion à la base de données MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1); // Quitte le processus si la connexion échoue
  }
};

module.exports = connectDB;
