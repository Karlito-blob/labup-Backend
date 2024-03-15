var express = require('express');
var router = express.Router();
//import connection data base
require('../models/connection');
const User = require('../models/users');
const initialPattern = require('../models/initialPattern');
const ModifiedPattern = require("../models/modifiedPattern");
const Document = require("../models/document");
//import module checkbody
const { checkbody } = require('../modules/checkbody');
//dependances pour upload cloudinary
const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const util = require('util');
const writeFileAsync = util.promisify(fs.writeFile);
const unlinkAsync = util.promisify(fs.unlink);

//route pour récuperer tous les documents d'un user en fonction de son token (IL FAUDRA PEUT ETRE SUPPRIMER LE POPULATE LIGNE 20 PAS SUR QUIL SOIT UTILE POUR UN SOUS-DOCUMENT) OK
router.get('/:token', async (req, res) => {
    try {
        const userData = await User.findOne({ token: req.params.token });

        if (!userData) {
            res.json({ result: false, message: "User token not found" });
            return;
        }

        const data = await Document.find({ user: userData._id }).populate('documentContent');

        if (data.length === 0) {
            res.json({ result: false, message: "User doesn't have any documents" });
        } else {
            res.json({ result: true, Documents: data });
        }
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
});

//route pour récuperer un document précis d'un user en fonction de son token et de l'id du document OK
router.get("/:token/:id", async (req, res) => {
    try {
        const userData = await User.findOne({ token: req.params.token });

        if (!userData) {
            res.json({ result: false, message: "User token not found" });
            return;
        }

        const data = await Document.findOne({ user: userData._id, _id: req.params.id }).populate('documentContent');

        if (!data) {
            res.json({ result: false, message: "Can't find this document" });
        } else {
            res.json({ result: true, Document: data });
        }
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
});

//router pour recuperer un document via son id 
router.get("/one/:id", async (req, res) => {
    try {
        const data = await Document.findOne({ _id: req.params.id })
        
        if (!data) {
            res.json({ result: false, message: "Can't find this document" });
        } else {
            res.json({ result: true, Document: data });
        }
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
});

//route pour la création d'un nouveau document pour un user en fct du token OK
router.post('/', async (req, res) => {
    try {
        if (!checkbody(req.body, ['token','fileName', 'documentContent', 'canvaParams'])) {
            throw new Error('Missing or empty fields');
        }

        const photoPath = `./tmp/${uniqid()}.png`;
        const resultMove = await writeFileAsync(photoPath, req.file.buffer);

        if (!resultMove) {
            try {
                const resultCloudinary = await cloudinary.uploader.upload(photoPath, {folder: 'documents'});

                await unlinkAsync(photoPath);

                const userData = await User.findOne({token: req.body.token});
                
                if (userData) {
                    const documentContent = JSON.parse(req.body.documentContent);
                    const canvaParams = JSON.parse(req.body.canvaParams);

                    const newDocument = new Document({
                        cloudinary_public_id: resultCloudinary.public_id,
                        user: userData._id,
                        fileName: req.body.fileName,
                        fileType: "Document",
                        creationDate: new Date(),
                        modificationDate: new Date(),
                        backgroudImage: req.body.backgroudImage,
                        documentContent: documentContent,
                        canvaParams: canvaParams,
                        documentImg: resultCloudinary.secure_url,
                        public: false
                    })
                    const newDoc = await newDocument.save()
                        res.json({result: true, newDoc})
                } else {
                    throw new Error('User token not found');
                } 
            } catch (error) {
                console.error('An error occurred:', error);
                return res.status(500).json({ result: false, error: 'Problem with Cloudinary upload or database operation'});
            }
        } else {
            await unlinkAsync(photoPath);
            throw new Error('Failed to move tmp file');
        }
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ result: false, error: error.message});
    }
});

//route pour update un pattern (il reste toujours dans son statut de "document"), pour le moment sans token car je nen vois pas l'utilité vu que chaque _id de document est unique sur Mongo...
//==================A TESTER EN LIVE//==================
//==================PAS CERTAIN DE L'UTILITE VU QUE VOUS VOULEZ GARDER TOUJOURS LES ANCIENNES MODIFS (TOUT PEUT ETRE FAIT UNIQUEMENT A LA REQUETE POST AU DESSUS//==================
router.put("/", async (req, res) => {
    try {
        if (!checkbody(req.body, ['fileName', 'fileType', 'documentContent', 'id'])) {
            throw new Error('Missing or empty fields');
          }

        const photoPath = `./tmp/${uniqid()}.png`;
        const resultMove = await writeFileAsync(photoPath, req.file.buffer);

        if (!resultMove) {
            try {
                const resultCloudinary = await cloudinary.uploader.upload(photoPath);

                await unlinkAsync(photoPath);

                const modifDoc = await Document.findOneAndUpdate({_id: req.body.id}, 
                    {fileName: req.body.fileName,
                        fileType: req.body.fileType,
                        modificationDate: new Date(),
                        documentContent: req.body.documentContent,
                        documentImg: resultCloudinary.secure_url})

                res.json({result: true, modifDoc})
            } catch (error) {
                console.error('An error occurred:', error);
                return res.status(500).json({ result: false, error: 'Problem with Cloudinary upload or database operation'});
            }
        } else {
            await unlinkAsync(photoPath);
            throw new Error("Failed to move tmp file")
        }
    } catch (error) {
        console.error('An error occurred:', error);
        return res.status(500).json({ result: false, error: error.message});
    }
})

//route delete UN document de la collection documents OK
router.delete("/:id", async (req, res) => {
    try {

        const data = await Document.findOne({ _id: req.params.id });

        resultCloudinary = await cloudinary.uploader.destroy(data.cloudinary_public_id)

        if (resultCloudinary.result === "ok") {
            await Document.deleteOne({ _id: data._id });
            res.json({ result: true, message: "Document deleted" });
        } else {
            res.json({ result: false, message: "Document not found" });
        }
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
});


module.exports = router;