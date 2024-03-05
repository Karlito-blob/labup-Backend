var express = require('express');
var router = express.Router();
//import connection data base
require('../models/connection');
//import Models database
const User = require('../models/users');
const ModifiedPattern = require("../models/modifiedPattern");
//import module checkbody
const { checkbody } = require('../modules/checkbody');
//dependances pour upload cloudinary
const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');


//route pour récuperer tous les patterns d'un user en fonction de son token (et dans un premier temps, à trier coté front pour récupérer UN pattern modif, j'effacerai ce bout de commmentaire quand la route dédiée sera prête)
router.get('/:token', (req, res) => {
    User.findOne({token: req.params.token}).then(userData => {
        if(!userData) {
            res.json({result: false, message: "user token not found"})
        } else {
            ModifiedPattern.find({user: userData._id}).populate('initialPattern').then(data => {
                if (data == []) {
                    res.json({result: false, message: "user don't have modified patterns"})
                } else {
                    res.json({result : true, ModifiedPatterns : data})
                }
            })
        }
    })
});

//route pour la création d'un nouveau pattern modifié pour un user en fct du token
router.post('/', async (req, res) => {
    const photoPath = `./tmp/${uniqid()}.jpg`;
    const resultMove = await req.files.photoFromFront.mv(photoPath);
    
    if (!checkbody(req.body, ['token','initialPattern','patternName', 'paramsModif', "fileName"])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
      }
    
    if(!resultMove) {
        const resultCloudinary = await cloudinary.uploader.upload(photoPath);

        fs.unlinkSync(photoPath);

        User.findOne({token: req.body.token}).then(userData => {
            if (userData) {
                const newModifiedPattern = new ModifiedPattern({
                    user: userData._id,
                    initialPattern: req.body.initialPattern,
                    patternName: req.body.patternName,
                    paramsModif: req.body.paramsModif,
                    fileName: req.body.fileName,
                    creationDate: new Date(),
                    modificationDate: new Date(),
                    patternMiniature: resultCloudinary.secure_url,
                })
                newModifiedPattern.save().then(newDoc => {
                    res.json({result: true, newDoc})
                })
            } else {
                res.json({result: false, message: "user token not found"})
            }
        })    
    } else {
        res.json({ result: false, error: resultCopy });
    }
})

//route pour update un pattern (il reste toujours dans son statut de "modifiedPattern"), pour le moment sans token car je nen vois pas l'utilité vu que chaque _id de pattern modif est unique sur Mongo...
router.put("/", async (req, res) => {
    const photoPath = `./tmp/${uniqid()}.jpg`;
    const resultMove = await req.files.photoFromFront.mv(photoPath);
    
    if (!checkbody(req.body, ['paramsModif', "fileName", "id"])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
      }
    
    if(!resultMove) {
        const resultCloudinary = await cloudinary.uploader.upload(photoPath);

        fs.unlinkSync(photoPath);

        ModifiedPattern.findOneAndUpdate({_id: req.body.id}, [
            {paramsModif: req.body.paramsModif},
            {fileName: req.body.fileName},
            {modificationDate: new Date()},
            {patternMiniature: resultCloudinary.secure_url}
        ]).then(() => {
            ModifiedPattern.findOne({_id: req.body.id}).then(modifDoc => {
                res.json({result: true, modifDoc})
            })
        })
    } else {
        res.json({ result: false, error: resultCopy });
    }
})

//route delete UN modifiedpattern
router.delete("/", (req, res) => {
    if (!checkbody(req.body.id)) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
      }
    ModifiedPattern.findOne({_id: req.body.id}).then(data => {
        if(data) {
            ModifiedPattern.deleteOne({_id: data._id}).then(() => {
            res.json({result: true, message: "modifiedPattern delete"})
            })
        } else {
            res.json({result: false, message: "modifiedPattern not found"})
        }
    })
})

module.exports = router;