"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = __importStar(require("mongoose"));
var testModel_1 = require("../models/testModel");
var Contact = mongoose.model('Contact', testModel_1.TestOneSchema);
var TestGController = /** @class */ (function () {
    function TestGController() {
    }
    TestGController.prototype.addNewContact = function (req, res) {
        var newContact = new Contact(req.body);
        newContact.save(function (err, contact) {
            if (err) {
                res.send(err);
            }
            res.json(contact);
        });
    };
    TestGController.prototype.getContacts = function (req, res) {
        Contact.find({}, function (err, contact) {
            if (err) {
                res.send(err);
            }
            res.json(contact);
        });
    };
    return TestGController;
}());
exports.TestGController = TestGController;
