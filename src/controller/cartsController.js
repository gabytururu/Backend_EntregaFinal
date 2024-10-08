import { productsService } from '../services/productsService.js';
import { cartsService } from '../services/cartsService.js';
import { ticketsService } from '../services/ticketsService.js';
import { isValidObjectId } from 'mongoose';
import { ticketDTO } from '../DTO/ticketDTO.js';
import { uniqueTicketCode } from '../utils.js';
import { sendEmail } from '../utils.js';
import { config } from '../config/config.js';
import { CustomError } from "../utils/CustomError.js";
import { invalidCartBody, notFound, notProcessed } from "../utils/errorCauses.js";
import { ERROR_CODES } from "../utils/EErrors.js";
import { reqLoggerDTO } from '../DTO/reqLoggerDTO.js';
import { usersService } from '../services/usersService.js';

export class CartsController{
    static getCarts=async(req,res)=>{
        res.setHeader('Content-type', 'application/json');    
        try{
            const carts = await cartsService.getCarts() 
            if(!carts){
                return res.status(404).json({
                    error: `ERROR: resource not found`,
                    message: `No carts were found in our database, please try again later`
                })
            }             
            res.status(200).json({
                status:"success",
                message:"carts obtained successfully",
                payload:carts
            })
        }catch(error){
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Unexpected server error - try again or contact support`,
                message: error.message
            })
        }
    }

    static getCartById=async(req,res)=>{
        const {cid}=req.params
        res.setHeader('Content-type', 'application/json');
    
        if(!isValidObjectId(cid)){
            return res.status(400).json({error:`The Cart ID# provided is not an accepted Id Format in MONGODB database. Please verify your Cart ID# and try again`})
        }
    
        try {
            const matchingCart = await cartsService.getCartById(cid) 
            if(!matchingCart){
                return res.status(404).json({
                    error: `ERROR: Cart id# provided was not found`,
                    message: `Resource not found: The Cart id provided (id#${cid}) does not exist in our database. Please verify and try again`
                })
            }        
            return res.status(200).json({
                status:"success",
                message:"cart obtained successfully",
                payload: matchingCart
            })
        } catch (error) {
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Unexpected server error - try again or contact support`,
                message: error.message
            })
        }
    
    }

    static postNewCart=async(req,res)=>{
        res.setHeader('Content-type', 'application/json')
        try {
         
            const newCart = await cartsService.createNewCart()
            if(!newCart){
                return res.status(500).json({
                    error: `Error: unable to create new cart`,
                    message: `The new cart could not be created. Please try again later`
                })
            }
            return res.status(200).json({
                status:"success",
                message:"new cart created successfully",
                payload:newCart
            })
        } catch (error) {
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Unexpected server error (500) - try again or contact support`,
                message: error.message
            })
        }
    }

    static replaceCartContent=async(req,res)=>{
        const {cid} = req.params;
        const newCartDetails = req.body
        const {email: userEmail, _id:userId, rol:userRol}= req.session.user
        res.setHeader('Content-type', 'application/json')
    
        if(!isValidObjectId(cid)){
            return res.status(400).json({error:`The Cart ID# provided is not an accepted Id Format in MONGODB database. Please verify your Cart ID# and try again`})
        }
    
        try{           
            const cartIsValid = await cartsService.getCartById(cid)
            if(!cartIsValid){
                return res.status(404).json({
                    error: `ERROR: Cart id# provided was not found`,
                    message: `Failed to replace the content in cart due to invalid argument: The Cart id provided (id#${cid}) does not exist in our database. Please verify and try again`
                })
            }
        }catch(error){
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Unexpected server error (500) - try again or contact support`,
                message: error.message
            })
        }
      
        const newCartDetailsString = JSON.stringify(newCartDetails)
        const regexValidFormat = /^\[\{.*\}\]$/;
        if(!regexValidFormat.test(newCartDetailsString)){
            return res.status(400).json({
                error: 'Invalid request : Format does not meet criteria',
                message:  `Failed to replace the content in the cart id#${cid} due to invalid format request. Please make sure the products you submit are in a valid JSON format (Alike array with objects, where each object must have 2 properties: pid and qty). Example: [{pid:string, qty:number}]).`
            });
        }
        
        const keys = Object.keys(newCartDetails)
        if(keys.length>0){
            const bodyFormatIsValid = keys.every(key=> 'pid' in newCartDetails[key] && 'qty' in newCartDetails[key])
            if(!bodyFormatIsValid){
                return res.status(400).json({
                    error: 'Missing properties in body',
                    message: `Failed to replace the content in the cart id#${cid} due to incomplete request (missing properties). All products in cart must have a "pid" and a "qty" property to be accepted. Please verify and try again.`
                });
            }
        }
    
        const pidArray = newCartDetails.map(cart=>cart.pid)
        try{
            for(const pid of pidArray){
                const pidIsValid = await productsService.getProductBy({_id:pid})
                if(!pidIsValid){
                    return res.status(404).json({
                        error: `ERROR: Cart could not be replaced`,
                        message: `Failed to replace the content in cart id#${cid}. Product id#${pid} was not found in our database. Please verify and try again`
                    })
                }
                req.logger.debug(pidIsValid)
                if(pidIsValid.owner===userEmail){
                    return res.status(500).json({
                        error: `ERROR: Cart could not be replaced`,
                        message: `Failed to replace the content in cart id#${cid} due to invalid Product.  Users cannot purchase their own products. Product id#${pid} Is owned by ${userEmail}, hence, it cannot be added to its cart`
                    })
                }
            }  
        }catch(error){
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Unexpected server error (500) - try again or contact support`,
                message: error.message
            })
        }     
        
        try{
            const cartEditDetails = await cartsService.replaceProductsInCart(cid,newCartDetails)
            if(!cartEditDetails){
                return res.status(404).json({
                    error: `ERROR: Cart id# could not be replaced`,
                    message: `Failed to replace the content in cart id#${cid}. Please verify and try again`
                })
            }
            return res.status(200).json({
                status:"success",
                message:"cart content was successfully replaced",
                payload:cartEditDetails
            })
        }catch(error){  
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Unexpected server error (500) - try again or contact support`,
                message: error.message
            })
        }
    }

    static updateProductInCart=async(req,res,next)=>{
        const {cid, pid} = req.params
        const {qty} = req.body
        const {email: userEmail, _id:userId, rol:userRol}= req.session.user
        res.setHeader('Content-type', 'application/json');
        
        try{
            if(!isValidObjectId(cid)){
                return res.status(400).json({error:`The Cart ID# provided is not an accepted Id Format in MONGODB database. Please verify your Cart ID# and try again`})
            }
        
            if(!isValidObjectId(pid)){
                return res.status(400).json({error:`The Product ID# provided is not an accepted Id Format in MONGODB database. Please verify your Product ID# and try again`})
            }
        
            const regexValidBodyFormat = /^\{.*\}$/
            const fullBody = JSON.stringify(req.body)
            if(!regexValidBodyFormat.test(fullBody,pid,cid)){ 
                return next(
                    CustomError.createError(
                        "Invalid Body Format", 
                        invalidCartBody(fullBody),
                        `Qty to increase invalid format`, 
                        ERROR_CODES.INVALID_ARGUMENTS)
                )     
            }

            const productIsValid = await productsService.getProductBy({_id:pid})
            if(!productIsValid){
                return next(CustomError.createError(
                    "Product not found",
                    notFound(pid,"pid"),
                    `pid  #${pid} was not found`, 
                    ERROR_CODES.RESOURCE_NOT_FOUND
                ))
            }
   
            const cartIsValid = await cartsService.getCartById(cid)
            if(!cartIsValid){
                return next(CustomError.createError(
                    "Cart not found",
                    notFound(cid,"cid"),
                    `cid #${cid} was not found`, 
                    ERROR_CODES.RESOURCE_NOT_FOUND
                ))
            }

            const productToAdd = await productsService.getProductBy({_id:pid})
            if(productToAdd.owner === userEmail){
                return next(CustomError.createError(
                    "Product was not added to Cart",
                    notProcessed(),
                    `Users cannot buy their own products.Pid#${pid} Is owned by ${userEmail}.  Hence, product cannot be added to its own cart `,
                    ERROR_CODES.INTERNAL_SERVER_ERROR
                ))
            }

            const productAlreadyInCart = await cartsService.findProductInCart(cid,pid) 
            if(!productAlreadyInCart){
               const updatedCart =  await cartsService.addProductToCart(cid,pid)
               if(!updatedCart){
                return next(CustomError.createError(
                    "New product was not added to cart",
                    notProcessed(),
                    `Product pid#${pid} could not be added to cart cid#${cid}`,
                    ERROR_CODES.INTERNAL_SERVER_ERROR
                ))
               }
               return res.status(200).json({ updatedCart });
            }

            const updatedCart = await cartsService.updateProductQtyInCart(cid,pid,qty)
            if(!updatedCart){
                return next(CustomError.createError(
                    "Quantity of selected product was not increased in cart",
                    notProcessed(),
                    `Product pid#${pid} could not be increased cart ${cid} by the inteded quantity of ${qty} units. Product remained with original quantity`,
                    ERROR_CODES.INTERNAL_SERVER_ERROR
                ))
            }
            return res.status(200).json({ 
                status:"success",
                message:"product was successfully added to cart",
                payload:updatedCart 
            });
        }catch(error){
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return next(error)
        }  
    }

    static deleteAllProductsInCart=async(req,res)=>{
        const {cid} = req.params
      
        res.setHeader('Content-type', 'application/json');
    
        if(!isValidObjectId(cid)){       
            return res.status(400).json({error:`The ID# provided is not an accepted Id Format in MONGODB database. Please verify your ID# and try again`})
        }
    
        try {
            const deletedCart = await cartsService.deleteProductsInCart(cid)
            if(!deletedCart){
                return res.status(404).json({
                    error: `ERROR: Cart id# provided was not found`,
                    message: `Failed to delete cart id#${cid} as it was not found in our database, Please verify and try again`
                })
            }       
            return res.status(200).json({
                status:"success",
                message: "Cart emptied successfully. All products were deleted",
                payload:deletedCart
            })
        } catch (error) {
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
        }
    }

    static deleteSingleProductInCart=async(req,res)=>{
        const {cid, pid} = req.params;
        res.setHeader('Content-type', 'application/json');
    
        if(!isValidObjectId(cid)){
            return res.status(400).json({error:`The Cart ID# provided is not an accepted Id Format in MONGODB database. Please verify your Cart ID# and try again`})
        }
    
        if(!isValidObjectId(pid)){
            return res.status(400).json({error:`The Product ID# provided is not an accepted Id Format in MONGODB database. Please verify your Product ID# and try again`})
        }
    
        try{
            const isProductIdValid = await productsService.getProductBy({_id:pid})
            if(!isProductIdValid){
                return res.status(404).json({
                    error: `ERROR: Product id# provided was not found`,
                    message: `Failed to delete product id#${pid} in cart. This product id was not found in our database, Please verify and try again`
                })
            }
    
            const isCartIdValid = await cartsService.getCartById(cid)
            if(!isCartIdValid){
                return res.status(404).json({
                    error: `ERROR: Cart id# provided was not found`,
                    message: `Failed to delete intended products in cart id#${cid}. The cart id# provided was not found in our database, Please verify and try again`
                })
            }    
           
            const isProductInCart = await cartsService.findProductInCart(cid,pid)
            if(!isProductInCart){
                return res.status(404).json({
                    error: `ERROR: Product id# was not found in this cartid#`,
                    message: `Failed to delete product id#${pid} in cart id#${cid}. The product id# provided was not found in the selected cart, Please verify and try again`
                })
            }
        }catch(error){
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
        }
    
        try {          
            const deletedProductInCart = await cartsService.deleteProductsInCart(cid,pid)
            if(!deletedProductInCart){
                return res.status(404).json({
                    error: `ERROR: Failed to delete product in cart`,
                    message: `Could not delete product id#${pid} in cart id#${cid}, Please verify and try again`
                })
            }
            return res.status(200).json({
                status:"success",
                message:"Product was successfully removed from cart",
                payload:deletedProductInCart
            })
        } catch (error) {
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
        }
    }

    static completePurchase=async(req,res)=>{
        res.setHeader('Content-type', 'application/json');
        const {cid} =req.params;
        const { email: userEmail, cart: userCart, _id: userId } = req.session.user
        const uniqueCode = uniqueTicketCode(req.session.user)
        let purchasedProducts=[];
        
        if(!isValidObjectId(cid)){
            return res.status(400).json({
                error:`Error 400: bad request`,
                message:`The Cart ID# provided is not an accepted Id Format in MONGODB database. Please verify your Cart ID# and try again`
            })
        }

        try{
            const matchingCart = await cartsService.getCartById(cid) 
            if(!matchingCart){
                return res.status(404).json({
                    error:`Error 404 Resource not found`,
                    message: `No carts were found for the Cart id# provided (cid#${cid}). Please verify and try again`
                })
            }

            if(matchingCart.products.length === 0){
                res.setHeader('Content-type', 'application/json');
                return res.status(422).json({
                    error:`Error 422: Unprocessable entity: cart is empty`,
                    message: `The cart its empty. Purchase orders cannot be completed for empty carts.`
                })
            }

            if(cid !== userCart._id){
                return res.status(403).json({
                    error:`Error 403: action forbidden`,
                    message:`You do not have permission to complete the purchase for this cart. Purchase orders can only be completed by the owner of the cart. The cart Id referenced in your url/param (id#${cid}) does not match the cart Id owned by the logged-in user trying to complete the purchase (id#${userCart._id}) Please verify and try again`
                })
            }
      
            const cartId = matchingCart._id.toString()    
            for(let p of matchingCart.products){
                const productDetails= p.pid
                const productOrderQty = p.qty
                const productId = p.pid._id.toString()
                const productStock=p.pid.stock            

                if(productOrderQty<=productStock){
                    const newProductStock = productStock-productOrderQty  
                    const updateProductStock = await productsService.updateProduct(productId,{stock:newProductStock}) 
                    const deleteProductInCart = await cartsService.deleteProductsInCart(cartId,productId)
                    const orderTicket = {...productDetails, qty:productOrderQty}
                    purchasedProducts.push(new ticketDTO(orderTicket))
                }           
            }
    
            const ticketSubtotals = purchasedProducts.map(p=>p.subtotal)
            const ticketTotal = ticketSubtotals.reduce((ticketTotalAcc,subtotal)=>ticketTotalAcc+subtotal,0)
            if(ticketTotal === 0){
                return res.status(422).json({
                    error:`Error 422: Unprocessable entity: Insufficient inventory`,
                    message: `Order cannot be fullfilled. All product(s) allocated in your cart were backordered. Thus, the total order amount is $0.00. Purchase orders cannot be completed at $0.00 amount.`
                })
            }
            const remainingCart = await cartsService.getCartById(cartId)       
            const ticketDetails={
                code: uniqueCode,
                purchaser:userId,
                purchaserContact: userEmail?userEmail:`El usuario ${userId} no tiene correo registrado`,
                hasEmail:userEmail?"yes":"no",
                amount: ticketTotal,
                productsPurchased:purchasedProducts,
                productsLeftInCart:remainingCart.products.map(p=>p.pid._id),
                carts:userCart,
            }
    
            
            const ticketCreated = await ticketsService.createTicket(ticketDetails) 
            const ticketUserAssigned = await usersService.addTicketToUser(userId,ticketCreated)
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;            
            ticketCreated.hasEmail =emailRegex.test(userEmail)
        
            if(emailRegex.test(userEmail)){
                const emailSent = await sendEmail(
                    `BACKEND ECOMM TICKET ${config.GMAIL_EMAIL}`,
                    `${userEmail}`,
                    `Tu Compra - Ticket#${ticketCreated._id}`,
                    `<h2>Muchas Gracias por Tu Compra!</h2>
                     <p>Tu numero de Ticket es #${ticketCreated._id}</p>
                     <p>Tu código único es #${uniqueCode}<p>
                     <p>El total de tu compra fue de $${ticketCreated.amount} USD</p>          
                     <p>Puedes revisar todos los detalles de tu compra la sección de "MI PERFIL" en nuestro sitio web</p>          
                     <br>
                     <h4>Cualquier duda puedes reportarla a nuestro número +52123456789</h4>
                     <br>
                     <h4>Gracias y Sigue comprando con nosotros!!</h4>
                    `              
                )
                req.logger.info("An email was sent to the client",emailSent)
                if(emailSent.accepted.length>0){
                    req.logger.info("mail sent successfully - accepted by DNS")
                }else{
                    req.logger.error("Email sent did not reach destination. Clients mail DNS rejected the package")
                }
            }           
            return res.status(200).json({
                status:"success",
                message:"Purchase order completed successfully: new ticket issued and sent to user",
                payload:ticketCreated
            })
        }catch(error){
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
        }        
    }

    static getPurchaseTicket=async(req,res)=>{
        res.setHeader('Content-type', 'application/json');
        const {cid,tid} =req.params
        const {cart: userCart, rol: userRol} = req.session.user

        if(!isValidObjectId(cid)){
            return res.status(400).json({
                error: `Error 400: Bad request`,
                message:`The Cart ID# provided is not an accepted Id Format in MONGODB database. Please verify your Cart ID# and try again`
            })
        }

        if(!isValidObjectId(tid)){
            return res.status(400).json({
                error: `Error 400: Bad request`,
                message:`The Ticket ID# provided is not an accepted Id Format in MONGODB database. Please verify your Ticket ID# and try again`
            })
        }

        try {
            const matchingTicket = await ticketsService.getPurchaseTicket({_id:tid})
            if(!matchingTicket){
                return res.status(404).json({
                    error:`Error 404 Resource not found, please verify and try again`,
                    message:`Purchase Ticket #${tid} does not exist or cannot be located`
                })
            }   
            const cartIdInTicket = matchingTicket.carts._id.toString()           
            if(cid !== cartIdInTicket){
                res.setHeader('Content-type', 'application/json');
                return res.status(400).json({
                    error:`Error 404 Bad Request`,
                    message: `Missmatch between CartId and TickedId. Cart id provided (#${cid}) is not associated to Ticket Id provided (#${tid}).`
                })
            }

            if(cid !== userCart._id && userRol !== "admin"){
                return res.status(403).json({
                    error:`Error 403: Operation Forbidden. Insufficient privileges`,
                    message: `Ticket Cannot be retreived. Tickets can only be retreived and seen by the ticket owner (purchaser) or an admin.`
                })
            }

            return res.status(200).json({
                status:"success",
                message:"Purchase Order Ticket was obtained successfully",
                payload: matchingTicket
            })
        } catch (error) {
            req.logger.error('Server Error 500',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
        }      
    }    
}