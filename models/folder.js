const mongoose = require('mongoose');

const folderSchema = mongoose.Schema({
    idUSer: String,
    projectName: String,
    creationDate: Date,
    modificationDate: Date,
    patterns: [{ type: mongoose.Schema.Types.ObjectId, ref: "modifiedPatterns" }],
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "documents" }],
    public: Boolean,

});

const Folder = mongoose.model('folders', folderSchema);

module.exports = Folder;
