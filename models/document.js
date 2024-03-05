const mongoose = require('mongoose');

const documentContentSchema = mongoose.Schema({
    zoneName: String,
    contenu: String,
    size: Number,
    font: String,
    color: String,
    posX: Number,
    posY: Number
})

const documentSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    fileName: String,
    fileType: String,
    creationDate: Date,
    modificationDate: Date,
    documentContent: [documentContentSchema],
    documentMiniature: String,

});

const Document = mongoose.model('documents', documentSchema);

module.exports = Document;
