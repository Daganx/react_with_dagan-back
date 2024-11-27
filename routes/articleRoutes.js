const express = require("express");
const router = express.Router();
const Article = require("../models/Article");
const protect = require("../middleware/authMiddleware");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

// Configuration multer (stockage en mémoire)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Vérifier les types de fichiers acceptés
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Format de fichier non supporté"), false);
    }
  },
});

// Endpoints pour le CRUD des articles (Protect) //

// Créer un article avec image
router.post("/", protect, upload.array("images", 5), async (req, res) => {
  const { title, content, category } = req.body;

  try {
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      // Ajout de vérifications pour les fichiers
      const uploadFromBuffer = async (file) => {
        return new Promise((resolve, reject) => {
          if (!file.buffer || file.buffer.length === 0) {
            reject(new Error("Fichier invalide ou vide"));
            return;
          }

          cloudinary.uploader
            .upload_stream(
              {
                folder: "articles",
                resource_type: "auto",
                format: "jpg",
                transformation: [{ quality: "auto:good" }],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(file.buffer);
        });
      };

      // Upload toutes les images avec gestion d'erreur pour chaque fichier
      const uploadPromises = req.files.map((file) =>
        uploadFromBuffer(file).catch((err) => {
          console.error(
            `Erreur d'upload pour le fichier ${file.originalname}:`,
            err
          );
          return null;
        })
      );

      const results = await Promise.all(uploadPromises);
      imageUrls = results
        .filter((result) => result !== null)
        .map((result) => result.secure_url);
    }

    // Création de l'article uniquement si nous avons au moins une image valide
    if (imageUrls.length === 0) {
      return res
        .status(400)
        .json({ message: "Aucune image valide n'a été uploadée" });
    }

    const newArticle = await Article.create({
      title,
      content,
      category,
      images: imageUrls,
    });

    res.status(201).json(newArticle);
  } catch (err) {
    console.error("Erreur complète:", err);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de l'upload des images" });
  }
});

// Lire tous les articles (protégé)
router.get("/", protect, async (req, res) => {
  try {
    const articles = await Article.find();
    res.status(200).json(articles);
  } catch (err) {
    console.error(err); // Log de l'erreur pour le débogage
    res.status(500).json({ message: "Server error" });
  }
});

// Mettre à jour un article
router.put("/:id", protect, upload.array("images", 5), async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const existingImages = req.body.existingImages
      ? JSON.parse(req.body.existingImages)
      : [];

    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Mise à jour des champs de base
    article.title = title;
    article.content = content;
    article.category = category;

    // Mettre à jour la liste des images existantes
    article.images = existingImages;

    // Ajouter les nouvelles images si présentes
    if (req.files && req.files.length > 0) {
      const uploadFromBuffer = async (file) => {
        return new Promise((resolve, reject) => {
          if (!file.buffer || file.buffer.length === 0) {
            reject(new Error("Fichier invalide ou vide"));
            return;
          }

          cloudinary.uploader
            .upload_stream(
              {
                folder: "articles",
                resource_type: "auto",
                format: "jpg",
                transformation: [{ quality: "auto:good" }],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(file.buffer);
        });
      };

      const uploadPromises = req.files.map((file) =>
        uploadFromBuffer(file).catch((err) => {
          console.error(
            `Erreur d'upload pour le fichier ${file.originalname}:`,
            err
          );
          return null;
        })
      );

      const results = await Promise.all(uploadPromises);
      const newImageUrls = results
        .filter((result) => result !== null)
        .map((result) => result.secure_url);

      // Ajouter les nouvelles images aux images existantes
      article.images = [...article.images, ...newImageUrls];
    }

    const updatedArticle = await article.save();
    res.status(200).json(updatedArticle);
  } catch (err) {
    console.error("Erreur lors de la mise à jour:", err);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour" });
  }
});

// Supprimer un article
router.delete("/:id", protect, async (req, res) => {
  try {
    // Vérification de l'existence de l'article
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Suppression de l'article
    await Article.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Article deleted" });
  } catch (err) {
    console.error(err); // Log de l'erreur pour le débogage
    res.status(500).json({ message: "Server error" });
  }
});

// Route publique pour lire tous les articles (non protégée) et affichage public
router.get("/public", async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route publique pour récupérer un article spécifique
router.get("/public/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article non trouvé" });
    }
    res.status(200).json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
