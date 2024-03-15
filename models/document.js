const mongoose = require('mongoose');

// const documentContentSchema = mongoose.Schema({
//     valeur: String,
//     enGras: Boolean,
//     enItalique: Boolean,
//     tailleTexte: String,
//     alignementTexte: String,
//     textTransform: String,
//     fontFamily: String,
// })

const documentContentSchema = mongoose.Schema({
    inputValue: String,
    isBold: Boolean,
    isItalic: Boolean,
    isUnderline: Boolean,
    textTransform: String,
    textAlign: String,
    fontFamily: String,
    fontSize: String,
    color: String,
})

const canvaParamsSchema = mongoose.Schema({
    width: String,
    height: String,
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
    backgroudImage: String,
    documentImg: String,
    public: Boolean,
    like: [{type: mongoose.Schema.Types.ObjectId, ref: "users"}]
});

const Document = mongoose.model('documents', documentSchema);

module.exports = Document;
