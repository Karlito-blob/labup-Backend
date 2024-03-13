const mongoose = require('mongoose');

const exportSchema = mongoose.Schema({
    cloudinary_public_id: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    fileName: String,
    fileType: String,
    format: String,
    creationDate: Date,
    modificationDate: Date,
    exportImg: String,
    public: Boolean,
    like: [{type: mongoose.Schema.Types.ObjectId, ref: "users"}]
});

const Export = mongoose.model('exports', exportSchema);

module.exports = Export;