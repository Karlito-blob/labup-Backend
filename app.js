require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const mongoose = require('mongoose');
require('./models/connection');

var usersRouter = require('./routes/users');
var initialPatternsRouter = require('./routes/initialPatterns');
var modifiedPatternsRouter = require('./routes/modifiedPatterns');
var documentsRouter = require("./routes/documents");
var exportsRouter = require("./routes/exports")
var foldersRouter = require("./routes/folders");
var fontsRouter = require("./routes/fonts");
var dashboardRouter = require("./routes/dashboard")

var app = express();

const cors = require('cors');
app.use(cors());

//middleware pour bodyoarser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

//middleware pour gestion des multiples forms data
var multer = require('multer');
var upload = multer();

app.use(express.static('public'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/initialPatterns', initialPatternsRouter);
app.use('/modifiedPatterns', upload.single('photoFromFront'), modifiedPatternsRouter);
app.use('/documents', upload.single('photoFromFront'), documentsRouter);
app.use("/exports", upload.single('photoFromFront'), exportsRouter);
app.use("/folders", foldersRouter);
app.use('/fonts', fontsRouter);
app.use('/dashboard', dashboardRouter);

module.exports = app;
