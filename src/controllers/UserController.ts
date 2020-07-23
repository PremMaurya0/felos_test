import * as mongoose from 'mongoose';
import { UserSchema } from '../models/UsersModel';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
const Users = mongoose.model<IUser>('Users', UserSchema);
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import jwt from "jsonwebtoken";
import {  common,usertfa } from '../common';
let userTfavar:usertfa=new common();

 interface IUser extends mongoose.Document{
    firstname:string,
    email:string,
    mobile:string,
    IsLoginstatus:number,
    upassword:string,
    token:string,
    createdAt:Date,
    updatedAt:Date
}

export class UserController {
   
    public createUser (req: Request, res:Response) { 
          let NewUser=new Users(req.body);
         if(NewUser.firstname === "" || NewUser.firstname === undefined){
            res.json({message:"Name is Required!",error:true,success:false});
            } 
            else if(NewUser.email === "" || NewUser.email === undefined){
            res.json({message:"Email is Required!",error:true,success:false});
            } 
            else if(NewUser.mobile === "" || NewUser.mobile === undefined){
                res.json({message:"Mobile is Required!",error:true,success:false});
            } 
            else if(NewUser.upassword === "" || NewUser.upassword === undefined){
                res.json({message:"Password is Required!",error:true,success:false});
            } 
            else{    
                 bcrypt.genSalt(10, function(err, salt) { 
                  if(err) res.send(err);
                      bcrypt.hash(NewUser.upassword, salt, (err, hash)=> {
                       if(err) res.send(err); 
                            NewUser.IsLoginstatus=0;
                            NewUser.token='NA'; 
                            NewUser.upassword= hash;                       
                            NewUser.save((err,user:IUser)=>{
                                if(err){
                                    res.send(err);
                                }else{
                                    res.json({message:"Success",error:false,success:true,user});
                                }
                         });
                    });
                });
            }
        }

    public validateEmailFormat(email:string){
        var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return re.test(email)
    }
     // QR Code Login Authentication
      
    public login(req:Request,res:Response){
         let UserCheck=new Users(req.body);
         let secret:any = speakeasy.generateSecret({length:20});
        Users.findOne({email:UserCheck.email},(err,result:IUser)=>{
            if(err) res.send(err);
            if(result){
                bcrypt.compare(UserCheck.upassword, result.upassword, (err, isMatch)=> {
                    if(err) throw err;
                    if(isMatch){
                       

                        jwt.sign({user:result.firstname},userTfavar.singleTokenSecret,(err:any,token:any)=>{                         
                            res.setHeader('X-Token',token);
                             res.setHeader('Content-Type', 'application/x-www-form-urlencoded');
                             return res.status(200).json({
                                message: "success without enabled TFA",
                                data:result.firstname,
                                tfaenabled:1,
                                status:200
                       });
                        })

                        // let url = speakeasy.otpauthURL({ secret: secret.base32, label: result.email, algorithm: 'sha512',issuer: 'Felos' });
                        //  QRCode.toDataURL(url, (err:any, data_url:any)=>{
                        //      if(err) res.send(err);
                        //      res.status(200).json({
                        //        secret:secret.base32,
                        //        token:speakeasy.totp({
                        //          secret:secret.base32,
                        //          encoding:'base32',
                        //         }),
                        //         dataURL: data_url,
                        //         otpURL: url,
                        //         status:200,
                        //        remaining:(30-Math.floor((new Date().getTime() / 1000.0 % 30)))
                        //   });
                         
                        //});
                    }
                    else{
                        res.json({success:false, message:"Password is wrong!",status:401});
                    }
                });

            }else{
             res.json({success:false,message:"Email Address is not registered!",status:401});             
            }
        })
    }
    public loginVerify(req:Request,res:Response){
        let verify= speakeasy.totp.verify({
            secret:req.body.secret,
            encoding:'base32',
            token:req.body.token,
            window:6
           })
           console.log(verify);
           if(verify){
                Users.findOne({email:req.body.email},(err, result:IUser) => {
                    if(err) res.send(err);
                    res.json({success:true, error:false, message:"You are a verifyed!", data:result});
                });

           }else{
               
            res.json({success:false, error:true, message:"You are not a verifyed!", data:null});
            res.json({message:false});
            
           }
    //     res.json({
    //         valid:speakeasy.totp.verify({
    //           secret:req.body.secret,
    //           encoding:'base32',
    //           token:req.body.token,
    //           window:0
    //          })   
    //  });
    }
   
}

