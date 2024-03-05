const mongoose = require('mongoose');

/*
zoneName: String,
contenu: String,
size: Number,
font: String,
color: String,
posX: Number,
posY: Number,
*/

const documentSchema = mongoose.Schema({
    idUser: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    fileName: String,
    fileType: String,
    creationDate: Date,
    modificationDate: Date,
    documentContent: [{}],
    documentMiniature: String,

});

const Document = mongoose.model('documents', documentSchema);

module.exports = Document;
