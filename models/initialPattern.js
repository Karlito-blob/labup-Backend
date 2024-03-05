const mongoose = require('mongoose');

/*
paramName: String,
type: String,
couleur: String,
valeurInitiale: Number,
valeurMin: Number,
valeurMax: Number,
active: Boolean,
*/

const initalPatternSchema = mongoose.Schema({
    patternName: String,
    params: [{}],
    intialePatternMiniature: String
});

const InitialPattern = mongoose.model('initialPatterns', initalPatternSchema);

module.exports = InitialPattern;
