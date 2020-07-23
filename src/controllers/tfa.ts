
import {  Response, Request } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import {  common,usertfa } from '../common';
let userTfavar:usertfa=new common();
export class TFAuth  {
        
    public tfaPostSetup(req:Request,res:Response){
        
        console.log(`DEBUG: Received TFA setup request`);
        //console.log(userTfavar.mobileNumber);
            userTfavar.mobileNumber=req.body.mobileNumber;
            const secret = speakeasy.generateSecret({
                length: 10,
                name:userTfavar.mobileNumber,
                issuer: 'NarenAuth v0.0'
            });
            console.log(secret);
            var url = speakeasy.otpauthURL({
                secret: secret.base32,
                label:"abc@gmail.com",
                issuer: 'NarenAuth v0.0',
                encoding: 'base32'
            });

            QRCode.toDataURL(url, (err, dataURL) => {
                userTfavar.tfa={
                    secret:'',
                    tempSecret:secret.base32,
                    dataURL,
                    tfaURL:url
                }
                return res.json({
                    message: 'TFA Auth needs to be verified',
                    tempSecret: secret.base32,
                    dataURL,
                    tfaURL: secret.otpauth_url
                });
            });


    }
    public tfaGetSetup(req:Request,res:Response){
            res.json(userTfavar.tfa ? userTfavar.tfa : null);
    }
    public tfaDeleteSetup(req:Request,res:Response){
        console.log(`DEBUG: Received DELETE TFA request`);
        delete userTfavar.tfa.tempSecret;
        res.send({
            "status": 200,
            "message": "success"
        });
    }
    public tfaverify(req:Request,res:Response){
        console.log(`DEBUG: Received TFA Verify request`);

    let isVerified = speakeasy.totp.verify({
        secret: userTfavar.tfa.tempSecret,
        encoding: 'base32',
        token: req.body.token
    });

    if (isVerified) {
        console.log(`DEBUG: TFA is verified to be enabled`);

        userTfavar.tfa.secret = userTfavar.tfa.tempSecret;
        return res.send({
            "status": 200,
            "message": "Two-factor Auth is enabled successfully"
        });
    }

    console.log(`ERROR: TFA is verified to be wrong`);

    return res.send({
        "status": 403,
        "message": "Invalid Auth Code, verification failed. Please verify the system Date and Time"
    });
    }
}