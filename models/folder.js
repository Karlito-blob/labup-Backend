const mongoose = require('mongoose');

const foldersSchema = mongoose.Schema({
    idUSer: String,
    projectName: string,
    creationDate: Date,
    modificationDate: Date,
    patterns: [{ type: mongoose.Schema.Types.ObjectId, ref: "modifiedPattern" }],
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "documents" }],
    public: Boolean,

});

const Folders = mongoose.model('folders', foldersSchema);

module.exports = Folders;
