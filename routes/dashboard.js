var express = require('express');
var router = express.Router();
require('../models/connection');
const User = require("../models/users")
const ModifiedPattern = require("../models/modifiedPattern");
const Document = require("../models/document");
const Export = require("../models/export");

router.get("/:token", async (req, res) => {
    try {
        const userData = await User.findone({token: req.params.token})

        if (!userData) {
            res.json({ result: false, message: "User token not found" });
            return;
        }

        const dataFromModifiedPattern = await ModifiedPattern.find().toArray()
        const dataFromDocument = await Document.find().toArray()
        const dataFromExport = await Export.find().toArray()

        const aggregatedData = dataFromModifiedPattern.concat(dataFromDocument, dataFromExport);
        
        res.json({result: true, dashboardData: aggregatedData})
    } catch (error) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la récupération des données." });
    }
})

module.exports = router;