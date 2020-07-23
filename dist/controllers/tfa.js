"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var speakeasy_1 = __importDefault(require("speakeasy"));
var qrcode_1 = __importDefault(require("qrcode"));
var common_1 = require("../common");
var userTfavar = new common_1.common();
var TFAuth = /** @class */ (function () {
    function TFAuth() {
    }
    TFAuth.prototype.tfaPostSetup = function (req, res) {
        console.log("DEBUG: Received TFA setup request");
        //console.log(userTfavar.mobileNumber);
        userTfavar.mobileNumber = req.body.mobileNumber;
        var secret = speakeasy_1.default.generateSecret({
            length: 10,
            name: userTfavar.mobileNumber,
            issuer: 'NarenAuth v0.0'
        });
        console.log(secret);
        var url = speakeasy_1.default.otpauthURL({
            secret: secret.base32,
            label: "abc@gmail.com",
            issuer: 'NarenAuth v0.0',
            encoding: 'base32'
        });
        qrcode_1.default.toDataURL(url, function (err, dataURL) {
            userTfavar.tfa = {
                secret: '',
                tempSecret: secret.base32,
                dataURL: dataURL,
                tfaURL: url
            };
            return res.json({
                message: 'TFA Auth needs to be verified',
                tempSecret: secret.base32,
                dataURL: dataURL,
                tfaURL: secret.otpauth_url
            });
        });
    };
    TFAuth.prototype.tfaGetSetup = function (req, res) {
        res.json(userTfavar.tfa ? userTfavar.tfa : null);
    };
    TFAuth.prototype.tfaDeleteSetup = function (req, res) {
        console.log("DEBUG: Received DELETE TFA request");
        delete userTfavar.tfa.tempSecret;
        res.send({
            "status": 200,
            "message": "success"
        });
    };
    TFAuth.prototype.tfaverify = function (req, res) {
        console.log("DEBUG: Received TFA Verify request");
        var isVerified = speakeasy_1.default.totp.verify({
            secret: userTfavar.tfa.tempSecret,
            encoding: 'base32',
            token: req.body.token
        });
        if (isVerified) {
            console.log("DEBUG: TFA is verified to be enabled");
            userTfavar.tfa.secret = userTfavar.tfa.tempSecret;
            return res.send({
                "status": 200,
                "message": "Two-factor Auth is enabled successfully"
            });
        }
        console.log("ERROR: TFA is verified to be wrong");
        return res.send({
            "status": 403,
            "message": "Invalid Auth Code, verification failed. Please verify the system Date and Time"
        });
    };
    return TFAuth;
}());
exports.TFAuth = TFAuth;
