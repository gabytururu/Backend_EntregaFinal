import { Router } from 'express';
import { ProductsController } from '../controller/productsController.js';
import {customAuth} from '../middleware/auth.js'

export const router=Router();

router.get('/', customAuth(["public","user","admin"]), ProductsController.getProducts)
router.get('/:id',customAuth(["public","user","admin"]),ProductsController.getProductById)
router.post('/',customAuth(["premium","admin"]),ProductsController.postProduct)  
router.put('/:id',customAuth(["premium","admin"]),ProductsController.updateProduct)
router.delete('/:id',customAuth(["premium","admin"]),ProductsController.deleteProduct)