import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface IEkyc extends mongoose.Document{
    customerType:number,
    kycDocumentName:string,
    documentStatus:number,
    createDate:Date,
    updateDate:Date
};


export interface IEkycLimit extends mongoose.Document{
    userType:number,
    ekyctype:number,
    monthLimitAmount:number,
    dayLimitAmount:number,
    discraption:string,
    ruleApply: any,
    kycblocknotblobk:string,
    createDate:Date,
    updateDate:Date
};

export const EKycSchema=new Schema({
    customerType:{
        required:true,
        type:Number
    },
    kycDocumentName:{
        required:true,
        type:String
    },
    documentStatus:{
        type:Number,
        default:1
    },
    createDate: {
        type: Date,
        default: Date.now
     },
     updateDate:{
        type: Date,
        default: Date.now
     }
});
export const EKyclimitSchema=new Schema({
    userType:{
        required:true,
        type:Number
    },
    ekyctype:{
        required:true,
        type:Number
    },
    monthLimitAmount:{
        required:true,
        type:Number
    },
    dayLimitAmount:{
        required:true,
        type:Number
    },
    discraption:{
        type:String
    },
    ruleApply: Array,
    kycblocknotblobk:{
        type:String,
        required:true,
    },
    createDate: {
        type: Date,
        default: Date.now
     },
     updateDate:{
        type: Date,
        default: Date.now
     }
})

export interface ITransactionLimit extends mongoose.Document{
    customerType:number,
    ekyctype:number,
    selectruleApply: string,
    TransactionLimitSet:[{
        minAmount:{
            type:number,
            require:true
        },
        maxAmount:{
            type:number,
            require:true
        },
        transactionfee:{
            type:number,
            require:true
        }
    }],
    createDate:Date,
    updateDate:Date
};

export const TransactionLimit=new Schema({
    customerType:{
        required:true,
        type:Number
    },
    ekyctype:{
        required:true,
        type:Number
    },
    TransactionLimitSet:[{
        minAmount:{
            type:Number,
            require:true
        },
        maxAmount:{
            type:Number,
            require:true
        },
        transactionfee:{
            type:Number,
            require:true
        }
    }],
    createDate: {
        type: Date,
        default: Date.now
     },
     updateDate:{
        type: Date,
        default: Date.now
     }
});