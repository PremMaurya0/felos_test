import {Router} from "express";
import {CustomerController} from '../controllers/customerController';
import {common} from "../common";
import multer = require('multer');
import * as path from 'path';
 // Set The Storage Engine
 const storage = multer.diskStorage({
    destination: '../public/KycDocument/',
    filename: function(req, file, cb){
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
        // Init Upload
        const upload = multer({
        storage: storage, 
        limits: {
            fields: 1,
             files: 1,
              fileSize: 15000000
            },
            fileFilter:(req:any, file:any, cb:any) => {
            checkFileType(file, cb); 
        }
});
 // Check File Type
const checkFileType = (file:any, cb:any) => {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
    // Check mime
    //const filesize = filetypes.test(file.size);
 
    if(mimetype && extname){
      return cb(null,true);
    }
  
    else {
      cb('Error: Images Only!');
    }
  }


export class CustomerRoutes { 
    public customerController: CustomerController = new CustomerController();
    public routes(app: Router): void { 

           // Register New User
           app.route('/api/v1/registerCustomer').post(common.staticToken,this.customerController.addNewCustomer); 

           // Login User
           app.route('/api/v1/loginCustomer').post(common.staticToken,this.customerController.customerLogin); 

          // Setup TFA
          app.route('/api/v1/tfa/setup').post(common.userToken,this.customerController.tfaPostSetup); 
           // Setup TFA
           app.route('/api/v1/tfa/enabledsetup').post(common.userToken,this.customerController.tfatokengenerate); 

            // Get TFA User
           app.route('/api/v1/tfa/setup').get(common.userToken,this.customerController.tfaGetSetup);
          // Delete TFA
          app.route('/api/v1/tfa/setup').delete(common.userToken,this.customerController.tfaDeleteSetup); 
          //  Verify TFA
          app.route('/api/v1/tfa/verify').post(common.userToken,this.customerController.tfaverify);

          //  Email Varification
          app.route('/api/v1/email-verify').get(this.customerController.emailVerification);

          //  Add Bank Account
          app.route('/api/v1/addaccount').post(common.userToken,this.customerController.AddBankAccount); 
          //  Add Card Details
          app.route('/api/v1/addcard').post(common.userToken,this.customerController.AddCardAccount);
           //  List Card Details
           app.route('/api/v1/cardlist').get(common.userToken,this.customerController.AtmCardList);    

           //  Add KYC Details
           app.route('/api/v1/addekyc').post(common.userToken,upload.single("kycDocument"), this.customerController.AddKYCDocument);
           
            //  Add Fund in Wallet
            app.route('/api/v1/addfund').post(common.userToken, this.customerController.AddFundInWallet);

               //  Update Customer Detail
               app.route('/api/v1/updateCustomer').put(common.userToken, this.customerController.UpdateCustomer);
              
               //  Update Customer Profile
               app.route('/api/v1/updateprofile').put(common.userToken,upload.single("profilePic"), this.customerController.UpdateCustomerProfile);
      
               //  Customer Password Change
              app.route('/api/v1/customerChangePassword').put(common.userToken, this.customerController.changePassword);

               //  Customer 2 Customer in Wallet
               app.route('/api/v1/sendtowallet').post(common.userToken, this.customerController.Wallet2Wallet);

                 //  Customer QRcode Generate
                 app.route('/api/v1/customerQrcode').get(common.userToken, this.customerController.genQrCodeAccount);
                  //  Customer QRcode Generate
                  app.route('/api/v1/customerverifyQrcode').post(common.userToken, this.customerController.verifyQrCodeAccount);
                   //  Customer All List
                   app.route('/api/v1/customerfindall').get(common.userToken, this.customerController.customerAlllist);
                      //  Customer dingle detail
                      app.route('/api/v1/customerdetail').post(common.userToken, this.customerController.customersingleDetail);

                      //  Customer dingle detail
                      app.route('/api/v1/customertransactionhistory').get(common.userToken, this.customerController.CustomerTransactionHistory);
                      //  Customer dingle detail
                      app.route('/api/v1/customerSinglwuserhistory').post(common.userToken, this.customerController.customerTransaction);
                       //  Customer single detail
                       app.route('/api/v1/customerDetails').post(common.userToken, this.customerController.customerDetail);
                  //  Customer Recent Users
                       app.route('/api/v1/recentCustomer').get(common.userToken, this.customerController.recentUser);
                       //  Customer Graph Data
                       app.route('/api/v1/graph').post(common.userToken, this.customerController.graphData);
       
    }
}