
import model from '../models/User.js';
import { Webhook } from 'svix';

const clerkWebhooks = async (req, res) => {
    try{
        // create a new webhook instance with the secret
        const whook=new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        // getting Headers
        const headers={
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        };
        // verify the webhook
        await whook.verify(JSON.stringify(req.body), headers);
        //getting data from the request body
        const { data, type } = req.body;

        const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            username: data.first_name+" "+data.last_name,
            image: data.image_url,
    
        };
        // switch case for different  events
        switch(type){
            case 'user.created':
                // create a new user in the database
                await User.create(userData);
                break; 
            case 'user.updated':
                // update the user in the database
                await model.findByIdAndUpdate(data.id, userData);
                break;
            case 'user.deleted':
                // delete the user from the database
                await model.findByIdAndDelete(data.id);
                break;
            default:
                break
        }

        res.json({success: true, message:"webhook Recieved"});


        }catch (error) {
            console.log(error.message);
            res.json({ success: false, message: error.message });
        }
    };
    
    export default clerkWebhooks;