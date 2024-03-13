const mongoose = require('mongoose');

const modifiedPatternSchema = mongoose.Schema({
    cloudinary_public_id: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, 
    initialPattern: { type: mongoose.Schema.Types.ObjectId, ref: "initialPatterns" },
    patternName: String,
    paramsModif: [{}],
    fileName: String,
    creationDate: Date,
    modificationDate: Date,
    patternImg: String,
    public: Boolean,
    like: [{type: mongoose.Schema.Types.ObjectId, ref: "users"}]

});

const ModifiedPattern = mongoose.model('modifiedPatterns', modifiedPatternSchema);

module.exports = ModifiedPattern;
