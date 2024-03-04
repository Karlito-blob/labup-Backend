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

//route pour récuperer tous les documents d'un user en fonction de son token (et dans un premier temps, à trier coté front pour récupérer UN document précis, j'effacerai ce bout de commmentaire quand la route dédiée sera prête)
router.get('/:token', (req, res) => {
    User.findOne({token: req.params.token}).then(data => {
        if(!data) {
            res.json({result: false, message: "user token not found"})
        } else {
            Document.find({}).then(data => {
                if (data == []) {
                    res.json({result: false, message: "user don't have  documents"})
                } else {
                    res.json({result : true, Documents : data})
                }
            })
        }
    })
});

//route pour la création d'un nouveau pattern modifié pour un user en fct du token
router.post('/', async (req, res) => {
    const photoPath = `./tmp/${uniqid()}.jpg`;
    const resultMove = await req.files.photoFromFront.mv(photoPath);
    
    if (!checkbody(req.body, ['token','fileName','fileType', 'documentContent'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
      }
    
    if(!resultMove) {
        const resultCloudinary = await cloudinary.uploader.upload(photoPath);

        fs.unlinkSync(photoPath);

        User.findOne({token: req.body.token}).then(data => {
            const newDocument = new Document({
                idUser: data._id,
                fileName: req.body.fileName,
                fileType: req.body.fileType,
                creationDate: new Date(),
                modificationDate: new Date(),
                documentContent: req.body.documentContent,
                documentMiniature: resultCloudinary.secure_url,
            })
            newDocument.save().then(newDoc => {
                res.json({result: true, newDoc})
            })
        })    
    } else {
        res.json({ result: false, error: resultCopy });
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
        const resultCloudinary = await cloudinary.uploader.upload(photoPath);

        fs.unlinkSync(photoPath);

        Document.findOneAndUpdate({_id: req.body.id}, [
            {fileName: req.body.fileName},
            {fileType: req.body.fileType},
            {modificationDate: new Date()},
            {documentContent: req.body.documentContent},
            {patternMiniature: resultCloudinary.secure_url}
        ]).then(() => {
            Document.findOne({_id: req.body.id}).then(modifDoc => {
                res.json({result: true, modifDoc})
            })
        })
    } else {
        res.json({ result: false, error: resultCopy });
    }
})

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