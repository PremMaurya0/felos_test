import {Router} from "express";
import {UserController} from '../controllers/UserController';
export class UsersRoutes { 
    public userController: UserController = new UserController();
    public routes(app: Router): void { 
        // Register New User
        app.route('/api/v1/newUser').post(this.userController.createUser); 
        // Login User
        app.route('/api/v1/newlogin').post(this.userController.login);
         // Login Verify User
         app.route('/api/v1/loginVerified').post(this.userController.loginVerify); 

    }
}