import fs from "fs";
import path from "path";
import { usersService } from '../services/usersService.js';
import { productsService } from "../services/productsService.js";
import { cleanPath, sendEmail } from "../utils.js";
import { isValidObjectId } from "mongoose";
import { usersModel } from '../dao/models/usersModel.js'
import { config } from "../config/config.js";
import { userDTO } from "../DTO/userDTO.js";

export class UsersController{
    static getAllUsers=async(req,res)=>{    
        res.setHeader('Content-type', 'application/json');
        try {
            const allUsers = await usersService.getUsers()            
            const cleanUsers = allUsers.map(user=>new userDTO(user))
            return res.status(200).json({
                status:"success",
                message:"Users obtained successfully",
                payload:cleanUsers
            })
        } catch (error) {
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
        }    
    }

    static getUserById=async (req,res)=>{
        const { uid } = req.params
        res.setHeader('Content-type', 'application/json');

        if(!isValidObjectId(uid)){
            return res.status(400).json({
                error:`Error 400: Bad request.`,
                message:`The ID# provided is not an accepted Id Format in MONGODB database. Please verify and try again`})
        }
    
        try {
            const singleUser= await usersService.getUserById({_id:uid})   
            if(!singleUser){
                res.setHeader('Content-type', 'application/json');
                return res.status(404).json({
                    error:`Error 404 Resource not found`,
                    message: `Id# provided does not exist or is not associated to a user`
                })
            }
            const cleanUser = new userDTO(singleUser)
            return res.status(200).json({
                status:"success",
                message:"User obtained successfully",
                payload:cleanUser
            })
        } catch (error) {
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
        }  
    }

    static postUserDocuments=async(req,res)=>{ 
        res.setHeader('Content-type', 'application/json');
        const {uid} = req.params
        const {name}= req.body
        const file = req.file
        if(!isValidObjectId(uid)){
            return res.status(400).json({
                error:`Error 400 Bad request: Invalid uid format`,
                message: `The format of the uid provided is no an accepted format in MONGODB`
            })
        }
        if(!file){
            return res.status(400).json({
                error:`Error 400 Bad Request: Missing documents`,
                message: `No files were received.`
            })
        }    
        if(!name){
            return res.status(400).json({
                error:`Error 400 Bad Request: Missing data`,
                message: `Uploaded file received lacks mandatory data: no name`
            })
        } 

        const acceptedFileCategories = ['profilePic', 'identificacion', 'producto', 'edoCuenta', 'compDomicilio'];
        if (!acceptedFileCategories.includes(name)) {
            return res.status(400).json({
                error: 'Error 400: Invalid file category name',
                message: `The uploaded file category name '${name}' is not accepted. Only the following name categories are allowed: ${acceptedFileCategories.join(', ')}.`
            });
        }

        try {           
            let folder ='';
            switch(name){
                case "profilePic":
                    folder="./src/public/uploads/profile";
                    break;
                case "identificacion":
                case "compDomicilio":
                case "edoCuenta":
                    folder="./src/public/uploads/documents";
                    break;
                case "producto":
                    folder="./src/public/uploads/products"
                    break;
                default:
                    folder="./src/public/uploads/others"
                    break;
            }
    
            const tempPath=file.path
            const finalPath=path.join(folder,file.filename)
            let document={
                name:name, 
                reference:cleanPath(finalPath)
            }        
            await fs.promises.rename(tempPath,finalPath) 

            const updatedUserDocuments= await usersService.addDocumentToUser(uid,document)  
            if(!updatedUserDocuments){
                return res.status(500).json({
                    error:`Error 500: Unexpected process failure`,
                    message: `Documents were not added to user. Please try again later`
                })
            }

            let docStatusArray =[]           
            updatedUserDocuments.documents.forEach(doc=>{docStatusArray.push(doc.name)})
            if(["identificacion", "edoCuenta", "compDomicilio"].every(doc=>docStatusArray.includes(doc))){
                await usersService.changeUserDocStatus({_id:uid},{docStatus:"complete"})
            } 

            const acceptHeader = req.headers['accept']
            if(acceptHeader?.includes('text/html')){
                return res.status(301).redirect('/perfilUploadSuccess')
            }

            const updatedDocsUser=await usersService.getUserById({_id:uid})
            if(!updatedDocsUser){
                return res.status(500).json({
                    error:`Error 500 Unexpected process failure`,
                    message: `Updated user was not obtained. Please try again later.`
                })
            }

            const cleanUpdatedDocsUser= new userDTO(updatedDocsUser)
            return res.status(200).json({
                status:"success",
                message:"document was uploaded correctly and added to user",
                payload:cleanUpdatedDocsUser
            })  
        } catch (error) {
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later,`,
                message: `${error.message}`,
                stack: error.stack
            })
        }   
    }

    static updateUserRol=async(req,res)=>{
        const {uid} =req.params
        res.setHeader('Content-type', 'application/json'); 

        try{
            if(!isValidObjectId(uid)){
                return res.status(400).json({
                    error:`Errpr 400: Bad request`,
                    message:`The ID# provided is not an accepted Id Format in MONGODB database. Please verify and try again`
                })
            }
            const user= await usersService.getUserById({_id:uid})
            if(!user){
                return res.status(404).json({
                    error:`Error 404 Resource not found, operation cannot be completed`,
                    message: `The user id# provided was not found in our records`
                })
            }
            if(user.rol==='user'){
                if(user.docStatus !== "complete"){
                   return res.status(422).json({
                    error:`Error 422: Unprocessable entity, Petition cannot be completed`,
                    message: `Missing information: User with id#${uid} has not submitted all required documentation to be a premium user`
                   })
                }
                user.rol = 'premium'    
            }else if(user.rol === 'premium'){
                user.rol = 'user'       
            }
    
            const updatedRolUser= await usersService.changeUserRol({_id:uid},{rol:user.rol})
            if(!updatedRolUser){
                return res.status(500).json({
                    error:`error 500: operation failed unexpectedly`,
                    message:`User role could not be updated. Please try again later`
                })
            }
            const cleanUpdatedRolUser = new userDTO(updatedRolUser)
            return res.status(200).json({
                status:"success",
                message:"User role was updated successfully",
                payload:cleanUpdatedRolUser
            })
        }catch{      
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
        }
    }

    static deleteSingleUser=async(req,res)=>{
        res.setHeader('Content-type', 'application/json');
        const uid = req.params.uid
        if(!isValidObjectId(uid)){
            return res.status(400).json({error:`The ID# provided is not an accepted Id Format in MONGODB database. Please verify and try again`})
        }
       
        try {
            const userToDelete = await usersService.getUserById({_id:uid})
            if(!userToDelete){
                return res.status(404).json({
                    error:`Error 404 Resource not found`,
                    message: `User selected does not exist and cannot be deleted.`
                })
            }
            if(userToDelete.productsOwned.length>0){
                let userOwnedProds= userToDelete.productsOwned
                for(let prod of userOwnedProds){                   
                    const prodToString=prod.toString()
                    const updateProdOwner = await productsService.updateProduct(prodToString,{owner:"admin"})
                }               
            }
            const deletedUser = await usersService.deleteSingleUser(uid)
            if (!deletedUser){
                res.setHeader('Content-type', 'application/json');
                return res.status(500).json({
                    error:`Error 500 Unexpected process failure`,
                    message: `Unable to delete user. Please try again later`
                })
            }
            const emailIssuance=await sendEmail(
                `BACKEND-ECOMM HELPDESK ${config.GMAIL_EMAIL}`,
                `${deletedUser.email}`,
                `Tu cuenta ha sido eliminada`,
                `<h2>NUEVA POLÍTICA DE INACTIVIDAD</h2>
                 <p>Estimad@ ${deletedUser.first_name},</p>
                 <p>Debido a las nuevas regulaciones en la región latinoamericana, y en cumplimiento de los estatutos que establecen la ilegalidad del almacenamiento de datos de usuarios inactivos por más de 2 días, hemos eliminado tu cuenta registrada bajo el correo de ${deletedUser.email}<p>
                 <br>
                 <p>Si consideras que esto ha sido un error y requieres restaurar tu cuenta, puedes comunicarte al +42 586 7778889966 para exponer tu caso</p>    
                 <br>      
                 <p>¡Gracias de Antemano por tu Comprensión! Te deseamos un excelente día</p>
                 <br>
                 <h4>Estaremos Atent@s a tu Regreso!!</h4>
                 `
            )
            if(emailIssuance.accepted.length>0){
                req.logger.info(`mail sent successfully to ${deletedUser.email}- accepted by DNS`)
            }else{
                req.logger.error(`Email sent to ${deletedUser.email} did not reach destination. Client mail DNS rejected the package`)
            }
            const cleanDeletedUser = new userDTO(deletedUser)
            return res.status(200).json({
                status:"success",
                message:"User deleted successfully",
                payload:cleanDeletedUser
            })        
       } catch (error) {
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
       }
    }

    static deleteOldConnectionUsers=async(req,res)=>{
        res.setHeader('Content-type', 'application/json');        
        try{          
            const {timingParameter,unit}=req.body
            const cutOffTiming = new Date(); 
            switch(unit){
                case "minutes":
                    cutOffTiming.setMinutes(cutOffTiming.getMinutes()-timingParameter);
                    break;
                case "hours":
                    cutOffTiming.setHours(cutOffTiming.getHours()-timingParameter);
                    break;
                case "days":
                    cutOffTiming.setDate(cutOffTiming.getDate()-timingParameter);
                    break;
                default:
                    throw new Error("invalid Time Unit Specified")
            }    

            // --------------------- test following 2 and decide if redundant to elimintate first ------------------------//
            const usersToDelete = await usersService.getUsersBy(cutOffTiming)
            if(!usersToDelete){
                res.setHeader('Content-type', 'application/json');
                return res.status(404).json({
                    error:`Error 404 Resource not found`,
                    message: `No users that match the specified criteria (last_Session before cut off timing) were found`
                })
            }
            
            const deleteOldConnections= await usersService.deleteOldConnectionsUsers(cutOffTiming)
            if(deleteOldConnections.deletedCount === 0){
                return res.status(200).json({               
                    status:"success 204",
                    message:"The delete operation was processed successfully, but no users analyzed matched the last_session cutoff time criteria, hence no users were deleted.",
                    payload:deleteOldConnections
                })
            }            
            // --------------------- END test following 2 and decide if redundant to elimintate first ------------------------//

            if(deleteOldConnections.deletedCount>0){
                for(let user of usersToDelete){
                    let email = user.email
                    let name = user.first_name

                    if(user.productsOwned.length>0){
                        let userOwnedProds= user.productsOwned
                        for(let prod of userOwnedProds){                   
                            const prodToString=prod.toString()
                            const updateProdOwner = await productsService.updateProduct(prodToString,{owner:"admin"})
                        }               
                    }

                    const emailIssuance=await sendEmail(
                        `BACKEND-ECOMM HELPDESK ${config.GMAIL_EMAIL}`,
                        `${email}`,
                        `Tu cuenta ha sido eliminada`,
                        `<h2>NUEVA POLÍTICA DE INACTIVIDAD</h2>
                         <p>Estimad@ ${name},</p>
                         <p>Debido a las nuevas regulaciones en la región latinoamericana, y en cumplimiento de los estatutos que establecen la ilegalidad del almacenamiento de datos de usuarios inactivos en el plazo oficial, hemos eliminado tu cuenta registrada bajo el correo de ${email}<p>
                         <br>
                         <p>La propiedad de los productos que estaban registrados a tu nombre (owner) -en caso de haber alguno-, fueron transferidos al administrador (admin)</p>
                         <br>
                         <p>Si consideras que esto ha sido un error y requieres restaurar tu cuenta, puedes comunicarte al +42 586 7778889966 para exponer tu caso</p>    
                         <br>      
                         <p>¡Gracias de Antemano por tu Comprensión! Te deseamos un excelente día</p>
                         <br>
                         <h4>Estaremos Atent@s a tu Regreso!!</h4>
                         `
                    )
                    if(emailIssuance.accepted.length>0){
                        req.logger.info(`mail sent successfully to ${email}- accepted by DNS`)
                    }else{
                        req.logger.error(`Email sent to ${email} did not reach destination. Client mail DNS rejected the package`)
                    }
                }                      
                return res.status(200).json({               
                    status:"success",
                    message:"All users with old connections (based on last_session cutofftime) were deleted",
                    payload:deleteOldConnections
                })
            }        
        }catch(error){            
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
        }       
    }

    

    //borrar pre-entrega.. ruta de limpieza 
    static deleteNoLastConnection = async(req,res)=>{
        try {
         const deletedNoLastConn= await usersModel.deleteMany({ "last_connection": { $exists: false } })
         res.setHeader('Content-type', 'application/json');
         return res.status(200).json({payload:deletedNoLastConn})
         
        } catch (error) {
         res.setHeader('Content-type', 'application/json');
         return res.status(500).json({
             error:`Error 500 Server failed unexpectedly, please try again later`,
             message: `${error.message}`
         })
        }      
     }
}