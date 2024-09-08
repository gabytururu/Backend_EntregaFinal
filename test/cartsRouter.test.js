import { describe, it, afterEach, before } from "mocha";
import { expect } from "chai";
import supertest from "supertest-session";
import mongoose, {isValidObjectId} from "mongoose";
import { connectionDB } from "./helpers/dbConnection.js";


const requester=supertest("http://localhost:8080")
//npx mocha ./test/cartsRouter.test.js --exit

describe("Backend Ecommerce Proyect: Carts Router Test",function(){
    this.timeout(10000)

    describe("GET api/carts/ -> sin usuario loggeado o con usuario incorrecto",async function(){
        after(async function(){
            try {
                await requester.get("/api/sessions/logout")
            } catch (error) {
                throw new Error(`Error attempting LOGOUT in RouterCarts Test`)
            }
        })
        it("La ruta GET /api/carts sin usuario loggeado retorna Error 401",async function(){
            const {body,status}= await requester.get("/api/carts")
            expect(status).to.equal(401)
            expect(body).to.exist   
            expect(body.type).to.equal("Authentication failed")   
        })  
        it("La ruta GET /api/carts con usuario invalido retorna Error 403",async function(){
            let user={"email":"coolmotivez@gmail.com", "password":"123456"}
            try {
                user = await requester.post("/api/sessions/login").send(user)
             } catch (error) {
                throw new Error(`Error attempting LOGIN in RouterCarts tests: ${error}`)
             }
            const {body,status}= await requester.get("/api/carts")
            expect(status).to.equal(403)
            expect(body).to.exist   
            expect(body.type).to.equal("Authorization failed")   
        })    
    })
    
    describe("GET api/carts/",async function(){
        before(async function(){
            let admin={"email":"adminCoder@coder.com", "password":"adminCod3r123"}
            try {
               await requester.post("/api/sessions/login").send(admin)            
            } catch (error) {
                throw new Error(`Error attempting LOGIN in RouterCarts tests: ${error}`)
            }
        })
        after(async function(){
            try {
                await requester.get("/api/sessions/logout")
            } catch (error) {
                throw new Error(`Error attempting LOGOUT in RouterCarts Test`)
            }
        })
        it("La ruta GET /api/carts opera OK y retorna contenido",async function(){
            const {body,status}= await requester.get("/api/carts")
            expect(status).to.equal(200)
            expect(body).to.exist
            expect(body.payload).to.exist           
        })  
        it("La ruta GET /api/carts opera OK, retorna contenido, y su contenido es un Array de carritos",async function(){    
            const {body}= await requester.get("/api/carts")                
            expect(body.payload).to.exist
            expect(body.payload).to.be.an("array")
        }) 
        it("La ruta GET /api/carts opera OK, retorna contenido, y su contenido es un Array de carritos con props _id y products",async function(){
            const {body}= await requester.get("/api/carts")                
            expect(body.payload).to.exist
            expect(body.payload).to.be.an("array")
            let carrito=body.payload[0]           
            expect(carrito).has.property("_id")
            expect(carrito).has.property("products")
        })
        it("La ruta GET /api/carts opera OK, retorna contenido, y su contenido tiene una prop llamada products de tipo Array",async function(){
            const {body}= await requester.get("/api/carts")                
            expect(body.payload).to.exist
            expect(body.payload).to.be.an("array")
            let carrito=body.payload[0]           
            expect(carrito).has.property("products").to.be.an("array")
        })
    }) 

    describe("GET api/carts/:cid",function(){       
        before(async function(){
            let user={"email":"coolmotivez@gmail.com", "password":"123456"}
            try {
               await requester.post("/api/sessions/login").send(user)            
            } catch (error) {
                throw new Error(`Error attempting LOGIN in RouterCarts tests: ${error}`)
            }
        })
        after(async function(){
            try {
                await requester.get("/api/sessions/logout")
            } catch (error) {
                throw new Error(`Error attempting LOGOUT in RouterCarts Test`)
            }
        })
        it("La ruta GET /api/carts/:cid opera OK, y retorna 1 objeto con mínimo 2 propiedades",async function(){
            let cid= "66dca2944c3697a6d4d7e924"
            const {body,status}=await requester.get(`/api/carts/${cid}`)
            expect(status).to.equal(200)
            expect(body.payload).to.exist
            expect(body.payload).to.be.an("object")
            expect(Object.keys(body.payload).length).to.be.greaterThan(2)
        })
        it("La ruta GET /api/carts/:cid retorna ERROR cuando :cid no es un formato válido",async function(){
            let cid= "66dca2944c3697a6d4"
            const {status}=await requester.get(`/api/carts/${cid}`)
            expect(status).to.equal(400)
            expect(isValidObjectId(cid)).to.equal(false)
        })
        it("La ruta GET /api/products/:cid retorna ERROR 404 cuando :cid es válido pero no existe en la BD",async function(){
            let cid= "66dca2944c3697a6d4d7e923"
            const {status}=await requester.get(`/api/carts/${cid}`)
            expect(status).to.equal(404)
        })
    })

    describe("PUT api/carts/:cid/product/:pid --> sin user loggeado", function(){       
        const cartId="66dc9bc286360834e88de760"
        const productId="66dc9af086360834e88de753"

        before(async function(){
            try {
                await requester.get("/api/sessions/logout")
            } catch (error) {
                throw new Error(`Error attempting LOGOUT in api/sessions/login Test:${error}`)
            }
        })

        it("La ruta PUT api/carts/:cid/products/:pid/ sin usuario loggeado retorna error 401",async function(){
            const response=await requester.put(`/api/carts/${cartId}/products/${productId}`)
            expect(response.status).to.equal(401)
            expect(response.body.error).includes("Authentication")
        })        
    })

    describe("PUT api/carts/:cid/product/:pid --> con user correcto loggeado",function(){
        const cartId="66dca2944c3697a6d4d7e924"
        const productId="66dc91e6374fd5b41b2b24c7"
        let premium={"email":"gabymh4@gmail.com", "password":"123456"}

        before(async function(){
            try {
                await requester.post("/api/sessions/login").send(premium)
            } catch (error) {
                throw new Error(`Error attemting LOGIN BEFORE POST /api/products: ${error}`)
            }       
        })

        after(async function(){
            try {
                await requester.get("/api/sessions/logout")
            } catch (error) {
                throw new Error(`Error attempting LOGOUT in api/sessions/login Test:${error}`)
            }
        })

        it("La ruta PUT api/carts/:cid/product/:pid con user correcto y params correctos retorna 200",async function(){
            const response = await requester.put(`/api/carts/${cartId}/products/${productId}`)
            expect(response.status).to.equal(200)
        })

        it("La ruta PUT api/carts/:cid/product/:pid con user correcto y params correctos retorna 200 y retorna contenido con el objeto carrito",async function(){
            const response = await requester.put(`/api/carts/${cartId}/products/${productId}`)
            expect(response.status).to.equal(200)
            expect(response.body).has.property("payload")
            expect(response.body.payload).to.be.an("object")
        })

        
        it("La ruta PUT api/carts/:cid/product/:pid con user correcto y params correctos retorna el objeto carrito con props y contenido correcto",async function(){
            const response = await requester.put(`/api/carts/${cartId}/products/${productId}`)
            let carrito=response.body.payload
            expect(carrito).to.be.an("object")
            expect(carrito).to.include.all.keys("_id","products")
            expect(carrito.products).to.be.an("array")
            carrito.products.forEach(prod => {
                expect(prod).to.include.all.keys("pid", "qty");
              });
        })
    })

    describe("PUT api/carts/:cid/product/:pid --> con user sin privilegios loggeado",function(){
        const cartId="66dc991f86360834e88de711"
        const productId="66dc91e6374fd5b41b2b24d4"
        let admin={"email":"adminCoder@coder.com", "password":"adminCod3r123"}

        before(async function(){
            try {
                await requester.post("/api/sessions/login").send(admin)
            } catch (error) {
                throw new Error(`Error attemting LOGIN BEFORE POST /api/products: ${error}`)
            }       
        })

        after(async function(){
            try {
                await requester.get("/api/sessions/logout")
            } catch (error) {
                throw new Error(`Error attempting LOGOUT in api/sessions/login Test:${error}`)
            }
        })

        it("La ruta PUT api/carts/:cid/product/:pid con user incorrecto retorna 403",async function(){
            const response = await requester.put(`/api/carts/${cartId}/products/${productId}`)
            expect(response.status).to.equal(403)
            expect(response.body.type).to.include("Authorization")
        })      
    })

    describe("POST api/carts -->sin user loggeado",function(){
        before(async function(){
            try {
                await requester.get("/api/sessions/logout")
            } catch (error) {
                throw new Error(`Error attempting LOGOUT in api/sessions/login Test:${error}`)
            }
        })
        it("La ruta POST api/carts sin usuario loggeado retorna error 401",async function(){
            const response = await requester.post("/api/carts/")
            expect(response.status).to.equal(401)
            expect(response.body.error).includes('Authentication')
        })
    })

    describe("POST api/carts -->con user correcto loggeado",function(){
        let premium={"email":"gabymh4@gmail.com", "password":"123456"}

        before(async function(){
            try {
                await requester.post("/api/sessions/login").send(premium)
            } catch (error) {
                throw new Error(`Error attemting LOGIN BEFORE POST /api/products: ${error}`)
            }       
        })

        after(async function(){
            try {
                await requester.get("/api/sessions/logout")
            } catch (error) {
                throw new Error(`Error attempting LOGOUT in api/sessions/login Test:${error}`)
            }
        })

        it("La ruta POST api/carts con user loggeado opera OK", async function(){
            const response=await requester.post("/api/carts")
            expect(response.status).to.equal(200)
        })

        it("La ruta POST api/carts con user loggeado opera OK y retorna contenido correcto", async function(){
            const response=await requester.post("/api/carts")
            expect(response.body.payload).to.exist
            const carrito=response.body.payload
            expect(carrito).to.include.all.keys("_id","products")
            expect(carrito.products).to.be.an("array")            
        })
    })    
})


