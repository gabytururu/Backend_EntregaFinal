import { Router } from 'express';
import {customAuth} from '../middleware/auth.js'
import { upload, cleanPath } from '../utils.js';
import { UsersController } from '../controller/usersController.js';

export const router=Router();

router.get('/', customAuth(["admin"]), UsersController.getAllUsers)
router.get('/:uid', customAuth(["admin"]), UsersController.getUserById)
router.post('/:uid/documents',customAuth(["user","premium"]), upload.single("upload"),UsersController.postUserDocuments)
router.put('/premium/:uid', customAuth(["admin"]),UsersController.updateUserRol )
router.delete('/:uid',customAuth(["admin"]),UsersController.deleteSingleUser)
router.delete('/admin/deleteOldConnections',customAuth(["admin"]),UsersController.deleteOldConnectionUsers)


