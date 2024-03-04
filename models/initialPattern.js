const mongoose = require('mongoose');

const initalPatternSchema = mongoose.Schema({
    patternName: String,
    params: [{
        paramName: String,
        type: String,
        couleur: String,
        valeurInitiale: Number,
        valeurMin: Number,
        valeurMax: Number,
        active: Boolean,
    }]
});

const InitialPattern = mongoose.model('initialPatterns', initalPatternSchema);

module.exports = InitialPattern;
