import { Router } from 'express';
import {customAuth} from '../middleware/auth.js'
import { upload, cleanPath } from '../utils.js';
import { UsersController } from '../controller/usersController.js';

export const router=Router();

router.get('/', customAuth(["admin"]), UsersController.getAllUsers)
router.get('/:uid', customAuth(["admin"]), UsersController.getUserById)
//pendiente METER EL AUTH a este
router.post('/:uid/documents',customAuth(["premium"]), upload.single("upload"),UsersController.postUserDocuments)
router.put('/premium/:uid', customAuth(["admin"]),UsersController.updateUserRol )
router.delete('/admin',customAuth(["admin"]),UsersController.deleteOldConnectionUsers)

// router.put('/:uid/:orderTicket',customAuth(["user","premium","admin"]),async(req,res)=>{
//     const {uid,orderTicket} =req.params   
//     const updatedUser = await usersService.addTicketToUser(uid,orderTicket)

//     res.setHeader('Content-type', 'application/json');
//     return res.status(200).json({payload:updatedUser})    
// })


// router.put('/:uid/:productOwned',customAuth(["user"]),async(req,res)=>{
//     const {uid,productOwned} =req.params   
//     const updatedUser = await usersService.addProductToOwner(uid,productOwned)

//     res.setHeader('Content-type', 'application/json');
//     return res.status(200).json({payload:updatedUser})    
// })