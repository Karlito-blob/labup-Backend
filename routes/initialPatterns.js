var express = require('express');
var router = express.Router();
require('../models/connection');
const User = require('../models/users');
const InitialPattern = require('../models/initialPattern');
const ModifiedPattern = require("../models/modifiedPattern");

// route permettant de récupérer tous les patterns initiaux pour le carrousel de sélection
router.get('/', (req, res) => {
    InitialPattern.find({}).then(data => {
        if (data) {
            res.json({result : true , InitialPatterns: data})
        } else {
            res.json({result: false})
        }
    })
});

module.exports = router;
