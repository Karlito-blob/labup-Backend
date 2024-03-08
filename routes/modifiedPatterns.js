var express = require('express');
var router = express.Router();
//import connection data base
require('../models/connection');
//import Models database
const User = require('../models/users');
const initialPattern = require('../models/initialPattern');
const ModifiedPattern = require("../models/modifiedPattern");
//import module checkbody
const { checkbody } = require('../modules/checkbody');
//dependances pour upload cloudinary
const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const util = require('util');
const writeFileAsync = util.promisify(fs.writeFile);
const unlinkAsync = util.promisify(fs.unlink);


//route de test pour recuperer tous les modifiedPatterns de tous les users
router.get('/', async (req, res) => {
    try {
        const data = await ModifiedPattern.find({}).populate('initialPattern');
        
        if (data.length === 0) {
            res.json({ result: false, message: "Can't find modified patterns" });
        } else {
            res.json({ result: true, ModifiedPatterns: data });
        }
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
});

//route pour récuperer tous les modifiedPatterns d'un user en fonction de son token
router.get('/:token', async (req, res) => {
    try {
        const userData = await User.findOne({ token: req.params.token });
        
        if (!userData) {
            res.json({ result: false, message: "User token not found" });
            return;
        }

        const data = await ModifiedPattern.find({ user: userData._id }).populate('initialPattern');
        
        if (data.length === 0) {
            res.json({ result: false, message: "User doesn't have any modified patterns" });
        } else {
            res.json({ result: true, ModifiedPatterns: data });
        }
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
});

//route pour récuperer un modifiedPattern précis d'un user en fonction de son token et de l'id du modifiedPattern
router.get("/:token/:id", async (req, res) => {
    try {
        const userData = await User.findOne({ token: req.params.token });
        
        if (!userData) {
            res.json({ result: false, message: "User token not found" });
            return;
        }

        const data = await ModifiedPattern.findOne({ user: userData._id, _id: req.params.id }).populate('initialPattern');
        
        if (!data) {
            res.json({ result: false, message: "Can't find this pattern" });
        } else {
            res.json({ result: true, ModifiedPattern: data });
        }
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
});


//route pour la création d'un nouveau pattern modifié pour un user en fct du token
router.post('/', async (req, res) => {
    try {
        if (!checkbody(req.body, ['token','initialPattern','patternName', 'paramsModif', "fileName"])) {
            throw new Error('Missing or empty fields');
        }

        const photoPath = `./tmp/${uniqid()}.png`;
        const resultMove = await writeFileAsync(photoPath, req.file.buffer);

        if (!resultMove) {
            try {
                const resultCloudinary = await cloudinary.uploader.upload(photoPath);

                await unlinkAsync(photoPath);

                const userData = await User.findOne({token: req.body.token});
                
                if (userData) {
                    const newModifiedPattern = new ModifiedPattern({
                        user: userData._id,
                        initialPattern: req.body.initialPattern,
                        patternName: req.body.patternName,
                        paramsModif: req.body.paramsModif,
                        fileName: req.body.fileName,
                        creationDate: new Date(),
                        modificationDate: new Date(),
                        patternImg: resultCloudinary.secure_url,
                    });

                    const newDoc = await newModifiedPattern.save();
                    res.json({result: true, newDoc});
                } else {
                    throw new Error('User token not found');
                } 
            } catch (error) {
                throw new Error('Problem with Cloudinary upload or database operation');
            }
        } else {
            throw new Error('Failed to move tmp file');
        }
    } catch (error) {
        res.json({ result: false, error: error.message });
    }
});

//route pour update un pattern (il reste toujours dans son statut de "modifiedPattern"), pour le moment sans token car je nen vois pas l'utilité vu que chaque _id de pattern modif est unique sur Mongo...
router.put("/", async (req, res) => {
    try {
        if (!checkbody(req.body, ['paramsModif', "fileName", "id"])) {
            throw new Error('Missing or empty fields');
          }

        const photoPath = `./tmp/${uniqid()}.png`;
        const resultMove = await writeFileAsync(photoPath, req.file.buffer);
        
        if (!resultMove) {
            try {
                const resultCloudinary = await cloudinary.uploader.upload(photoPath);

                await unlinkAsync(photoPath);

                const modifDoc = await ModifiedPattern.findOneAndUpdate({_id: req.body.id}, 
                    {paramsModif: req.body.paramsModif,
                    fileName: req.body.fileName,
                    modificationDate: new Date(),
                    patternImg: resultCloudinary.secure_url})

                res.json({result: true, modifDoc})
            } catch (error) {
                throw new Error('Problem with Cloudinary upload or database operation');
            }
        } else {
            throw new Error("Failed to move tmp file")
        }
    } catch (error) {
        res.json({ result: false, error: error.message });
    }
})


// router.put("/", async (req, res) => {
//     const photoPath = `./tmp/${uniqid()}.jpg`;
//     const resultMove = await req.files.photoFromFront.mv(photoPath);
    
//     if (!checkbody(req.body, ['paramsModif', "fileName", "id"])) {
//         res.json({ result: false, error: 'Missing or empty fields' });
//         return;
//       }
    
//     if(!resultMove) {
//         try {
//             const resultCloudinary = await cloudinary.uploader.upload(photoPath);

//             fs.unlinkSync(photoPath);
    
//             const modifDoc = await ModifiedPattern.findOneAndUpdate({_id: req.body.id}, 
//                 {paramsModif: req.body.paramsModif,
//                 fileName: req.body.fileName,
//                 modificationDate: new Date(),
//                 patternImg: resultCloudinary.secure_url})
//             res.json({result: true, modifDoc})
//         } catch (error) {
//             res.json({ result: false, error: error.message });
//         }
//     } else {
//         res.json({ result: false, error: "Failed to move tmp file" });
//     }
// })

//route delete UN modifiedpattern de la collection modifiedPatterns
router.delete("/:id", async (req, res) => {
    try {
        const data = await ModifiedPattern.findOne({ _id: req.params.id });

        if (data) {
            await ModifiedPattern.deleteOne({ _id: data._id });
            res.json({ result: true, message: "ModifiedPattern deleted" });
        } else {
            res.json({ result: false, message: "ModifiedPattern not found" });
        }
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
});

module.exports = router;