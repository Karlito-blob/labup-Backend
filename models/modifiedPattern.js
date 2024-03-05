const mongoose = require('mongoose');

/*
paramName: String,
type: String,
couleur: String,
valeurInitiale: Number,
valeurMin: Number,
valeurMax: Number,
*/

const modifiedPatternSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, 
    initialPattern: { type: mongoose.Schema.Types.ObjectId, ref: "initalPatterns" },
    patternName: String,
    paramsModif: [{}],
    fileName: String,
    creationDate: Date,
    modificationDate: Date,
    patternMiniature: String,
});

const ModifiedPattern = mongoose.model('modifiedPatterns', modifiedPatternSchema);

module.exports = ModifiedPattern;
