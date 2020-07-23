import {Router} from "express";
import {CouponController} from '../controllers/couponController';

export class CouponsRoutes { 
    public couponController: CouponController = new CouponController();
    public routes(app: Router): void { 
        // Register New User
        app.route('/api/v1/createCoupon').post(this.couponController.createNewCoupon); 
        app.route('/api/v1/CouponList').post(this.couponController.couponList); 
        
       
    }
}