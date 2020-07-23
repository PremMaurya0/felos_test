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
var ekycModel_1 = require("../models/ekycModel");
var common_1 = require("../common");
var userTfavar = new common_1.common();
var EKyc = mongoose.model('ekyc', ekycModel_1.EKycSchema);
var EKyclimit = mongoose.model('ekyclimit', ekycModel_1.EKyclimitSchema);
var eKycController = /** @class */ (function () {
    function eKycController() {
    }
    eKycController.prototype.createRequiredDocument = function (req, res) {
        //  jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
        //  if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
        //  else{
        var kyc = new EKyc(req.body);
        if (kyc.customerType == 0 || kyc.customerType == undefined) {
            res.send({ status: 200, message: "Please enter Customer type" });
        }
        else if (kyc.kycDocumentName == "" || kyc.kycDocumentName == undefined) {
            res.send({ status: 200, message: "Please enter Document Name" });
        }
        else {
            kyc.save(function (err, result) {
                if (err)
                    res.send(err);
                res.send({ status: 200, message: "Create Successfully!", data: result });
            });
        }
        // }
        // });
    };
    eKycController.prototype.ekycList = function (req, res) {
        var kyc = new EKyc(req.body);
        EKyc.find({ customerType: kyc.customerType }, function (err, listdata) {
            if (err)
                console.log(err);
            res.json({ message: "Successfully!", error: false, success: true, listdata: listdata });
        });
    };
    eKycController.prototype.createKycLimit = function (req, res) {
        //  jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
        //  if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
        //  else{
        var kyclimit = new EKyclimit(req.body);
        // console.log(kyclimit);
        if (kyclimit.userType == 0 || kyclimit.userType == undefined) {
            res.send({ status: 200, message: "Please select Customer type" });
        }
        else if (kyclimit.ekyctype == 0 || kyclimit.ekyctype == undefined) {
            res.send({ status: 200, message: "Please select Ekyc Type" });
        }
        else if (kyclimit.monthLimitAmount == 0 || kyclimit.monthLimitAmount == undefined) {
            res.send({ status: 200, message: "Please enter month limit amount" });
        }
        else if (kyclimit.dayLimitAmount == 0 || kyclimit.dayLimitAmount == undefined) {
            res.send({ status: 200, message: "Please enter day limit amount" });
        }
        else if (kyclimit.ruleApply.length == 0 || kyclimit.ruleApply == undefined) {
            res.send({ status: 200, message: "Please select Ekyc Type" });
        }
        else {
            kyclimit.save(function (err, result) {
                if (err)
                    res.send(err);
                res.send({ status: 200, message: "Create Successfully!", data: result });
            });
        }
        // }
        // });
    };
    eKycController.prototype.KycLimitList = function (req, res) {
        var page = parseInt(req.body.page) || 1;
        var perPage = parseInt(req.body.perPage) || 10;
        EKyclimit.find().where().limit(perPage)
            .skip((perPage * page) - perPage).exec(function (err, listdata) {
            if (err)
                res.send(err);
            EKyclimit.find().countDocuments().exec(function (err, count) {
                res.json({ message: "Successfully!", error: false, success: true, listdata: listdata, counter: count });
            });
        });
    };
    return eKycController;
}());
exports.eKycController = eKycController;
