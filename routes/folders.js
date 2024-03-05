var express = require('express');
var router = express.Router();
//import connection data base
require('../models/connection');
//import Models database
const User = require('../models/users');
const Folder = require("../models/folder")
//import module checkbody
const { checkbody } = require('../modules/checkbody');

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

router.post('/', (req, res) => {
    User.findOne({token: req.body.token}).then(data => {
        if (data) {
            const newFolder = new Folder({
                user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
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

module.exports = router;