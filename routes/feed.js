var express = require('express');
var router = express.Router();
require('../models/connection');

const User = require('../models/users');

const ModifiedPattern = require("../models/modifiedPattern");
const Document = require("../models/document");
const Export = require("../models/export");


// Route get pour récupérer tous les fichiers en public et les exposer sur le feed
router.get('/', async (req, res) => {
    try {
        // Exécute les requêtes de manière concurrente avec peuplement de l'info utilisateur
        const [documentData, modifiedPatternData, exportData] = await Promise.all([
            Document.find({ public: true }).lean().populate('user', 'avatar userName'),
            ModifiedPattern.find({ public: true }).lean().populate('user', 'avatar userName'),
            Export.find({ public: true }).lean().populate('user', 'avatar userName'),
        ]);

        // Fonction pour structurer les données
        const formatData = (data, type, includePatternName = false) => data.map(item => {
            const formattedItem = {
                _id: item._id,
                images: item.documentImg || item.exportImg || item.patternImg,
                filename: item.fileName || item.exportName || item.patternName,
                user: {
                    avatar: item.user.avatar,
                    userName: item.user.userName,
                },
                creationDate: item.creationDate || item.creationDate || item.creationDate,
                modificationDate: item.modificationDate || item.modificationDate || item.modificationDate,
                type
            };

            if (includePatternName) {
                formattedItem.patternName = item.patternName;
            }

            return formattedItem;
        });

        // Structure les données récupérées
        const documentFormattedData = formatData(documentData, 'document');
        const modifiedPatternFormattedData = formatData(modifiedPatternData, 'modifiedPattern', true);
        const exportFormattedData = formatData(exportData, 'export');

        // Combine les données formattées en un seul tableau
        const combinedData = [...documentFormattedData, ...modifiedPatternFormattedData, ...exportFormattedData];

        res.json({ result: true, feed: combinedData });
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
});

// Route Put pour mettre a jour le staut de public 
router.put('/updatePublic/:type/:id/:public', async (req, res) => {
    const { type, id, public } = req.params;

    try {
        let model;

        // Détermine le modèle approprié en fonction du type
        switch (type) {
            case 'document':
                model = Document;
                break;
            case 'modifiedPattern':
                model = ModifiedPattern;
                break;
            case 'export':
                model = Export;
                break;
            default:
                return res.status(400).json({ result: false, message: 'Type non valide.' });
        }

        // Met à jour le document avec le nouveau statut public
        const updated = await model.findByIdAndUpdate(
            id,
            { public },
            { new: true } // Renvoie le document mis à jour
        );

        if (!updated) {
            return res.status(404).json({ result: false, message: 'Document non trouvé.' });
        }

        res.json({ result: true, updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: false, message: 'Erreur serveur.' });
    }
});

router.put('/updateLike/:type/:id/:token', async (req, res) => {
    const { type, id, token } = req.params;
    let model;
    try {
        const userData = await User.findOne({token: token})
        if (!userData) return res.status(400).json({ result: false, message: 'Token non valide.' });
        switch (type) {
            case 'document':
                model = Document;
                break;
            case 'modifiedPattern':
                model = ModifiedPattern;
                break;
            case 'export':
                model = Export;
                break;
            default:
                return res.status(400).json({ result: false, message: 'Type non valide.' });
        }
        const file = await model.findById(id)
        if (!file) return res.status(404).json({ result: false, message: 'Document non trouvé.' });
        const userLikedIndex = file.like.indexOf(userData._id)
        if (userLikedIndex === -1) {
            await file.updateOne({ $push: { like: userData._id } });
        } else {
            await file.updateOne({ $pull: { like: userData._id } });
        }
        res.status(200).json({ result: true, message: 'Like mis à jour avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: false, message: 'Erreur serveur.' });
    }
})

module.exports = router;