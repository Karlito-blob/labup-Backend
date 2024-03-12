var express = require('express');
var router = express.Router();
require('../models/connection');
const User = require("../models/users");
const ModifiedPattern = require("../models/modifiedPattern");
const Document = require("../models/document");
const Export = require("../models/export");

router.get("/:token", async (req, res) => {
    try {
        const userData = await User.findOne({ token: req.params.token });

        if (!userData) {
            res.json({ result: false, message: "User token not found" });
            return;
        }

        const aggregatedData = await ModifiedPattern.aggregate([
            {
                $match: { user: userData._id }
            },
            {
                $addFields: { image: "$patternImg" },
            },
            {
                $unionWith: {
                    coll: "documents",
                    pipeline: [
                        { $match: { user: userData._id } },
                        { $addFields: { image: "$documentImg" } },
                    ]
                }
            },
            {
                $unionWith: {
                    coll: "exports",
                    pipeline: [
                        { $match: { user: userData._id } },
                        { $addFields: { image: "$exportImg" }},
                    ]
                }
            }
        ]);

        res.json({ result: true, dashboardData: aggregatedData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des données." });
    }
});

module.exports = router;