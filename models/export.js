const mongoose = require('mongoose');

const exportSchema = mongoose.Schema({
    cloudinary_public_id: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    fileName: String,
    fileType: String,
    creationDate: Date,
    modificationDate: Date,
    exportImg: String,
    public: Boolean
});

const Export = mongoose.model('exports', exportSchema);

module.exports = Export;