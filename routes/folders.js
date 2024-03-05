var express = require('express');
var router = express.Router();
//import connection data base
require('../models/connection');
//import Models database
const User = require('../models/users');
const Folder = require("../models/folder")
//import module checkbody
const { checkbody } = require('../modules/checkbody');

//route pour récuperer tous les folders d'un user en fonction de son token (et dans un premier temps, à trier coté front pour récupérer UN folder précis, j'effacerai ce bout de commmentaire quand la route dédiée sera prête)
router.get('/:token', (req, res) => {
    User.findOne({token: req.params.token}).then(userData => {
        if(!data) {
            res.json({result: false, message: "user token not found"})
        } else {
            Folder.find({user: userData._id}).then(data => {
                if (data == []) {
                    res.json({result: false, message: "user don't have folders"})
                } else {
                    res.json({result : true, Folders : data})
                }
            })
        }
    })
});

//route pour la création d'un nouveau folder pour un user en fct du token
router.post('/', (req, res) => {
    if (!checkbody(req.body, ['token', 'projectName', "public"])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
    }
    User.findOne({token: req.body.token}).then(userData => {
        if (userData) {
            const newFolder = new Folder({
                user: userData._id,
                projectName: req.body.projectName,
                creationDate: new Date(),
                modificationDate: new Date(),
                patterns: [],
                documents: [],
                public: req.body.public,
            })
            newFolder.save().then(newDoc => {
                res.json({result: true, newDoc})
            })
        } else {
            res.json({result: false, message: "user token not found"})
        }
    })
})

//route pour ajouter un patternModif en clé étrangère à un Folder
router.put("/addPattern", async (req, res) => {
    try {
        const result = await Folder.findOneAndUpdate({_id: req.body.idFolder},{ $push: {patterns: req.body.idPattern}})
        console.log(result)
        result ? res.json({result: true, file: result}) : res.json({result: false, error: "no file found"})
    } catch (error) {
        console.error(error);
        res.json({ result: false, message: "An error occurred when updating the file" });
    }
})

//route pour ajouter un document en clé étrangère à un Folder
router.put("/addDocument", async (req, res) => {
    try {
        const result = await Folder.findOneAndUpdate({_id: req.body.idFolder},{ $push: {documents: req.body.idDocument}})
        console.log(result)
        result ? res.json({result: true, file: result}) : res.json({result: false, error: "no file found"})
    } catch (error) {
        console.error(error);
        res.json({ result: false, message: "An error occurred when updating the file" });
    }
})

//route pour delete un patternModif en clé étrangère d'un Folder
router.delete("/deletePattern", async (req, res) => {
    try {
        const result = await Folder.findOneAndUpdate({_id: req.body.idFolder},{ $pull: {patterns: req.body.idPattern}})
        console.log(result)
        result ? res.json({result: true, file: result}) : res.json({result: false, error: "no file found"})
    } catch (error) {
        console.error(error);
        res.json({ result: false, message: "An error occurred when updating the file" });
    }
})

//route pour delete un document en clé étrangère d'un Folder
router.delete("/deleteDocument", async (req, res) => {
    try {
        const result = await Folder.findOneAndUpdate({_id: req.body.idFolder},{ $pull: {documents: req.body.idDocument}})
        console.log(result)
        result ? res.json({result: true, file: result}) : res.json({result: false, error: "no file found"})
    } catch (error) {
        console.error(error);
        res.json({ result: false, message: "An error occurred when updating the file" });
    }
})

//route pour delete un Folder (ne détruit pas les documents/patternModifs originaux, juste leurs relation clé étrangère avec le Folder détruit)
router.delete("/:idFolder", async (req, res) => {
    try {
        const result = await Folder.findOneAndDelete({_id : req.params.idFolder})
        console.log(result)
        result ? res.json({result: true, file: result}) : res.json({result: false, error: "no file found"})
    } catch (error) {
        console.error(error);
        res.json({ result: false, message: "An error occurred when deleting the file" })
    }
})

module.exports = router;