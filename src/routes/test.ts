import {Request, Response, NextFunction, Router} from "express";
import { TestGController } from '../controllers/testController'

export class TestRoutes { 
    
    public testgController: TestGController = new TestGController() 
    
    public routes(app: Router): void {   
        
        app.route('/').get((req: Request, res: Response) => {            
            res.status(200).send({
                message: 'GET request successfulll!!!!'
            })
        });

        // Contact 
        app.route('/contact')
        .get((req: Request, res: Response, next: NextFunction) => {
            // middleware
            console.log(`Request from: ${req.originalUrl}`);
            console.log(`Request type: ${req.method}`);            
            if(req.query.key !== '78942ef2c1c98bf10fca09c808d718fa3734703e'){
                res.status(401).send('You shall not pass!');
            } else {
                next();
            }                        
        }, this.testgController.getContacts)        

        // POST endpoint
        .post(this.testgController.addNewContact);
        // Contact 
        app.route('/contactList')
        .get(this.testgController.getContacts);      
        
        // app.route('/contact/:contactId')
        // // get specific contact
        // .get(this.contactController.getContactWithID)
        // .put(this.contactController.updateContact)
        // .delete(this.contactController.deleteContact)
    }
}