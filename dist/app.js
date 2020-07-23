"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var bodyParser = __importStar(require("body-parser"));
var mongoose_1 = __importDefault(require("mongoose"));
var cors_1 = __importDefault(require("cors"));
var request_logger_middleware_1 = require("./request.logger.middleware");
var index_1 = require("./routes/index");
var App = /** @class */ (function () {
    function App() {
        this.app = express_1.default();
        this.routeUser = new index_1.UsersRoutes();
        this.routeCoupon = new index_1.CouponsRoutes();
        this.routeCashback = new index_1.CashbacksRoutes();
        this.routeCustomer = new index_1.CustomerRoutes();
        this.routeEkyc = new index_1.EkycRoutes();
        this.mongoUrl = 'mongodb://localhost:27017/angular7app';
        this.config();
        this.mongoSetup();
        this.routeUser.routes(this.app);
        this.routeCoupon.routes(this.app);
        this.routeCashback.routes(this.app);
        this.routeCustomer.routes(this.app);
        this.routeEkyc.routes(this.app);
    }
    App.prototype.config = function () {
        this.app.use(function (req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-with, Accept, Authorization');
            res.header('Access-Control-Allow-Methods', 'OPTIONS,GET, POST, PUT, DELETE');
            next();
        });
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        // serving static files 
        this.app.use(cors_1.default({
            exposedHeaders: ['X-Token', 'x-tfa', 'x-qrcodekey', 'x-site'],
        }));
        this.app.use(express_1.default.static('public'));
        this.app.use(express_1.default.static('KycDocument'));
        this.app.use(request_logger_middleware_1.requestLoggerMiddleware);
    };
    App.prototype.mongoSetup = function () {
        mongoose_1.default.Promise = global.Promise;
        mongoose_1.default.connect(this.mongoUrl, { useNewUrlParser: true, useFindAndModify: false });
        var cnn = mongoose_1.default.connection;
        cnn.on("connected", function (err, res) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("DataBase is Connected Successfully!");
            }
        });
        cnn.on("disconnected", function (err, res) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Disconnected Successfully!");
            }
        });
        cnn.on('error', console.error.bind(console, "Error Dedected!!!"));
        cnn.on('close', function () {
            console.log('close');
        });
        cnn.on('open', function () {
            console.log('open');
        });
        cnn.on('connecting', function () {
            console.log('connecting');
        });
        cnn.on('reconnected', function () {
            console.log('reconnected');
        });
    };
    return App;
}());
exports.default = new App().app;
