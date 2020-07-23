import {Response, Request,Router} from "express";
import {TFAuth} from '../controllers/tfa';
export class TFARoutes { 
    public tfauserController: TFAuth = new TFAuth();
    public routes(app: Router): void { 
        // Setup TFA
        app.route('/api/v1/tfa/setup').post(this.tfauserController.tfaPostSetup); 
        // Get TFA User
        app.route('/api/v1/tfa/setup').get(this.tfauserController.tfaGetSetup);
         // Delete TFA
         app.route('/api/v1/tfa/setup').delete(this.tfauserController.tfaDeleteSetup); 
          //  Verify TFA
          app.route('/api/v1/tfa/verify').post(this.tfauserController.tfaverify); 

    }
}