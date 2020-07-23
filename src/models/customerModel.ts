import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;
export interface ICustomer extends mongoose.Document{
    firstName:string,
    middeleName:string,
    lastName:string,
    profilePic:string,
    emailAddress:string,
    mobileNumber:string,
    userPassword:string,
    dateOfBirth:string,
    fromCounteryType:string,
    country:string,
    localityAddress:string,
    verifyEmail:number,
    offerAvalible:number,
    kycStatus:number,
    userQRCodeUrl:string,
    accountStatus:number,
    remainingAmount:number,
    currentLocation:string,
    jwtToken:string,
    loginStatus:number,
    enableTfa:number,
    createDate:Date,
    updateDate:Date
};
export const CustomerSchema=new Schema({

    firstName:{
        required:true,
        type:String,
    },
    middeleName:{
        type:String,
        default:"NA"
    },
    lastName:{
        type:String,
        default:"NA"
    },
    profilePic:{
        type:String,
        default:"NA"
    },
    emailAddress:{
        type:String,
        default:"abc@abc.com",
        set: (value: any) => {return value.trim().toLowerCase()},
        validate: [
        (email)=> {
        return (email.match(/[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i) != null)},
        'Invalid email'
        ],
    },
    mobileNumber:{
        required:true,
        type:String,
        unique: true,
        minlength:10,
        maxlength:10,
    },
    userPassword:{
        type:String
    },
    dateOfBirth:{
        type:String,
        default:"NA"
    },
    fromCounteryType:{
        type:String,
        default:"NA"
    },
    country:{
        type:String,
        default:"NA"
    },
    localityAddress:{
        type:String,
        default:"NA"
    },
    verifyEmail:{
        type:Number,
        default:0
    },
    offerAvalible:{
        type:Number,
        default:0
    },
    kycStatus:{
        type:Number,
        default:0
    },
    userQRCodeUrl:{
        type:String,
        default:"NA"
    },
    accountStatus:{
        type:Number,
        default:0
    },
    remainingAmount:{
        type:Number,
        default:0
    },
    currentLocation:{
        type:String,
        default:"NA"
    },
    jwtToken:{
        type:String,
        default:"NA"
    },
    loginStatus:{
        type:Number,
        default:0
    },
    enableTfa:{
        type:Number,
        default:0
    },
    createDate:{ 
        type: Date,
        default: Date.now
    },
    updateDate: {
        type: Date,
        default: Date.now
    }
})
export interface IKYC extends mongoose.Document{
    customerId:object,
    kycDocumentName:string,
    documentPath:string,
    verifyStatus:number,
    createDate:Date,
    updateDate:Date
};

export const eKYCSchema=new Schema({
    customerId:{
        type:Object,
        required:true
    },
    kycDocumentName:{
        type:String,
        required:true
    },
    documentPath:{
        type:String,
        required:true,
    },
    verifyStatus:{
        type:Number,
        required:true,
        default: 0
    }, 
    createDate:{ 
        type: Date,
        default: Date.now
    },
    updateDate: {
        type: Date,
        default: Date.now
    }
})


export interface IAtmCard extends mongoose.Document{
    customerId:object,
    cardType:string,
    cardholdername:string,
    cardNumber:string,
    card:string,
    expiredMonth:string,
    expiredYear:string,
    deleteStatus:number,
    createDate:Date,
    updateDate:Date
};

export const ATMCardSchema=new Schema({
    customerId:{
        type:Object,
        required:true
    },
    cardType:{
        type:String,
        required:true
    },
    cardholdername:{
        type:String,
        required:true,
    },
    cardNumber:{
        type:String,
        required:true,
    },
    card:{
        type:String,
        required:true,
        unique:true
    },
    expiredMonth:{
        type:String,
        required:true,
    },
    expiredYear:{
        type:String,
        required:true,

    },
    deleteStatus:{
        type:Number,
        default: 0
    },
 
    createDate:{ 
        type: Date,
        default: Date.now
    },
    updateDate: {
        type: Date,
        default: Date.now
    }
});


export interface IBankAccountDetails extends mongoose.Document{
    customerId:object,
    bankIFSC:string,
    bankName:string,
    bankAccount:string,
    account:string,
    accountType:string,
    bankBranch:string,
    bankMobileNumber:string,
    probility:number,
    deleteStatus:number,
    status:number,
    createDate:Date,
    updateDate:Date
};

export const BankAccountSchema=new Schema({
    customerId:{
        type:Object,
        required:true
    },
    bankIFSC:{
        type:String,
        required:true
    },
    bankName:{
        type:String,
        required:true
    },
    bankAccount:{
        type:String,
        required:true,
        unique:true
    },
    account:{
        type:String,
        required:true,
        unique:true
    },
    accountType:{
        type:String,
        required:true
    },
    bankBranch:{
        type:String,
        required:true
    },
    bankMobileNumber:{
        type:String,
        required:true
    },
    probility:{
        type:Number,
        default: 0
    },
    deleteStatus:{
        type:Number,
        default: 0
    },
    status:{
        type:Number,
        default: 0
    },
    createDate:{ 
        type: Date,
        default: Date.now
    },
    updateDate: {
        type: Date,
        default: Date.now
    }
});


export interface ICustomerAddFund extends mongoose.Document{
    customerId:object,
    felosTransationId:string,
    fundType:string,
    amount:number,
    fundstatus:number,
    accountNumber:string,
    bankTransactionId:string,
    currencyType:string,
    fundlocation:string,
    funddescription?:string,
    refundstatus:number,
    refunddescription?:string,
    createDate:Date,
    updateDate:Date
};
export const AddCustomerFundSchema=new Schema({
    customerId:{
        type:Object,
        required:true
    },
    felosTransationId:{
        type:String,
        required:true,
        unique:true
    },
    fundType:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    fundstatus:{
        type:Number,
        required:true,
       
    },
    accountNumber:{
        type:String,
        required:true,
    },
    bankTransactionId:{
        type:String,
        required:true,
        unique:true
    },
    currencyType:{
        type:String,
        required:true
    },
    fundlocation:{
        type:String,
        required:true
    },
    funddescription:{
        type:String
    },
    refundstatus:{
        type:Number,
        default:0
    },
    refunddescription:{
        type:String
    },
    createDate:{ 
        type: Date,
        default: Date.now
    },
    updateDate: {
        type: Date,
        default: Date.now
    }
});



export interface ICustomerTransactionHistory extends mongoose.Document{
    customerId:object,
    felosTransationId:string,
    transationType:string,
    toName:string,
    toURL:string,
    fundFromMobile:string,
    fundToMobile:string,
    amount:number,
    transactionstatus:number,
    netBalance:number,
    bankTransactionId:string,
    location:string,
    description?:string,
    createDate:Date,
    updateDate:Date
};

export const CustomerTransactionHistorySchema=new Schema({
    customerId:{
        type:Object,
        required:true
    },
    felosTransationId:{
        type:String,
        required:true
    },
    transationType:{
        type:String,
        required:true
    },
    toName:{
        type:String,
        required:true
    },
    toURL:{
        type:String,
        required:true
    },
    fundFromMobile:{
        type:String,
        required:true
    },
    fundToMobile:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true,
    },
    transactionstatus:{
        type:Number,
        required:true,
        default: 0
    }, 
    location:{
        type:String,
        required:true
    },
    description:{
        type:Number
    },
    createDate:{ 
        type: Date,
        default: Date.now
    },
    updateDate: {
        type: Date,
        default: Date.now
    }
});
