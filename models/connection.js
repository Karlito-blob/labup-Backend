const mongoose = require('mongoose');

const connectionString = "mongodb+srv://theo:miaouss@cluster1.1gor5gb.mongodb.net/labup";

mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
    .then(() => console.log('Database connected'))
    .catch(error => console.error(error));
