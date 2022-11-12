const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

require("dotenv").config();

const userRouter = require('./routes/userRouter');

const app = express();

app.use(cookieParser());

let corsOptions = {
    origin: process.env.CLIENT_REQUEST_URL,
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
    exposedHeaders: ["set-cookie", "sessionToken"],
}

app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.use('/user', userRouter);

module.exports = app;
