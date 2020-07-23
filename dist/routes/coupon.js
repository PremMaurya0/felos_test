"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var couponController_1 = require("../controllers/couponController");
var CouponsRoutes = /** @class */ (function () {
    function CouponsRoutes() {
        this.couponController = new couponController_1.CouponController();
    }
    CouponsRoutes.prototype.routes = function (app) {
        // Register New User
        app.route('/api/v1/createCoupon').post(this.couponController.createNewCoupon);
        app.route('/api/v1/CouponList').post(this.couponController.couponList);
    };
    return CouponsRoutes;
}());
exports.CouponsRoutes = CouponsRoutes;
