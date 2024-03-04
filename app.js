require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

require('./models/connection');

var usersRouter = require('./routes/users');
var initialPatternsRouter = require('./routes/initialPatterns')
var modifiedPatternsRouter = require('./routes/initialPatterns')
var documentsRouter = require("./routes/documents")
var foldersRouter = require("./routes/folders")

var app = express();

const cors = require('cors');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/initialPatterns', initialPatternsRouter);
app.use('/modifiedPatterns', modifiedPatternsRouter);
app.use('/documents', documentsRouter);
app.use("/folders", foldersRouter)

module.exports = app;
