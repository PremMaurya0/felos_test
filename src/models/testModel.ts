import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const TestOneSchema = new Schema({
    firstName: {
        type: String,
        required: 'Enter a first name'
    },
    email: {
        type: String            
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});