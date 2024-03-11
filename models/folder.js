const mongoose = require('mongoose');

const folderSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    projectName: String,
    creationDate: Date,
    modificationDate: Date,
    patterns: [{ type: mongoose.Schema.Types.ObjectId, ref: "modifiedPatterns" }],
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "documents" }],
    exports: [{ type: mongoose.Schema.Types.ObjectId, ref: "exports" }],
    public: Boolean,
});

const Folder = mongoose.model('folders', folderSchema);

module.exports = Folder;
