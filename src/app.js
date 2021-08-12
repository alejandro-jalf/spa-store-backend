const { inject ,errorHandler } = require("express-custom-error");
const { validateOrigin } = require("./middlewares");
const express = require("express");
const helmet = require('helmet');
const cors = require("cors");

inject();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({ origin: true }));

app.use("*", (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    next();
});

app.use(validateOrigin);

app.use(helmet());

app.use("*", (req, res, next) => {
    if (typeof req.body === "string") {
        req.body = JSON.parse(req.body);
    }
    next();
});

app.use("/", require("./router"));

app.use(errorHandler());
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "La ruta no existe"
    })
});

module.exports = app;
