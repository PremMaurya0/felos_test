"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UserController_1 = require("../controllers/UserController");
var UsersRoutes = /** @class */ (function () {
    function UsersRoutes() {
        this.userController = new UserController_1.UserController();
    }
    UsersRoutes.prototype.routes = function (app) {
        // Register New User
        app.route('/api/v1/newUser').post(this.userController.createUser);
        // Login User
        app.route('/api/v1/newlogin').post(this.userController.login);
        // Login Verify User
        app.route('/api/v1/loginVerified').post(this.userController.loginVerify);
    };
    return UsersRoutes;
}());
exports.UsersRoutes = UsersRoutes;
