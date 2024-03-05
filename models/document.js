const mongoose = require('mongoose');

const documentSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    fileName: String,
    fileType: String,
    creationDate: Date,
    modificationDate: Date,
    documentContent: [{
        zoneName: String,
        contenu: String,
        size: Number,
        font: String,
        color: String,
        posX: Number,
        posY: Number,}],
    documentMiniature: String,

});

const Document = mongoose.model('documents', documentSchema);

module.exports = Document;
