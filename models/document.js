const mongoose = require('mongoose');

const documentContentSchema = mongoose.Schema({
    valeur: String,
    enGras: Boolean,
    enItalique: Boolean,
    tailleTexte: String,
    alignementTexte: String,
    textTransform: String,
    fontFamily: String,
})

const canvaParamsSchema = mongoose.Schema({
    width: Number,
    height: Number,
    justifyContent: String,
    padding: Number,
})

const documentSchema = mongoose.Schema({
    cloudinary_public_id: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    fileName: String,
    fileType: String,
    creationDate: Date,
    modificationDate: Date,
    documentContent: [documentContentSchema],
    canvaParams: canvaParamsSchema,
    documentImg: String,
    public: Boolean
});

const Document = mongoose.model('documents', documentSchema);

module.exports = Document;
