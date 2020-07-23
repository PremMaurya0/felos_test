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
;
exports.EKycSchema = new Schema({
    customerType: {
        required: true,
        type: Number
    },
    kycDocumentName: {
        required: true,
        type: String
    },
    documentStatus: {
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
exports.EKyclimitSchema = new Schema({
    userType: {
        required: true,
        type: Number
    },
    ekyctype: {
        required: true,
        type: Number
    },
    monthLimitAmount: {
        required: true,
        type: Number
    },
    dayLimitAmount: {
        required: true,
        type: Number
    },
    discraption: {
        type: String
    },
    ruleApply: Array,
    kycblocknotblobk: {
        type: String,
        required: true,
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
;
exports.TransactionLimit = new Schema({
    customerType: {
        required: true,
        type: Number
    },
    ekyctype: {
        required: true,
        type: Number
    },
    TransactionLimitSet: [{
            minAmount: {
                type: Number,
                require: true
            },
            maxAmount: {
                type: Number,
                require: true
            },
            transactionfee: {
                type: Number,
                require: true
            }
        }],
    createDate: {
        type: Date,
        default: Date.now
    },
    updateDate: {
        type: Date,
        default: Date.now
    }
});
