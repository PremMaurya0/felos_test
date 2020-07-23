import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface ICashback extends mongoose.Document{
    cashbackType:number,
    DiscountType:number,
    cashbackDiscountType:number,
    totalMember:number,
    cashbackCode:string,
    startDate:string,
    expiredDate:string,
    minAmount:number,
    discountAmount:number,
    status:number,
    cashbackSatus:number,
    createDate:Date,
    updateDate:Date
};



export const CashbackSchema=new Schema({
    cashbackType:{
        required:true,
        type:Number
    },
    DiscountType:{
        required:true,
        type:Number  
    },
    cashbackDiscountType:{
        required:true,
        type:Number
    },
    totalMember:Number,
    cashbackCode:{
        required:true,
        type:String,
        unique: true,
        set: (value: any) => {return value.trim().toLowerCase()},
    },
    startDate:{
        required:true,
        type:String
    },
    expiredDate:{
        type:String,
        default: "NA"
    },
    minAmount:{
        required:true,
        type:Number
    },
    discountAmount:{
        required:true,
        type:Number
    },
    status:{
        required:true,
        type:Number,
        default: 1
    },
    cashbackSatus:{
        required:true,
        type:Number,
        default: 1
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