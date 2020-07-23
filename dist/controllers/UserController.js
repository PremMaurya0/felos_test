"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = __importStar(require("mongoose"));
var UsersModel_1 = require("../models/UsersModel");
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var Users = mongoose.model('Users', UsersModel_1.UserSchema);
var speakeasy_1 = __importDefault(require("speakeasy"));
var qrcode_1 = __importDefault(require("qrcode"));
var UserController = /** @class */ (function () {
    function UserController() {
    }
    UserController.prototype.createUser = function (req, res) {
        var NewUser = new Users(req.body);
        if (NewUser.firstname === "" || NewUser.firstname === undefined) {
            res.json({ message: "Name is Required!", error: true, success: false });
        }
        else if (NewUser.email === "" || NewUser.email === undefined) {
            res.json({ message: "Email is Required!", error: true, success: false });
        }
        else if (NewUser.mobile === "" || NewUser.mobile === undefined) {
            res.json({ message: "Mobile is Required!", error: true, success: false });
        }
        else if (NewUser.upassword === "" || NewUser.upassword === undefined) {
            res.json({ message: "Password is Required!", error: true, success: false });
        }
        else {
            bcryptjs_1.default.genSalt(10, function (err, salt) {
                if (err)
                    res.send(err);
                bcryptjs_1.default.hash(NewUser.upassword, salt, function (err, hash) {
                    if (err)
                        res.send(err);
                    NewUser.IsLoginstatus = 0;
                    NewUser.token = 'NA';
                    NewUser.upassword = hash;
                    NewUser.save(function (err, user) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            res.json({ message: "Success", error: false, success: true, user: user });
                        }
                    });
                });
            });
        }
    };
    UserController.prototype.validateEmailFormat = function (email) {
        var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return re.test(email);
    };
    // QR Code Login Authentication
    UserController.prototype.login = function (req, res) {
        var UserCheck = new Users(req.body);
        var secret = speakeasy_1.default.generateSecret({ length: 20 });
        Users.findOne({ email: UserCheck.email }, function (err, result) {
            if (err)
                res.send(err);
            if (result) {
                bcryptjs_1.default.compare(UserCheck.upassword, result.upassword, function (err, isMatch) {
                    if (err)
                        throw err;
                    if (isMatch) {
                        //res.json({success:true, message:"Success Login!"});
                        var url_1 = speakeasy_1.default.otpauthURL({ secret: secret.base32, label: result.email, algorithm: 'sha512', issuer: 'Felos' });
                        qrcode_1.default.toDataURL(url_1, function (err, data_url) {
                            if (err)
                                res.send(err);
                            res.status(201).json({
                                secret: secret.base32,
                                token: speakeasy_1.default.totp({
                                    secret: secret.base32,
                                    encoding: 'base32',
                                }),
                                dataURL: data_url,
                                otpURL: url_1,
                                remaining: (30 - Math.floor((new Date().getTime() / 1000.0 % 30)))
                            });
                        });
                    }
                    else {
                        res.json({ success: false, message: "Password is wrong!" });
                    }
                });
            }
            else {
                res.json({ success: false, message: "Email Address is not registered!" });
            }
        });
    };
    UserController.prototype.loginVerify = function (req, res) {
        var verify = speakeasy_1.default.totp.verify({
            secret: req.body.secret,
            encoding: 'base32',
            token: req.body.token,
            window: 6
        });
        console.log(verify);
        if (verify) {
            Users.findOne({ email: req.body.email }, function (err, result) {
                if (err)
                    res.send(err);
                res.json({ success: true, error: false, message: "You are a verifyed!", data: result });
            });
        }
        else {
            res.json({ success: false, error: true, message: "You are not a verifyed!", data: null });
            res.json({ message: false });
        }
        //     res.json({
        //         valid:speakeasy.totp.verify({
        //           secret:req.body.secret,
        //           encoding:'base32',
        //           token:req.body.token,
        //           window:0
        //          })   
        //  });
    };
    return UserController;
}());
exports.UserController = UserController;
