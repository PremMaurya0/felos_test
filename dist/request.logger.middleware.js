"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var requestLoggerMiddleware = function (req, res, next) {
    console.info(req.method + " " + req.originalUrl);
    var start = new Date().getTime();
    res.on('finish', function () {
        var elapsed = new Date().getTime() - start;
        var msg = req.method + " " + req.statictoken + " " + req.originalUrl + " " + res.statusCode + " " + elapsed + "ms";
        //console.info(msg);
    });
    next();
};
exports.requestLoggerMiddleware = requestLoggerMiddleware;
