import * as mongoose from 'mongoose';
import { EKycSchema,EKyclimitSchema,IEkyc, IEkycLimit } from '../models/ekycModel';
import {  Response, Request } from 'express';
import jwt from "jsonwebtoken";
import {  common,usertfa } from '../common';
let userTfavar:usertfa=new common();
const EKyc = mongoose.model<IEkyc>('ekyc', EKycSchema);
const EKyclimit = mongoose.model<IEkycLimit>('ekyclimit', EKyclimitSchema);

export class eKycController {
    public createRequiredDocument(req:Request,res:Response){
      //  jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
          //  if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
           //  else{
        let kyc=new EKyc(req.body);
        if(kyc.customerType==0 || kyc.customerType==undefined){
            res.send({status:200,message:"Please enter Customer type"})
        } 
        else if(kyc.kycDocumentName=="" || kyc.kycDocumentName==undefined){
            res.send({status:200,message:"Please enter Document Name"})
        }else{
            kyc.save((err,result:IEkyc)=>{
                if(err) res.send(err);
                res.send({status:200,message:"Create Successfully!",data:result});
            })
        }
        // }
    // });
    }
    public ekycList(req: Request, res:Response): void
         {
            let kyc=new EKyc(req.body);
            EKyc.find({customerType:kyc.customerType},(err,listdata)=>{
                if(err)
                console.log(err);
                res.json({message:"Successfully!",error:false,success:true,listdata});
            })
         }
    
    public createKycLimit(req:Request,res:Response){
            //  jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
                //  if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
                 //  else{
              let kyclimit=new EKyclimit(req.body);
             // console.log(kyclimit);
              if(kyclimit.userType==0 || kyclimit.userType==undefined){
                  res.send({status:200,message:"Please select Customer type"});
              } 
              else if(kyclimit.ekyctype==0 || kyclimit.ekyctype==undefined){
                  res.send({status:200,message:"Please select Ekyc Type"});
              }
              else if(kyclimit.monthLimitAmount==0 || kyclimit.monthLimitAmount==undefined){
                res.send({status:200,message:"Please enter month limit amount"});
            }
            else if(kyclimit.dayLimitAmount==0 || kyclimit.dayLimitAmount==undefined){
                res.send({status:200,message:"Please enter day limit amount"});
            }
            else if(kyclimit.ruleApply.length==0 || kyclimit.ruleApply==undefined){
                res.send({status:200,message:"Please select Ekyc Type"});
            }
              else{
                kyclimit.save((err,result:IEkycLimit)=>{
                      if(err) res.send(err);
                      res.send({status:200,message:"Create Successfully!",data:result});
                  });
              }
              // }
          // });
     }

     public KycLimitList(req: Request, res:Response): void
          {
           
             var page = parseInt(req.body.page) ||1
             var perPage=parseInt(req.body.perPage) || 10;
 
             EKyclimit.find().where().limit(perPage)
             .skip((perPage * page) - perPage).exec((err,listdata)=>{
                 if(err) res.send(err);
                 EKyclimit.find().countDocuments().exec(function(err, count) {
                 res.json({message:"Successfully!",error:false,success:true, listdata, counter:count});
                 });
             });
     }
}