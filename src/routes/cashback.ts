import {Router} from "express";
import {CashbackController} from '../controllers/cashbackController';
import {common} from "../common"
export class CashbacksRoutes { 
    public cashbackController: CashbackController = new CashbackController();
    public routes(app: Router): void { 
        // Register New User
        app.route('/api/v1/createCashback').post(this.cashbackController.createNewCashback); 
        app.route('/api/v1/CashbackList').post(this.cashbackController.cashbackList);
    }
}