import jwt from "jsonwebtoken";
import { Router } from 'express';
import { passportCallError, sendEmail,hashPassword, validatePassword, validatePasswordAsync } from '../utils.js';
import passport from "passport";
import {customAuth} from '../middleware/auth.js'
import { userDTO } from '../DTO/userDTO.js';
import { usersService } from "../services/usersService.js";
import { reqLoggerDTO } from '../DTO/reqLoggerDTO.js';
import { config } from "../config/config.js";

export const router=Router();

router.post('/registro',passportCallError("registro"),customAuth(["public"]),async(req,res)=>{
    const newUser = {...req.user}
    const acceptHeader = req.headers['accept']
    if(acceptHeader?.includes('text/html')){
        return res.status(301).redirect('/login')
    }

    const cleanUser = new userDTO(newUser)
    res.setHeader('Content-type', 'application/json');
    return res.status(201).json({
        status:"success",
        message:"Signup process was completed successfully",
        payload:cleanUser
    })
})

router.post('/login',passportCallError("login"),customAuth(["public"]),async(req,res)=>{
    const authenticatedUser ={...req.user}
    delete authenticatedUser.password
    req.session.user = authenticatedUser    
    
    const acceptHeader = req.headers['accept']
    if(acceptHeader?.includes('text/html')){
        return res.status(301).redirect('/products')
    }

    const cleanAuthenticatedUser=new userDTO(authenticatedUser)
    res.setHeader('Content-type', 'application/json');
    return res.status(200).json({
        status: 'success',
        message: 'User login was completed successfully',
        payload: cleanAuthenticatedUser
    })      
})

router.get('/current', customAuth(["user","premium", "admin"]), async(req,res)=>{
    const currentUserDTO = new userDTO(req.session.user)
    const acceptHeader = req.headers['accept']
    if(acceptHeader?.includes('text/html')){
        return res.status(301).redirect('/perfil')
    }

    res.setHeader('Content-type', 'application/json');
    return res.status(200).json({
        status:'success',
        message: 'current user was obtained successfully',
        payload:currentUserDTO
    })
})

router.get('/logout', customAuth(["user","admin","premium"]),async(req,res)=>{
    req.session.destroy(error=>{
        if(error){
            res.setHeader('Content-type', 'application/json');
            req.logger.error('Error triggered at LOGOUT',new reqLoggerDTO(req,error)) 
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
        }
    })

    const acceptHeader = req.headers['accept']
    if(acceptHeader?.includes('text/html')){
        return res.status(301).redirect('/logout')
    }

    res.setHeader('Content-type', 'application/json');
    return res.status(200).json({
        status: 'success',
        message: 'User logged out successfully',
        payload:'Logout Exitoso'
    })
})

router.get('/error',(req,res)=>{
    res.setHeader('Content-type', 'application/json');
    req.logger.error('Error Redirect triggered by Github Strategy',new reqLoggerDTO(req)) 
    return res.status(500).json({
        error:`Error 500 Server failed unexpectedly, please try again later`,
        message: `Fallo al autenticar`
    })
})

router.get('/github',passport.authenticate("github",{}),(req,res)=>{})

router.get('/callbackGithub',passport.authenticate("github",{failureMessage:true,failureRedirect:"/api/sessions/error"}),(req,res)=>{
    const githubAuthenticatedUser = {...req.user}
    delete githubAuthenticatedUser.profile
    req.session.user = req.user

    const acceptHeader = req.headers['accept']
    if(acceptHeader?.includes('text/html')){
        return res.status(301).redirect('/products')
    }

    res.setHeader('Content-type', 'application/json');
    return res.status(200).json({
        status:'success',
        message:'Github Authentication was completed successfully',
        payload:{
            first_name: githubAuthenticatedUser.first_name,
            last_name: githubAuthenticatedUser.last_name,
            email:githubAuthenticatedUser.email,
            rol: githubAuthenticatedUser.rol,
            carrito: githubAuthenticatedUser.cart,
            last_connection:githubAuthenticatedUser.last_connection
        }
    })
})

router.post('/password',customAuth(["public"]), async(req,res)=>{
    const {email} = req.body
    try{
        const user = await usersService.getUserByEmail({email})
        if(!user){
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({
                error:`Error 400 Resource not found, please verify and try again`,
                details: `El email ${email} no esta registrado. Por favor intenta nuevamente`
            })
        }

        const token = jwt.sign(user,config.JWT_SECRET,{expiresIn:'1h'})
        const tokenEmail = await sendEmail(
            `ECOMM Store Password Reset ${config.GMAIL_EMAIL}`,
            `${user.email}`,
            `Pasos para reestablecer tu Password`,
            `<h2>¡Hola! Vamos a Reestablecer tu Password</h2>
            <h3>Revisa los 5 pasos a continuación y síguelos cuidadosamente</h3>
            <p>PASO#1: Ingresa a la liga incluida al final de estos pasos- Sólo debes dar CLICK<p>
            <p>PASO#2: Esta liga te llevará a una pantalla para ingresar nuevamente tu email y tu nuevo password</p>          
            <p>PASO#3: Una vez realizdo esto da click en el botón ACEPTAR</p>          
            <p>PASO#4: Tu nuevo password habrá sido guardado y el sitio te redirigirá automáticamente a la pantalla de LOGIN para ingresar a la app</p>          
            <p>PASO#5: Ingresa nuevamente tus credenciales: tu EMAIL con tu NUEVO PASSWORD</p>          
            <br>
            <h3>¡Listo! tu password nuevo ya estará vigente</h3>
            <h4>Recuerda que este link sólo es válido por 1hora. Si realizas este proceso después de ese período, este link ya no será válido y deberás emitir un nuevo correo y link de reestablecimiento</h4>
            <br>
            <h4>Gracias y Sigue comprando con nosotros!!</h4>
            <br>
            <br>
            <a href="http://localhost:8080/resetPassword?token=${token}">¡QUIERO REESTABLECER MI PASSWORD!</a>
           `              
        )

        res.status(200).send({
            message: 'Email validated',
            details: `Hemos enviado un email a tu correo los pasos y una liga para resetear tu email. Este correo tiene validez de 1hora. Por favor atiéndelo antes de que expire `
        });
    }catch(error){
        console.error('Error handling /password:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.toString() });
    }
  
  
})

router.post('/resetPassword',async(req,res)=>{     
    try {
        let {email, oldPassword, newPassword} = req.body
        let isMatch=await validatePasswordAsync(newPassword, oldPassword)

        if(isMatch){
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({
                error:`Error 400, please verify and try again`,
                message: `Password repetido`,
                details: `Tu nuevo password no puede ser igual al anterior. Reintenta con otra contraseña`
            })
        }

        newPassword = hashPassword(newPassword)
      
        let user = await usersService.getUserByEmail({email})
        let updateUserPassword= await usersService.changeUserPassword({_id:user._id},{password:newPassword})
        
        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({
            status: `success`,
            message: `El password ha sido actualizado. Por favor dirígete a la sección de LOGIN e ingresa con tu nuevo password`,           
            payload: `Password actualizado correctamente`
        })
    } catch (error) {
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error:`Error 500 Server failed unexpectedly, please try again later`,
            message: `${error.message}`
        })
    }
})
