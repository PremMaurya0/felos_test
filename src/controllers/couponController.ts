import * as mongoose from 'mongoose';
import { CouponSchema, ICoupon } from '../models/couponModel';
import { Request, Response } from 'express';
const Coupons = mongoose.model<ICoupon>('Coupon', CouponSchema);

export class CouponController {

        public createNewCoupon (req: Request, res:Response):void { 

         let coupon =new Coupons(req.body);
         if(coupon.couponType === 0 || coupon.couponType === undefined){
          res.json({message:"Select coupon Type!",error:true,success:false});
          } 
         else if(coupon.couponDiscountType === 0 || coupon.couponDiscountType === undefined){
            res.json({message:"Select coupon Discount Type!",error:true,success:false});
            }    
            else if(coupon.couponCode === ""|| coupon.couponCode === undefined){
                res.json({message:"Please Enter a coupon code!",error:true,success:false});
                }
                else if(coupon.startDate === ""|| coupon.startDate === undefined){
                    res.json({message:"Please choose a Start Date!",error:true,success:false});
                    }
                    else if(coupon.minAmount === 0|| coupon.minAmount === undefined){
                           res.json({message:"Please Enter min Amount !",error:true,success:false});
                        }
                        else if(coupon.discountAmount === 0|| coupon.discountAmount === undefined){    
                              res.json({message:"Please Enter Discount Amount !",error:true,success:false});
                          }
                         else if(coupon.couponType === 2 && coupon.totalMember == 0 || coupon.couponType === 2 && coupon.totalMember === undefined)
                         {   
                             res.json({message:"Please Enter Total Group Member!",error:true,success:false});
                            } 
                    else{   
                         if(coupon.expiredDate !== "NA"){       
                            let d1 = new Date(coupon.startDate);
                             let d2 = new Date(coupon.expiredDate);
                             let valid:boolean = d1 <= d2;
                              if (!valid){
                              res.json({message:"Please Select a valid Date",error:true,success:false});
                             }else{
                                 coupon.save((err,result:ICoupon)=>{
                                        if(err) res.send(err);
                                        res.json({message:"Successfully created!",error:false,success:true,result});
                                 });
                             }  
                        } else{
                            coupon.save((err,result:ICoupon)=>{
                                if(err) res.send(err);
                                res.json({message:"Successfully created!",error:false,success:true,result});
                            });
                        }              
                 }
         }
         public couponList(req: Request, res:Response): void
         {
          //  let coupon =new Coupons(req.body);
            var page = parseInt(req.body.page) ||1
            var perPage=parseInt(req.body.perPage) || 10;

            Coupons.find().where().limit(perPage)
            .skip((perPage * page) - perPage).exec((err,listdata)=>{
                if(err) res.send(err);
                Coupons.find().countDocuments().exec(function(err, count) {
                res.json({message:"Successfully!",error:false,success:true,listdata, counter:count});
                });
            })
         }
}