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


//route de test pour recuperer tous les modifiedPatterns de tous les users
router.get('/', (req, res) => {
        ModifiedPattern.find({}).populate('initialPattern').then(data => {
            if (data.length === 0) {
                res.json({result: false, message: "can't find modified patterns"})
            } else {
                res.json({result : true, ModifiedPatterns : data})
            }
        })
    }
)

//route pour récuperer tous les modifiedPatterns d'un user en fonction de son token
router.get('/:token', (req, res) => {
    User.findOne({token: req.params.token}).then(userData => {
        if(!userData) {
            res.json({result: false, message: "user token not found"})
        } else {
            ModifiedPattern.find({user: userData._id}).populate('initialPattern').then(data => {
                if (data.length === 0) {
                    res.json({result: false, message: "user don't have any modified patterns"})
                } else {
                    res.json({result : true, ModifiedPatterns : data})
                }
            })
        }
    })
});

//route pour récuperer un modifiedPattern précis d'un user en fonction de son token et de l'id du modifiedPattern
router.get("/:token/:id", (req, res) => {
    User.findOne({token: req.params.token}).then(userData => {
        if(!userData) {
            res.json({result: false, message: "user token not found"})
        } else {
            ModifiedPattern.findOne({user: userData._id, _id: req.params.id}).populate('initialPattern').then(data => {
                if (!data) {
                    res.json({result: false, message: "can't find this pattern"})
                } else {
                    res.json({result : true, ModifiedPattern : data})
                }
            })
        }
    })
});

//route pour la création d'un nouveau pattern modifié pour un user en fct du token
router.post('/', async (req, res) => {
    try {
        console.log(req.file);
        console.log(req.body.token)
        res.json({ result: true, error: "YES" });
    } catch (error) {
        res.json({ result: false, error: "MERDE" });
    }
    
    // if (!checkbody(req.body, ['token','initialPattern','patternName', 'paramsModif', "fileName"])) {
    //     res.json({ result: false, error: 'Missing or empty fields' });
    //     return;
    // }

    const photoPath = `./tmp/${uniqid()}.png`;
    //const resultMove = await req.file.photoFromFront.mv(photoPath);
    const resultMove = await req.file.mv(photoPath);
    
    if(!resultMove) {
        try {
            const resultCloudinary = await cloudinary.uploader.upload(photoPath);
        } catch (error) {
            res.json({ result: false, error: "probl upload cloudinary" });
        }
        try {
            fs.unlinkSync(photoPath);
            const userData = await User.findOne({token: req.body.token})
                if (userData) {
                    const newModifiedPattern = new ModifiedPattern({
                        user: userData._id,
                        initialPattern: req.files.initialPattern,
                        patternName: req.body.patternName,
                        paramsModif: req.body.paramsModif,
                        fileName: req.body.fileName,
                        creationDate: new Date(),
                        modificationDate: new Date(),
                        patternImg: resultCloudinary.secure_url,
                    })
                    const newDoc = await newModifiedPattern.save()
                        res.json({result: true, newDoc})
                } else {
                    res.json({result: false, message: "user token not found"})
                } 
        } catch (error) {
            res.json({ result: false, error: "problem fs or newDoc" });
        }
    } else {
        res.json({ result: false, error: "Failed to move tmp file" });
    }
});

//route pour update un pattern (il reste toujours dans son statut de "modifiedPattern"), pour le moment sans token car je nen vois pas l'utilité vu que chaque _id de pattern modif est unique sur Mongo...
router.put("/", async (req, res) => {
    const photoPath = `./tmp/${uniqid()}.jpg`;
    const resultMove = await req.files.photoFromFront.mv(photoPath);
    
    if (!checkbody(req.body, ['paramsModif', "fileName", "id"])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
      }
    
    if(!resultMove) {
        try {
            const resultCloudinary = await cloudinary.uploader.upload(photoPath);

            fs.unlinkSync(photoPath);
    
            const modifDoc = await ModifiedPattern.findOneAndUpdate({_id: req.body.id}, 
                {paramsModif: req.body.paramsModif,
                fileName: req.body.fileName,
                modificationDate: new Date(),
                patternImg: resultCloudinary.secure_url})
            res.json({result: true, modifDoc})
        } catch (error) {
            res.json({ result: false, error: error.message });
        }
    } else {
        res.json({ result: false, error: "Failed to move tmp file" });
    }
})

//route delete UN modifiedpattern de la collection modifiedPatterns
router.delete("/:id", (req, res) => {
    ModifiedPattern.findOne({_id: req.params.id}).then(data => {
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