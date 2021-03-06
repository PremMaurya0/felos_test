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
var Schema = mongoose.Schema;
;
exports.CouponSchema = new Schema({
    couponType: {
        required: true,
        type: Number
    },
    couponDiscountType: {
        required: true,
        type: Number
    },
    totalMember: Number,
    couponCode: {
        required: true,
        type: String,
        unique: true,
        set: function (value) { return value.trim().toLowerCase(); },
    },
    startDate: {
        required: true,
        type: String
    },
    expiredDate: {
        type: String,
        default: "NA"
    },
    minAmount: {
        required: true,
        type: Number
    },
    discountAmount: {
        required: true,
        type: Number
    },
    status: {
        required: true,
        type: Number,
        default: 1
    },
    couponSatus: {
        required: true,
        type: Number,
        default: 1
    },
    createDate: {
        type: Date,
        default: Date.now
    },
    updateDate: {
        type: Date,
        default: Date.now
    }
});
