import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

export const UserSchema=new Schema({
    firstname:{
        type:String,
        required:true
    },
    email: {
        type: String,
        unique: true,
        set: (value: any) => {return value.trim().toLowerCase()},
        validate: [
        (email)=> {
        return (email.match(/[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i) != null)},
        'Invalid email'
        ],
        required: 'Email address is required',
    },
    mobile:{
        type:String,
        required:true,
        minlength:10,
        maxlength:10,
    } ,
    IsLoginstatus:{
        type:Number
    },
    upassword:{
        type:String,
        required:true
    },
    token:{
        type:String,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now
     },
     updatedAt:{
        type: Date,
        default: Date.now
     }
});
