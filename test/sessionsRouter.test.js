import { describe, it, afterEach, before } from "mocha";
import { expect } from "chai";
import supertest from "supertest-session";
import { connectionDB } from "./helpers/dbConnection.js";
import mongoose from "mongoose";

const requester=supertest("http://localhost:8080")

describe("Backend Ecommerce Proyect: Sessions Router Test",function(){
    this.timeout(10000)
    before(async function(){
        await connectionDB();
    })
    after(async function(){
            try {                
                await requester.get("/api/sessions/logout")
                await mongoose.disconnect();
            } catch (error) {
                throw new Error(`Error attempting LOGOUT Test OR during mongoose disconnection of api/sessions/login `)
            }
    })

    describe("POST api/sessions/login -> enviando datos de user sin privilegios", async function(){
        let user;
        beforeEach(async function(){
            user={"email":"gabymh4@gmail.com", "password":"898989"}     
        })
      
        it("La ruta POST /api/sessions/login enviando datos incompletos(sin email o password), retorna Error 401", async function(){
            delete user.email
            const response = await requester.post("/api/sessions/login")
            expect(response.status).to.equal(401)
            expect(response.body.error).to.equal('Missing credentials')
        })
        it("La ruta POST /api/sessions/login enviando password incorrecto, retorna Error 401", async function(){
            const response = await requester.post("/api/sessions/login").send(user)
            expect(response.status).to.equal(401)
            expect(response.body.error).includes('invalid password')
        })
    })

    describe("POST api/sessions/login ->enviando datos correctos", async function(){
        let user={"email":"gabymh4@gmail.com", "password":"123456"}   
        it("La ruta POST /api/sessions/login enviando datos correctos opera OK y retorna contenido", async function(){            
            const response = await requester.post("/api/sessions/login").send(user)
            expect(response.status).to.equal(200)
            expect(response.body).has.property("payload")
            
        })
        it("La ruta POST /api/sessions/login enviando datos correctos opera OK y retorna payload de usuario con props que incluyen nombre, email, rol, y carrito", async function(){
            const response = await requester.post("/api/sessions/login").send(user)
            expect(response.status).to.equal(200)
            expect(response.body).has.property("payload")            
            expect(response.body.payload).to.include.keys("fullName","email","rol","cart")            
        })        
    })

    describe("GET api/sessions/current",async function(){
        it("a ruta GET /api/sessions/current, que retorna el usuario loggeado al momento",async function(){
            const response=await requester.get("/api/sessions/current")
            expect(response.status).to.equal(200)
            expect(response.body).to.has.property("payload")
            expect(response.body.payload).to.include.keys("fullName","email","cart")
        })
    })

    describe("POST api/sessions/registro -> envio sin body", function(){        
        it("la ruta POST /api/sessions/registro sin enviar body retorna Error 401 por falta de credenciales",async function(){
            const response=await requester.post("/api/sessions/registro")
            expect(response.status).to.equal(401)
            expect(response.body.error).to.include("Missing credentials")
        })
    })

    describe("POST api/sessions/registro -> envio con body",function(){
        let newUser;
        before(async function(){
            await mongoose.connection.collection("users").deleteMany({email:"testing2@test.com"})
        })
        beforeEach(async function(){
            newUser={
                first_name:"testUser", 
                last_name:"testing", 
                email:"testing2@test.com",
                age:40, 
                password:"123456",
                rol:"premium"
            }
        })

        afterEach(async function(){
            await mongoose.connection.collection("users").deleteMany({email:"testing2@test.com"})
        }) 
        
        it("la ruta POST /api/sessions/registro enviando body correcto, opera OK y retorna contenido",async function(){          
            const response=await requester.post("/api/sessions/registro").send(newUser)
            expect(response.status).to.equal(201)
            expect(response.body.payload).to.exist
        })
        it("la ruta POST /api/sessions/registro enviando body correcto, opera OK y retorna el objeto del nuevo usuario creado con las propiedades esperadas",async function(){          
            const response=await requester.post("/api/sessions/registro").send(newUser)
            let usuarioCreado = response.body.payload
            expect(usuarioCreado).to.be.an("object")
            expect(usuarioCreado).to.include.all.keys("fullName","email","cart","rol","docStatus","productsOwned","tickets","last_connection","id","documents")
        })
        it("la ruta POST /api/sessions/registro enviando body sin email retorna error 401",async function(){          
            delete newUser.email
            const response=await requester.post("/api/sessions/registro").send(newUser)
            expect(response.status).to.equal(401)
            expect(response.body.error).to.include("Missing credentials")
        })
        it("la ruta POST /api/sessions/registro enviando body sin password retorna error 401",async function(){          
            delete newUser.password
            const response=await requester.post("/api/sessions/registro").send(newUser)
            expect(response.status).to.equal(401)
            expect(response.body.error).to.include("Missing credentials")
        })
        it("la ruta POST /api/sessions/registro enviando body incompleto retorna 401",async function(){          
            delete newUser.first_name
            const response=await requester.post("/api/sessions/registro").send(newUser)
            expect(response.status).to.equal(401)
            expect(response.body.error).to.include("Signup failed")
        })
        it("la ruta POST /api/sessions/registro enviando email duplicado(pre-existente) retorna 401 ",async function(){          
            newUser.email = "gabymh4@gmail.com"
            const response=await requester.post("/api/sessions/registro").send(newUser)
            expect(response.status).to.equal(401)
            expect(response.body.error).to.include("Email already exists")
        })
    })

})