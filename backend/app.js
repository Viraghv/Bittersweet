const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const schedule = require('node-schedule');

require("dotenv").config();

// require used router files
const userRouter = require('./routes/userRouter');
const recipeRouter = require('./routes/recipeRouter');
const favouriteRouter = require('./routes/favouriteRouter');
const shoppingListRouter = require('./routes/shoppingListRouter');
const weeklyMenuRouter = require('./routes/weeklyMenuRouter');

const app = express();
app.use(cookieParser());

// set CORS options
let corsOptions = {
    origin: true,
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
    exposedHeaders: ["set-cookie", "sessionToken"],
}
app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// put used routers in app
app.use('/user', userRouter);
app.use('/recipe', recipeRouter);
app.use('/favourite', favouriteRouter);
app.use('/shoppingList', shoppingListRouter);
app.use('/weeklyMenu', weeklyMenuRouter);

const weeklyMenuService = require("./services/weeklyMenuService");
const userService = require("./services/userService");

// generate new weekly menu for every user on every Monday at 00:00
schedule.scheduleJob('0 0 * * MON', weeklyMenuService.generateWeeklyMenuScheduled);

// delete every unverified user created at least 15 minutes ago, executes every 15 minutes
schedule.scheduleJob('*/15 * * * *', userService.deleteOldUnverifiedUsers);

module.exports = app;
