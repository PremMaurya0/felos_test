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
var cashbackModel_1 = require("../models/cashbackModel");
var Cashback = mongoose.model('Cashback', cashbackModel_1.CashbackSchema);
var CashbackController = /** @class */ (function () {
    function CashbackController() {
    }
    CashbackController.prototype.createNewCashback = function (req, res) {
        // console.log(req.token);
        var cashback = new Cashback(req.body);
        if (cashback.cashbackType === 0 || cashback.cashbackType === undefined) {
            res.json({ message: "Select cashback Type!", error: true, success: false });
        }
        else if (cashback.DiscountType === 0 || cashback.DiscountType === undefined) {
            res.json({ message: "Select cashback Discount Type!", error: true, success: false });
        }
        else if (cashback.cashbackDiscountType === 0 || cashback.cashbackDiscountType === undefined) {
            res.json({ message: "Select cashback Discount Type!", error: true, success: false });
        }
        else if (cashback.cashbackCode === "" || cashback.cashbackCode === undefined) {
            res.json({ message: "Please Enter a cashback code!", error: true, success: false });
        }
        else if (cashback.startDate === "" || cashback.startDate === undefined) {
            res.json({ message: "Please choose a Start Date!", error: true, success: false });
        }
        else if (cashback.minAmount === 0 || cashback.minAmount === undefined) {
            res.json({ message: "Please Enter min Amount !", error: true, success: false });
        }
        else if (cashback.discountAmount === 0 || cashback.discountAmount === undefined) {
            res.json({ message: "Please Enter Discount Amount !", error: true, success: false });
        }
        else if (cashback.cashbackType === 2 && cashback.totalMember == 0 || cashback.cashbackType === 2 && cashback.totalMember === undefined) {
            res.json({ message: "Please Enter Total Group Member!", error: true, success: false });
        }
        else {
            if (cashback.expiredDate !== "NA") {
                var d1 = new Date(cashback.startDate);
                var d2 = new Date(cashback.expiredDate);
                var valid = d1 <= d2;
                if (!valid) {
                    res.json({ message: "Please Select a valid Date", error: true, success: false });
                }
                else {
                    cashback.save(function (err, result) {
                        if (err)
                            res.send(err);
                        res.json({ message: "Successfully created!", error: false, success: true, result: result });
                    });
                }
            }
            else {
                cashback.save(function (err, result) {
                    if (err)
                        res.send(err);
                    res.json({ message: "Successfully created!", error: false, success: true, result: result });
                });
            }
        }
    };
    CashbackController.prototype.cashbackList = function (req, res) {
        //  let coupon =new Coupons(req.body);
        var page = parseInt(req.body.page) || 1;
        var perPage = parseInt(req.body.perPage) || 10;
        Cashback.find().where().limit(perPage)
            .skip((perPage * page) - perPage).exec(function (err, listdata) {
            if (err)
                res.send(err);
            Cashback.find().countDocuments().exec(function (err, count) {
                res.json({ message: "Successfully!", error: false, success: true, listdata: listdata, counter: count });
            });
        });
    };
    return CashbackController;
}());
exports.CashbackController = CashbackController;
