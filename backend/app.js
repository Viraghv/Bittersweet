const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

require("dotenv").config();

const userRouter = require('./routes/userRouter');
const recipeRouter = require('./routes/recipeRouter');
const favouriteRouter = require('./routes/favouriteRouter');
const shoppingListRouter = require('./routes/shoppingListRouter');

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
app.use('/recipe', recipeRouter);
app.use('/favourite', favouriteRouter);
app.use('/shoppingList', shoppingListRouter);

module.exports = app;
