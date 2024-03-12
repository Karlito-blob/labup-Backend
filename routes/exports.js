var express = require('express');
var router = express.Router();
//import connection data base
require('../models/connection');
const User = require('../models/users');
const initialPattern = require('../models/initialPattern');
const ModifiedPattern = require("../models/modifiedPattern");
const Document = require("../models/document");
const Export = require("../models/export");
//import module checkbody
const { checkbody } = require('../modules/checkbody');
//dependances pour upload cloudinary
const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const util = require('util');
const writeFileAsync = util.promisify(fs.writeFile);
const unlinkAsync = util.promisify(fs.unlink);

//route pour récuperer tous les exports d'un user en fonction de son token (IL FAUDRA PEUT ETRE SUPPRIMER LE POPULATE LIGNE 20 PAS SUR QUIL SOIT UTILE POUR UN SOUS-DOCUMENT MONGO) OK
router.get('/:token', async (req, res) => {
    try {
        const userData = await User.findOne({ token: req.params.token });

        if (!userData) {
            res.json({ result: false, message: "User token not found" });
            return;
        }

        const data = await Export.find({ user: userData._id });

        if (data.length === 0) {
            res.json({ result: false, message: "User doesn't have any exports" });
        } else {
            res.json({ result: true, Exports: data });
        }
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
});

//route pour récuperer un export précis d'un user en fonction de son token et de l'id de l'export OK
router.get("/:token/:id", async (req, res) => {
    try {
        const userData = await User.findOne({ token: req.params.token });

        if (!userData) {
            res.json({ result: false, message: "User token not found" });
            return;
        }

        const data = await Export.findOne({ user: userData._id, _id: req.params.id });

        if (!data) {
            res.json({ result: false, message: "Can't find this export" });
        } else {
            res.json({ result: true, Export: data });
        }
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
});

//route pour la création d'un nouveau export pour un user en fct du token OK
router.post('/', async (req, res) => {
    try {
        if (!checkbody(req.body, ['token','exportName','exportType'])) {
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

                    const newExport = new Export({
                        cloudinary_public_id: resultCloudinary.public_id,
                        user: userData._id,
                        fileName: req.body.exportName,
                        fileType: req.body.exportType,
                        creationDate: new Date(),
                        modificationDate: new Date(),
                        exportImg: resultCloudinary.secure_url,
                        public: false
                    })
                    const newDoc = await newExport.save()
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

//route delete UN export de la collection exports OK
router.delete("/:id", async (req, res) => {
    try {

        const data = await Export.findOne({ _id: req.params.id });

        resultCloudinary = await cloudinary.uploader.destroy(data.cloudinary_public_id)

        if (resultCloudinary.result === "ok") {
            await Export.deleteOne({ _id: data._id });
            res.json({ result: true, message: "Export deleted" });
        } else {
            res.json({ result: false, message: "Export not found" });
        }
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
});

module.exports = router;