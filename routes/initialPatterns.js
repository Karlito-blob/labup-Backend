var express = require('express');
var router = express.Router();
require('../models/connection');
const InitialPattern = require('../models/initialPattern');

// route permettant de récupérer tous les patterns initiaux pour le carrousel de sélection OK
router.get('/', async (req, res) => {
    try {
        const data = await InitialPattern.find({});
        
        if (data) {
            res.json({ result: true, InitialPatterns: data });
        } else {
            res.json({ result: false });
        }
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
});

// route permettant de récupérer un pattern initial OK
router.get('/:id', async (req, res) => {
    try {
        const data = await InitialPattern.findOne({ _id: req.params.id });
        
        if (data) {
            res.json({ result: true, InitialPattern: data });
        } else {
            res.json({ result: false });
        }
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
});

module.exports = router;
