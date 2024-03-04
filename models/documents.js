const mongoose = require('mongoose');

const documentsSchema = mongoose.Schema({
    idUser: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
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
        posY: Number,
    }],

    URL_Cloudinary: String,

});

const Documents = mongoose.model('documents', documentsSchema);

module.exports = Documents;
