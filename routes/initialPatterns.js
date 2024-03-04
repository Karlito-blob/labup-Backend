var express = require('express');
var router = express.Router();
require('../models/connection');
const InitialPattern = require('../models/initialPattern');

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
