var express = require('express');
var router = express.Router();
//import connection data base
require('../models/connection');
//import Models database
const User = require('../models/users');
const Folder = require("../models/folder")
//import module checkbody
const { checkbody } = require('../modules/checkbody');
const Folder = require('../models/folder');

router.get('/:token', (req, res) => {
    User.findOne({token: req.params.token}).then(data => {
        if(!data) {
            res.json({result: false, message: "user token not found"})
        } else {
            Folder.find({}).then(data => {
                if (data == []) {
                    res.json({result: false, message: "user don't have folders"})
                } else {
                    res.json({result : true, Folders : data})
                }
            })
        }
    })
});





module.exports = app;