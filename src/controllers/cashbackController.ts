import * as mongoose from 'mongoose';
import { CashbackSchema, ICashback } from '../models/cashbackModel';
import {  Response, Request } from 'express';

const Cashback = mongoose.model<ICashback>('Cashback', CashbackSchema);

export class CashbackController {

        public createNewCashback (req: Request, res:Response):void { 
           // console.log(req.token);
         let cashback =new Cashback(req.body);
         if(cashback.cashbackType === 0 || cashback.cashbackType === undefined){
          res.json({message:"Select cashback Type!",error:true,success:false});
          } 
          else if(cashback.DiscountType === 0 || cashback.DiscountType === undefined){
            res.json({message:"Select cashback Discount Type!",error:true,success:false});
            } 
         else if(cashback.cashbackDiscountType === 0 || cashback.cashbackDiscountType === undefined){
            res.json({message:"Select cashback Discount Type!",error:true,success:false});
            }    
            else if(cashback.cashbackCode === ""|| cashback.cashbackCode === undefined){
                res.json({message:"Please Enter a cashback code!",error:true,success:false});
                }
                else if(cashback.startDate === ""|| cashback.startDate === undefined){
                    res.json({message:"Please choose a Start Date!",error:true,success:false});
                    }
                    else if(cashback.minAmount === 0|| cashback.minAmount === undefined){
                           res.json({message:"Please Enter min Amount !",error:true,success:false});
                        }
                        else if(cashback.discountAmount === 0|| cashback.discountAmount === undefined){    
                              res.json({message:"Please Enter Discount Amount !",error:true,success:false});
                          }
                         else if(cashback.cashbackType === 2 && cashback.totalMember == 0 || cashback.cashbackType === 2 && cashback.totalMember === undefined)
                         {   
                             res.json({message:"Please Enter Total Group Member!",error:true,success:false});
                            } 
                    else{   
                         if(cashback.expiredDate !== "NA"){       
                            let d1 = new Date(cashback.startDate);
                             let d2 = new Date(cashback.expiredDate);
                             let valid:boolean = d1 <= d2;
                              if (!valid){
                              res.json({message:"Please Select a valid Date",error:true,success:false});
                             }else{
                                cashback.save((err,result:ICashback)=>{
                                        if(err) res.send(err);
                                        res.json({message:"Successfully created!",error:false,success:true,result});
                                 });
                             }  
                        } else{
                            cashback.save((err,result:ICashback)=>{
                                if(err) res.send(err);
                                res.json({message:"Successfully created!",error:false,success:true,result});
                            });
                        }              
                 }
         }
         public cashbackList(req: Request, res:Response): void
         {
          //  let coupon =new Coupons(req.body);
            var page = parseInt(req.body.page) ||1
            var perPage=parseInt(req.body.perPage) || 10;

            Cashback.find().where().limit(perPage)
            .skip((perPage * page) - perPage).exec((err,listdata)=>{
                if(err) res.send(err);
                Cashback.find().countDocuments().exec(function(err, count) {
                res.json({message:"Successfully!",error:false,success:true, listdata, counter:count});
                });
            })
         }
}