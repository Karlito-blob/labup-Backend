var express = require('express');
var router = express.Router();
//import connection data base
require('../models/connection');
const User = require('../models/users');
const Document = require("../models/document");
//import module checkbody
const { checkbody } = require('../modules/checkbody');
//dependances pour upload cloudinary
const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

//route pour récuperer tous les documents d'un user en fonction de son token
router.get('/:token', (req, res) => {
    User.findOne({token: req.params.token}).then(userData => {
        if(!userData) {
            res.json({result: false, message: "user token not found"})
        } else {
            Document.find({user: userData._id}).populate('documentContent').then(data => {
                if (data == []) {
                    res.json({result: false, message: "user don't have  documents"})
                } else {
                    res.json({result : true, Documents : data})
                }
            })
        }
    })
});

//route pour récuperer un document précis d'un user en fonction de son token et de l'id du document
router.get("/:token/:id", (req, res) => {
    User.findOne({token: req.params.token}).then(userData => {
        if(!userData) {
            res.json({result: false, message: "user token not found"})
        } else {
            Document.findOne({and:[{user: userData._id}, {_id: req.params.id}]}).populate('documentContent').then(data => {
                if (!data) {
                    res.json({result: false, message: "can't find this document"})
                } else {
                    res.json({result : true, Document : data})
                }
            })
        }
    })
});

//route pour la création d'un nouveau document pour un user en fct du token
router.post('/', async (req, res) => {
    const photoPath = `./tmp/${uniqid()}.jpg`;
    const resultMove = await req.files.photoFromFront.mv(photoPath);
    
    if (!checkbody(req.body, ['token','fileName','fileType', 'documentContent'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
      }
    
    if(!resultMove) {
        try {
            const resultCloudinary = await cloudinary.uploader.upload(photoPath);

            fs.unlinkSync(photoPath);

            const userData = await User.findOne({token: req.body.token})
                if(userData) {
                const newDocument = new Document({
                    user: userData._id,
                    fileName: req.body.fileName,
                    fileType: req.body.fileType,
                    creationDate: new Date(),
                    modificationDate: new Date(),
                    documentContent: req.body.documentContent,
                    documentMiniature: resultCloudinary.secure_url,
                })
                const newDoc = await newDocument.save()
                    res.json({result: true, newDoc})
                } else {
                    res.json({result: false, message: "user token not found"})
                }
        } catch (error) {
            res.json({ result: false, error: error.message });
        }
    } else {
        res.json({ result: false, error: "Failed to move tmp file" });
    }
})

//route pour update un pattern (il reste toujours dans son statut de "document"), pour le moment sans token car je nen vois pas l'utilité vu que chaque _id de document est unique sur Mongo...
router.put("/", async (req, res) => {
    const photoPath = `./tmp/${uniqid()}.jpg`;
    const resultMove = await req.files.photoFromFront.mv(photoPath);
    
    if (!checkbody(req.body, ['fileName', 'fileType', 'documentContent', 'id'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
      }
    
    if(!resultMove) {
        try {
            const resultCloudinary = await cloudinary.uploader.upload(photoPath);

            fs.unlinkSync(photoPath);
    
            const modifDoc = await Document.findOneAndUpdate({_id: req.body.id}, [
                {fileName: req.body.fileName},
                {fileType: req.body.fileType},
                {modificationDate: new Date()},
                {documentContent: req.body.documentContent},
                {documentMiniature: resultCloudinary.secure_url}
            ])
            res.json({result: true, modifDoc})
        } catch (error) {
            res.json({ result: false, error: error.message });
        }
    } else {
        res.json({ result: false, error: "Failed to move tmp file" });
    }
})

//route delete UN document de la collection documents
router.delete("/", (req, res) => {
    if (!checkbody(req.body.id)) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
      }
    Document.findOne({_id: req.body.id}).then(data => {
        if(data) {
            Document.deleteOne({_id: data._id}).then(() => {
            res.json({result: true, message: "document delete"})
            })
        } else {
            res.json({result: false, message: "document not found"})
        }
    })
})

module.exports = router;