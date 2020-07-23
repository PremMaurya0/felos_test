"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cashbackController_1 = require("../controllers/cashbackController");
var CashbacksRoutes = /** @class */ (function () {
    function CashbacksRoutes() {
        this.cashbackController = new cashbackController_1.CashbackController();
    }
    CashbacksRoutes.prototype.routes = function (app) {
        // Register New User
        app.route('/api/v1/createCashback').post(this.cashbackController.createNewCashback);
        app.route('/api/v1/CashbackList').post(this.cashbackController.cashbackList);
    };
    return CashbacksRoutes;
}());
exports.CashbacksRoutes = CashbacksRoutes;
