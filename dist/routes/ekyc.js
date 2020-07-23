"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var eKycController_1 = require("../controllers/eKycController");
var EkycRoutes = /** @class */ (function () {
    function EkycRoutes() {
        this.ekycController = new eKycController_1.eKycController();
    }
    EkycRoutes.prototype.routes = function (app) {
        // Register New User
        app.route('/api/v1/ekycdocument').post(this.ekycController.createRequiredDocument);
        app.route('/api/v1/ekycdocumentList').post(this.ekycController.ekycList);
        app.route('/api/v1/ekycLimit').post(this.ekycController.createKycLimit);
        app.route('/api/v1/ekycLimitList').post(this.ekycController.KycLimitList);
    };
    return EkycRoutes;
}());
exports.EkycRoutes = EkycRoutes;
