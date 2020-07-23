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
var couponModel_1 = require("../models/couponModel");
var Coupons = mongoose.model('Coupon', couponModel_1.CouponSchema);
var CouponController = /** @class */ (function () {
    function CouponController() {
    }
    CouponController.prototype.createNewCoupon = function (req, res) {
        var coupon = new Coupons(req.body);
        if (coupon.couponType === 0 || coupon.couponType === undefined) {
            res.json({ message: "Select coupon Type!", error: true, success: false });
        }
        else if (coupon.couponDiscountType === 0 || coupon.couponDiscountType === undefined) {
            res.json({ message: "Select coupon Discount Type!", error: true, success: false });
        }
        else if (coupon.couponCode === "" || coupon.couponCode === undefined) {
            res.json({ message: "Please Enter a coupon code!", error: true, success: false });
        }
        else if (coupon.startDate === "" || coupon.startDate === undefined) {
            res.json({ message: "Please choose a Start Date!", error: true, success: false });
        }
        else if (coupon.minAmount === 0 || coupon.minAmount === undefined) {
            res.json({ message: "Please Enter min Amount !", error: true, success: false });
        }
        else if (coupon.discountAmount === 0 || coupon.discountAmount === undefined) {
            res.json({ message: "Please Enter Discount Amount !", error: true, success: false });
        }
        else if (coupon.couponType === 2 && coupon.totalMember == 0 || coupon.couponType === 2 && coupon.totalMember === undefined) {
            res.json({ message: "Please Enter Total Group Member!", error: true, success: false });
        }
        else {
            if (coupon.expiredDate !== "NA") {
                var d1 = new Date(coupon.startDate);
                var d2 = new Date(coupon.expiredDate);
                var valid = d1 <= d2;
                if (!valid) {
                    res.json({ message: "Please Select a valid Date", error: true, success: false });
                }
                else {
                    coupon.save(function (err, result) {
                        if (err)
                            res.send(err);
                        res.json({ message: "Successfully created!", error: false, success: true, result: result });
                    });
                }
            }
            else {
                coupon.save(function (err, result) {
                    if (err)
                        res.send(err);
                    res.json({ message: "Successfully created!", error: false, success: true, result: result });
                });
            }
        }
    };
    CouponController.prototype.couponList = function (req, res) {
        //  let coupon =new Coupons(req.body);
        var page = parseInt(req.body.page) || 1;
        var perPage = parseInt(req.body.perPage) || 10;
        Coupons.find().where().limit(perPage)
            .skip((perPage * page) - perPage).exec(function (err, listdata) {
            if (err)
                res.send(err);
            Coupons.find().countDocuments().exec(function (err, count) {
                res.json({ message: "Successfully!", error: false, success: true, listdata: listdata, counter: count });
            });
        });
    };
    return CouponController;
}());
exports.CouponController = CouponController;
