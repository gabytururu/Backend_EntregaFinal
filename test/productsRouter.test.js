import { describe, it, afterEach, before } from "mocha";
import { expect } from "chai";
import supertest from "supertest-session";
import mongoose, {isValidObjectId} from "mongoose";
import { connectionDB } from "./helpers/dbConnection.js";

const requester=supertest("http://localhost:8080")

describe("Backend Ecommerce Proyect: Products Router Test",function(){
    this.timeout(10000)        
    describe("GET api/products/",function(){
        it("La ruta GET /api/products opera OK y retorna contenido",async function(){
            const {body,status}= await requester.get("/api/products")
            expect(status).to.equal(200)
            expect(body).to.exist
            expect(body.payload).to.exist           
        })

        it("La ruta GET /api/products opera OK, retorna contenido, y su contenido es un Array de productos",async function(){    
            const {body}= await requester.get("/api/products")                
            expect(body.payload).to.exist
            expect(Array.isArray(body.payload)).to.exist
            expect(Array.isArray(body.payload)).to.be.true
        })

        it("La ruta GET /api/products opera OK, retorna contenido, y su contenido es un Array de productos con props _id,code,y title",async function(){
            const {body}= await requester.get("/api/products")                
            expect(body.payload).to.exist
            expect(Array.isArray(body.payload)).to.exist
            expect(Array.isArray(body.payload)).to.be.true    
            let producto=body.payload[0]           
            expect(producto).has.property("_id")
            expect(producto).has.property("code")
            expect(producto).has.property("title")
        })

        it("la ruta GET /api/products?limit={limit} opera OK, retorna contenido, y la cantidad de productos devuelta coincide con los indicados en el query param", async function(){
            let limit = 3
            const {body,status}=await requester.get(`/api/products?limit=${limit}`)
            expect(status).to.exist.and.to.equal(200)
            expect(body.payload.length).to.equal(limit)
        }) 
    })
    describe("GET api/products/:pid",function(){
        it("La ruta GET /api/products/:pid opera OK, y retorna 1 objeto con mínimo 9 propiedades",async function(){
            let pid= "66dc91e6374fd5b41b2b24ca"
            const {body,status}=await requester.get(`/api/products/${pid}`)
            expect(status).to.equal(200)
            expect(body.payload).to.exist
            expect(body.payload).to.be.an("object")
            expect(Object.keys(body.payload).length).to.be.greaterThan(8)
        })
        it("La ruta GET /api/products/:pid retorna ERROR cuando :pid no es un formato válido",async function(){
            let pid= "66dc91e6374fd5b41b2b"
            const {body,status}=await requester.get(`/api/products/${pid}`)
            expect(status).to.equal(400)
            expect(isValidObjectId(pid)).to.equal(false)
        })
        it("La ruta GET /api/products/:pid retorna ERROR 404 cuando :pid es válido pero no existe en la BD",async function(){
            let pid= "66dc91e6374fd5b41b2b24c1"
            const {body,status}=await requester.get(`/api/products/${pid}`)
            expect(status).to.equal(404)
        })
    })   
    describe("POST api/products/ -> sin user loggeado",function(){
        it("La ruta POST api/products sin usuario loggeado retorna error 401",async function(){
            let product={
                "title": "Kit de cocina para outdoors - 18 piezas",
                "description": "Kit de cocina de acero inoxidable para outdoors - 5 piezas incluye olla, sarten, cubiertos y utensilios resistentes al agua y de uso rudo",
                "price": 40,
                "code": 45810,
                "stock": 22,
                "status": true,
                "category": "senderismo",
                "thumbnails": "https://picsum.photos/200"
            }
            const response = await requester.post("/api/products/").send(product)
            expect(response.status).to.equal(401)
            expect(response.body.error).includes('Authentication')
        })
    })  
    describe("POST api/products/ -> con user sin privilegios loggeado",function(){
        let product;
        let user;
        before(async function(){
            product={
                "title": "Kit de cocina para outdoors - 18 piezas",
                "description": "Kit de cocina de acero inoxidable para outdoors - 5 piezas incluye olla, sarten, cubiertos y utensilios resistentes al agua y de uso rudo",
                "price": 40,
                "code": Math.floor(100000 + Math.random() * 100000),
                "stock": 22,
                "status": true,
                "category": "senderismo",
                "thumbnails": "https://picsum.photos/200"
            }        
            user={"email":"coolmotivez@gmail.com", "password":"123456"}
            try {
                await requester.post("/api/sessions/login").send(user)
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

        it("La ruta POST api/products con user sin privilegios, retorna error 403",async function(){
            const response=await requester.post("/api/products").send(user)
            expect(response.status).to.equal(403)
            expect(response.body.type).to.include("Authorization")
        })  
    })
    describe("POST api/products/ -> con user con privilegios loggeado", function(){
        let product;
        let user;
        before(async function(){
            product={
                "title": "Kit de cocina para outdoors - 18 piezas",
                "description": "Kit de cocina de acero inoxidable para outdoors - 5 piezas incluye olla, sarten, cubiertos y utensilios resistentes al agua y de uso rudo",
                "price": 40,
                "code": Math.floor(100000 + Math.random() * 900000),
                "stock": 22,
                "status": true,
                "category": "senderismo",
                "thumbnails": "https://picsum.photos/200"
            }        
            user={"email":"adminCoder@coder.com", "password":"adminCod3r123"}
            try {
                await requester.post("/api/sessions/login").send(user)
            } catch (error) {
                throw new Error(`Error attemting LOGIN BEFORE POST /api/products: ${error}`)
            }           
        })
        
        after(async function(){
            try {          
                await connectionDB()
                await mongoose.connection.collection("products").deleteMany({code:{$gt:99999}});   
                console.log("Test products removed successfully from DB")
                await requester.get("/api/sessions/logout")
                console.log("Test user logged out successfully after productsRouterTest.js")              
            } catch (error) {
                throw new Error(`Error during Product cleanup or logout: ${error}`)
            }finally{
                await mongoose.disconnect();
                console.log("Mongoose Connection Ended Successfully for: ProductsRouter.Test")
            }
        })

        it("La ruta POST api/products con user correcto, sin objeto en body retorna error 400",async function(){
            const response = await requester.post("/api/products/")
            expect(response.status).to.equal(400)
            expect(response.body.error).includes("Missing Arguments")
        })
        it("La ruta POST api/products con user correcto y body correcto retorna 200",async function(){
            const response = await requester.post("/api/products").send(product)
            expect(response.status).to.equal(200)
            expect(response.body.status).to.equal("success")
        })
        it("La ruta POST api/products con user correcto y body correcto retorna un objeto con las props del producto creado",async function(){
            let productB=product
            productB.code=productB.code+1
            const response = await requester.post("/api/products").send(productB)
            expect(response.body.payload).to.exist
            let productoCreado=response.body.payload
            expect(productoCreado).to.be.an("object")
            expect(productoCreado).to.include.all.keys("_id","title","description","price","code","stock","status","owner","category","thumbnails")            
        })
        it("La ruta POST api/products con user correcto pero body incompleto retorna error 400 por propiedades faltantes", async function(){
            let productC=product
            delete productC.code
            delete productC.price
            const response = await requester.post("/api/products").send(productC)
            expect(response.status).to.equal(400)
            expect(response.body.type).to.equal("Missing Properties")
        })         
    })    
})


