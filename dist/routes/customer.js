"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var customerController_1 = require("../controllers/customerController");
var common_1 = require("../common");
var multer = require("multer");
var path = __importStar(require("path"));
// Set The Storage Engine
var storage = multer.diskStorage({
    destination: '../public/KycDocument/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
// Init Upload
var upload = multer({
    storage: storage,
    limits: {
        fields: 1,
        files: 1,
        fileSize: 15000000
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});
// Check File Type
var checkFileType = function (file, cb) {
    // Allowed ext
    var filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    var mimetype = filetypes.test(file.mimetype);
    // Check mime
    //const filesize = filetypes.test(file.size);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb('Error: Images Only!');
    }
};
var CustomerRoutes = /** @class */ (function () {
    function CustomerRoutes() {
        this.customerController = new customerController_1.CustomerController();
    }
    CustomerRoutes.prototype.routes = function (app) {
        // Register New User
        app.route('/api/v1/registerCustomer').post(common_1.common.staticToken, this.customerController.addNewCustomer);
        // Login User
        app.route('/api/v1/loginCustomer').post(common_1.common.staticToken, this.customerController.customerLogin);
        // Setup TFA
        app.route('/api/v1/tfa/setup').post(common_1.common.userToken, this.customerController.tfaPostSetup);
        // Setup TFA
        app.route('/api/v1/tfa/enabledsetup').post(common_1.common.userToken, this.customerController.tfatokengenerate);
        // Get TFA User
        app.route('/api/v1/tfa/setup').get(common_1.common.userToken, this.customerController.tfaGetSetup);
        // Delete TFA
        app.route('/api/v1/tfa/setup').delete(common_1.common.userToken, this.customerController.tfaDeleteSetup);
        //  Verify TFA
        app.route('/api/v1/tfa/verify').post(common_1.common.userToken, this.customerController.tfaverify);
        //  Email Varification
        app.route('/api/v1/email-verify').get(this.customerController.emailVerification);
        //  Add Bank Account
        app.route('/api/v1/addaccount').post(common_1.common.userToken, this.customerController.AddBankAccount);
        //  Add Card Details
        app.route('/api/v1/addcard').post(common_1.common.userToken, this.customerController.AddCardAccount);
        //  List Card Details
        app.route('/api/v1/cardlist').get(common_1.common.userToken, this.customerController.AtmCardList);
        //  Add KYC Details
        app.route('/api/v1/addekyc').post(common_1.common.userToken, upload.single("kycDocument"), this.customerController.AddKYCDocument);
        //  Add Fund in Wallet
        app.route('/api/v1/addfund').post(common_1.common.userToken, this.customerController.AddFundInWallet);
        //  Update Customer Detail
        app.route('/api/v1/updateCustomer').put(common_1.common.userToken, this.customerController.UpdateCustomer);
        //  Update Customer Profile
        app.route('/api/v1/updateprofile').put(common_1.common.userToken, upload.single("profilePic"), this.customerController.UpdateCustomerProfile);
        //  Customer Password Change
        app.route('/api/v1/customerChangePassword').put(common_1.common.userToken, this.customerController.changePassword);
        //  Customer 2 Customer in Wallet
        app.route('/api/v1/sendtowallet').post(common_1.common.userToken, this.customerController.Wallet2Wallet);
        //  Customer QRcode Generate
        app.route('/api/v1/customerQrcode').get(common_1.common.userToken, this.customerController.genQrCodeAccount);
        //  Customer QRcode Generate
        app.route('/api/v1/customerverifyQrcode').post(common_1.common.userToken, this.customerController.verifyQrCodeAccount);
        //  Customer All List
        app.route('/api/v1/customerfindall').get(common_1.common.userToken, this.customerController.customerAlllist);
        //  Customer dingle detail
        app.route('/api/v1/customerdetail').post(common_1.common.userToken, this.customerController.customersingleDetail);
        //  Customer dingle detail
        app.route('/api/v1/customertransactionhistory').get(common_1.common.userToken, this.customerController.CustomerTransactionHistory);
        //  Customer dingle detail
        app.route('/api/v1/customerSinglwuserhistory').post(common_1.common.userToken, this.customerController.customerTransaction);
        //  Customer single detail
        app.route('/api/v1/customerDetails').post(common_1.common.userToken, this.customerController.customerDetail);
        //  Customer Recent Users
        app.route('/api/v1/recentCustomer').get(common_1.common.userToken, this.customerController.recentUser);
        //  Customer Graph Data
        app.route('/api/v1/graph').post(common_1.common.userToken, this.customerController.graphData);
    };
    return CustomerRoutes;
}());
exports.CustomerRoutes = CustomerRoutes;
