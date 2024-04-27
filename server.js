const express = require("express");
const winston = require('winston');
const res = require("express/lib/response");
const app = express();

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'calculator_microservice' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

app.use((req, res, next) => {
    const oldWrite = res.write;
    const oldEnd = res.end;
    const chunks = [];

    res.write = function (chunk) {
        chunks.push(Buffer.from(chunk));
        oldWrite.apply(res, arguments);
    };

    res.end = function (chunk) {
        if (chunk) {
            chunks.push(Buffer.from(chunk));
        }
        const body = Buffer.concat(chunks).toString('utf8');

        logger.info(`Response for ${req.method} ${req.url}`, {
            requestBody: req.body,
            responseStatus: res.statusCode,
            responseBody: body
        });

        oldEnd.apply(res, arguments);
    };

    logger.info(`Incoming request ${req.method} ${req.url}`, {
        ip: req.ip,
        method: req.method,
        url: req.url,
        headers: req.headers
    });

    next();
});

const add = (n1, n2) => {
    return n1 + n2;
};
const subtract = (n1, n2) => {
    return n1 - n2;
}
const multiply = (n1, n2) => {
    return n1 * n2;
}
const divide = (n1, n2) => {
    if (n2 === 0) throw new Error("Cannot divide by zero");
    return n1 / n2;
};

const performOperation = (req, res, operation, operationName) => {
    try {
        // Log the request
        logger.info(`New ${operationName} operation requested: ${req.query.num1} ${operationName} ${req.query.num2}`);
        logger.info('Handling request', { route: req.path, query: req.query });
        const n1 = parseFloat(req.query.num1);
        const n2 = parseFloat(req.query.num2);

        if (isNaN(n1) || isNaN(n2)) {
            throw new Error("One or both numbers are incorrectly defined");
        }

        const result = operation(n1, n2);
        // Log the successful operation
        logger.info(`Operation successful: ${n1} ${operationName} ${n2} = ${result}`);
        res.status(200).json({ statuscode: 200, data: result });
    } catch (error) {
        // Log the error
        logger.error(error.message);
        console.log(error);
        res.status(500).json({ statuscode: 500, msg: error.toString() });
    }
};

// Addition endpoint
app.get("/add", (req, res) => {
    performOperation(req, res, add, "add");
});

// Subtraction endpoint
app.get("/subtract", (req, res) => {
    performOperation(req, res, subtract, "subtract");
});

// Multiplication endpoint
app.get("/multiply", (req, res) => {
    performOperation(req, res, multiply, "multiply");
});

// Division endpoint
app.get("/divide", (req, res) => {
    performOperation(req, res, divide, "divide");
});

const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route to serve the calculator HTML
app.get('/calculator', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
app.listen(port, () => {
    console.log(`listening to port ${port}`);
});