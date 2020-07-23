import {Router} from "express";
import {eKycController} from '../controllers/eKycController';
import {common} from "../common"
export class EkycRoutes { 
    public ekycController: eKycController = new eKycController();
    public routes(app: Router): void { 

        // Register New User
        app.route('/api/v1/ekycdocument').post(this.ekycController.createRequiredDocument); 
        app.route('/api/v1/ekycdocumentList').post(this.ekycController.ekycList); 
        app.route('/api/v1/ekycLimit').post(this.ekycController.createKycLimit); 
        app.route('/api/v1/ekycLimitList').post(this.ekycController.KycLimitList); 
     
    }
}