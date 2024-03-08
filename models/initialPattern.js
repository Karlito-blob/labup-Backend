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

const initialPatternSchema = mongoose.Schema({
    patternName: String,
    params: [{}],
    intialePatternMiniature: String
});

const InitialPattern = mongoose.model('initialPatterns', initialPatternSchema);

module.exports = InitialPattern;
