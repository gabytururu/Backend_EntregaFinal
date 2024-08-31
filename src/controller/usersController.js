import fs from "fs";
import path from "path";
import { usersService } from '../services/usersService.js';
import { cleanPath } from "../utils.js";

export class UsersController{
    static getAllUsers=async(req,res)=>{    
        res.setHeader('Content-type', 'application/json');
        try {
            const allUsers = await usersService.getUsers()
            return res.status(200).json({payload:allUsers})
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
    
        try {
            const singleUser= await usersService.getUserById({_id:uid})   
            return res.status(200).json({payload:singleUser})
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
            console.log("el UID directo de req.params", uid)
            const {name}= req.body
            const file = req.file
    
            if(!file){
                return res.status(400).json({
                    error:`Error 400 Missing documents:no file received`,
                    message: `No file was received`
                })
            }
    
            if(!name){
                return res.status(400).json({
                    error:`Error 400 Missing data`,
                    message: `Uploaded file received lacks mandatory data: no name`
                })
            }        
            console.log('name pre switch',name)
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
            console.log("el name dentro del endpoint postUserDoc", document)
        
            await fs.promises.rename(tempPath,finalPath)       
            const updatedUserDocuments= await usersService.addDocumentToUser(uid,document)  
            console.log("el updatedUserDocuments---->",updatedUserDocuments)
            let docStatusArray =[]
           
            updatedUserDocuments.documents.forEach(doc=>{
                //docStatusArray.push(doc.document.name)
                docStatusArray.push(doc.name)
            })
            if(["identificacion", "edoCuenta", "compDomicilio"].every(doc=>docStatusArray.includes(doc))){
                await usersService.changeUserDocStatus({_id:uid},{docStatus:"complete"})
            } 
            const updatedDocsUser=await usersService.getUserById({_id:uid})
            return res.status(200).json({payload:updatedDocsUser})  
        } catch (error) {
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later, SI ES AQUI`,
                message: `${error.message}`,
                stack: error.stack
            })
        }   
    }

    static updateUserRol=async(req,res)=>{
        const {uid} =req.params
        res.setHeader('Content-type', 'application/json');
        
        try{
            const user= await usersService.getUserById({_id:uid})
            if(user.rol==='user'){
                if(user.docStatus !== "complete"){
                   return res.status(400).json({
                    error:`Error 400: missing information, petition cannot be complted`,
                    message: `User with id#${uid} has submitted all required documentation to be a premium user`
                   })
                }
                user.rol = 'premium'    
            }else if(user.rol === 'premium'){
                user.rol = 'user'       
            }
    
            const updatedRolUser= await usersService.changeUserRol({_id:uid},{rol:user.rol})
            res.setHeader('Content-type', 'application/json');
            return res.status(200).json({payload:updatedRolUser})
        }catch{      
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

            const deleteOldConnections= await usersService.deleteOldConnectionsUsers(cutOffTiming)
            res.setHeader('Content-type', 'application/json');
            return res.status(200).json({payload:cutOffTiming})

        }catch(error){            
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
        }       
    }
}