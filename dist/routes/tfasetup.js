"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tfa_1 = require("../controllers/tfa");
var TFARoutes = /** @class */ (function () {
    function TFARoutes() {
        this.tfauserController = new tfa_1.TFAuth();
    }
    TFARoutes.prototype.routes = function (app) {
        // Setup TFA
        app.route('/api/v1/tfa/setup').post(this.tfauserController.tfaPostSetup);
        // Get TFA User
        app.route('/api/v1/tfa/setup').get(this.tfauserController.tfaGetSetup);
        // Delete TFA
        app.route('/api/v1/tfa/setup').delete(this.tfauserController.tfaDeleteSetup);
        //  Verify TFA
        app.route('/api/v1/tfa/verify').post(this.tfauserController.tfaverify);
    };
    return TFARoutes;
}());
exports.TFARoutes = TFARoutes;
