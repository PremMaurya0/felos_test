"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testController_1 = require("../controllers/testController");
var TestRoutes = /** @class */ (function () {
    function TestRoutes() {
        this.testgController = new testController_1.TestGController();
    }
    TestRoutes.prototype.routes = function (app) {
        app.route('/').get(function (req, res) {
            res.status(200).send({
                message: 'GET request successfulll!!!!'
            });
        });
        // Contact 
        app.route('/contact')
            .get(function (req, res, next) {
            // middleware
            console.log("Request from: " + req.originalUrl);
            console.log("Request type: " + req.method);
            if (req.query.key !== '78942ef2c1c98bf10fca09c808d718fa3734703e') {
                res.status(401).send('You shall not pass!');
            }
            else {
                next();
            }
        }, this.testgController.getContacts)
            // POST endpoint
            .post(this.testgController.addNewContact);
        // Contact 
        app.route('/contactList')
            .get(this.testgController.getContacts);
        // app.route('/contact/:contactId')
        // // get specific contact
        // .get(this.contactController.getContactWithID)
        // .put(this.contactController.updateContact)
        // .delete(this.contactController.deleteContact)
    };
    return TestRoutes;
}());
exports.TestRoutes = TestRoutes;
