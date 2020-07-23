import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface ICoupon extends mongoose.Document{
    couponType:number,
    couponDiscountType:number,
    totalMember:number,
    couponCode:string,
    startDate:string,
    expiredDate:string,
    minAmount:number,
    discountAmount:number,
    status:number,
    couponSatus:number,
    createDate:Date,
    updateDate:Date
};


export const CouponSchema=new Schema({
    couponType:{
        required:true,
        type:Number
    },
    couponDiscountType:{
        required:true,
        type:Number
    },
    totalMember:Number,
    couponCode:{
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
    couponSatus:{
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