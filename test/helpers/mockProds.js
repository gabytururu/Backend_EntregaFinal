// import mongoose from "mongoose"
// import {config} from "../../src/config/config.js"
// import { productsModel } from "../../src/dao/models/productsModel.js"


// ---------------- products ---------------------------//

//     let products = [
//         {
//             title: "Mochila de senderismo 30L",
//             description: "Mochila ligera de 30 litros con múltiples compartimentos para caminatas largas.",
//             price: 60,
//             code: 17894,
//             stock: 28,
//             status: true,
//             owner: "admin",
//             category: "senderismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Botella térmica de acero inoxidable",
//             description: "Botella térmica que mantiene líquidos calientes o fríos por más de 12 horas.",
//             price: 25,
//             code: 65342,
//             stock: 32,
//             status: true,
//             owner: "admin",
//             category: "senderismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Linterna de mano recargable",
//             description: "Linterna de alta potencia con batería recargable, ideal para caminatas nocturnas.",
//             price: 35,
//             code: 48213,
//             stock: 15,
//             status: true,
//             owner: "admin",
//             category: "senderismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Bastones de trekking ajustables",
//             description: "Par de bastones de trekking ajustables y antideslizantes, perfectos para terrenos irregulares.",
//             price: 45,
//             code: 98372,
//             stock: 24,
//             status: true,
//             owner: "admin",
//             category: "senderismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Saco de dormir ultraligero",
//             description: "Saco de dormir compacto y ultraligero, ideal para climas templados y fríos.",
//             price: 70,
//             code: 35198,
//             stock: 19,
//             status: true,
//             owner: "admin",
//             category: "senderismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Gorra repelente al agua",
//             description: "Gorra resistente al agua con protección solar, ideal para caminatas bajo el sol.",
//             price: 20,
//             code: 44211,
//             stock: 30,
//             status: true,
//             owner: "admin",
//             category: "senderismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Tienda de campaña para 2 personas",
//             description: "Tienda ligera y resistente para dos personas, fácil de montar y desmontar.",
//             price: 150,
//             code: 59732,
//             stock: 10,
//             status: true,
//             owner: "admin",
//             category: "senderismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Botas de montaña impermeables",
//             description: "Botas resistentes e impermeables, perfectas para senderos con barro o lluvia.",
//             price: 90,
//             code: 86943,
//             stock: 16,
//             status: true,
//             owner: "admin",
//             category: "senderismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Cinturón con compartimientos",
//             description: "Cinturón ligero con bolsillos para llevar objetos pequeños y agua.",
//             price: 18,
//             code: 23456,
//             stock: 26,
//             status: true,
//             owner: "admin",
//             category: "senderismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Manta térmica de emergencia",
//             description: "Manta térmica resistente y ligera, ideal para emergencias en montaña.",
//             price: 12,
//             code: 78452,
//             stock: 34,
//             status: true,
//             owner: "admin",
//             category: "senderismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Casco de ciclismo ultraligero",
//             description: "Casco aerodinámico y ultraligero con ventilación avanzada para mayor comodidad.",
//             price: 55,
//             code: 27345,
//             stock: 30,
//             status: true,
//             owner: "admin",
//             category: "ciclismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Guantes de ciclismo antideslizantes",
//             description: "Guantes acolchados con tecnología antideslizante, ideales para largas rutas en bicicleta.",
//             price: 25,
//             code: 86432,
//             stock: 20,
//             status: true,
//             owner: "admin",
//             category: "ciclismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Luz delantera LED para bicicleta",
//             description: "Luz LED recargable para bicicleta, con múltiples modos de iluminación para seguridad nocturna.",
//             price: 30,
//             code: 15463,
//             stock: 28,
//             status: true,
//             owner: "admin",
//             category: "ciclismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Bidón de agua de 750ml",
//             description: "Bidón de agua de 750ml con boquilla ergonómica, ideal para hidratación en rutas largas.",
//             price: 15,
//             code: 59874,
//             stock: 35,
//             status: true,
//             owner: "admin",
//             category: "ciclismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Cámara de repuesto para bicicleta",
//             description: "Cámara de aire resistente para bicicletas de montaña o carretera, fácil de instalar.",
//             price: 12,
//             code: 76523,
//             stock: 32,
//             status: true,
//             owner: "admin",
//             category: "ciclismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Gafas de ciclismo con protección UV",
//             description: "Gafas deportivas con lentes polarizados y protección UV para rutas bajo el sol.",
//             price: 40,
//             code: 45182,
//             stock: 19,
//             status: true,
//             owner: "admin",
//             category: "ciclismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Maillot de ciclismo transpirable",
//             description: "Maillot ligero y transpirable, con bolsillo trasero y cierre de cremallera completa.",
//             price: 50,
//             code: 34921,
//             stock: 22,
//             status: true,
//             owner: "admin",
//             category: "ciclismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Pedales de aluminio antideslizantes",
//             description: "Pedales duraderos de aluminio con superficie antideslizante para mayor estabilidad.",
//             price: 35,
//             code: 98612,
//             stock: 27,
//             status: true,
//             owner: "admin",
//             category: "ciclismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Cámara deportiva para casco",
//             description: "Cámara de alta definición para casco, resistente al agua y con grabación continua.",
//             price: 120,
//             code: 78164,
//             stock: 12,
//             status: true,
//             owner: "admin",
//             category: "ciclismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Soporte para smartphone de bicicleta",
//             description: "Soporte ajustable para smartphone, resistente a golpes y fácil de instalar en el manillar.",
//             price: 20,
//             code: 63987,
//             stock: 25,
//             status: true,
//             owner: "admin",
//             category: "ciclismo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Máscara de buceo con visión panorámica",
//             description: "Máscara de buceo con lente panorámico y ajuste cómodo para mayor visibilidad bajo el agua.",
//             price: 50,
//             code: 51234,
//             stock: 20,
//             status: true,
//             owner: "admin",
//             category: "buceo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Aletas de buceo ajustables",
//             description: "Aletas ligeras y ajustables, diseñadas para mayor propulsión en inmersiones profundas.",
//             price: 70,
//             code: 68921,
//             stock: 18,
//             status: true,
//             owner: "admin",
//             category: "buceo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Traje de neopreno 3mm",
//             description: "Traje de neopreno de 3mm, ideal para bucear en aguas templadas con excelente aislamiento.",
//             price: 150,
//             code: 34189,
//             stock: 12,
//             status: true,
//             owner: "admin",
//             category: "buceo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Ordenador de buceo con pantalla digital",
//             description: "Ordenador de buceo con pantalla digital que monitoriza profundidad, tiempo y nivel de oxígeno.",
//             price: 300,
//             code: 74231,
//             stock: 10,
//             status: true,
//             owner: "admin",
//             category: "buceo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Chaleco compensador de flotabilidad",
//             description: "Chaleco ajustable para controlar la flotabilidad durante inmersiones de buceo.",
//             price: 180,
//             code: 23847,
//             stock: 14,
//             status: true,
//             owner: "admin",
//             category: "buceo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Regulador de buceo de alto rendimiento",
//             description: "Regulador de buceo con doble etapa, diseñado para garantizar un flujo de aire suave y constante.",
//             price: 250,
//             code: 56321,
//             stock: 16,
//             status: true,
//             owner: "admin",
//             category: "buceo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Guantes de neopreno 2mm",
//             description: "Guantes de neopreno de 2mm que ofrecen protección térmica y agarre bajo el agua.",
//             price: 25,
//             code: 69314,
//             stock: 22,
//             status: true,
//             owner: "admin",
//             category: "buceo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Linterna submarina recargable",
//             description: "Linterna de buceo recargable con alto brillo, ideal para exploraciones en aguas profundas.",
//             price: 60,
//             code: 87125,
//             stock: 25,
//             status: true,
//             owner: "admin",
//             category: "buceo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Cámara de acción para buceo",
//             description: "Cámara sumergible de alta definición, ideal para grabar vídeos en tus inmersiones.",
//             price: 200,
//             code: 47382,
//             stock: 15,
//             status: true,
//             owner: "admin",
//             category: "buceo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Snorkel ergonómico con válvula de purga",
//             description: "Snorkel diseñado ergonómicamente con válvula de purga para respiración fácil bajo el agua.",
//             price: 35,
//             code: 58923,
//             stock: 30,
//             status: true,
//             owner: "admin",
//             category: "buceo",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Arnés de escalada ajustable",
//             description: "Arnés ligero y ajustable con múltiples puntos de ajuste para mayor seguridad y comodidad.",
//             price: 85,
//             code: 52134,
//             stock: 16,
//             status: true,
//             owner: "admin",
//             category: "escalada",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Cuerda de escalada dinámica 60m",
//             description: "Cuerda dinámica de 60 metros con excelente resistencia, ideal para escalada en roca.",
//             price: 120,
//             code: 74285,
//             stock: 12,
//             status: true,
//             owner: "admin",
//             category: "escalada",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Mosquetón de seguridad con cierre automático",
//             description: "Mosquetón de acero con cierre automático, perfecto para asegurar en rutas difíciles.",
//             price: 25,
//             code: 35874,
//             stock: 28,
//             status: true,
//             owner: "admin",
//             category: "escalada",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Casco de escalada ultraligero",
//             description: "Casco resistente y ultraligero para proteger la cabeza en rutas de escalada técnicas.",
//             price: 70,
//             code: 69412,
//             stock: 18,
//             status: true,
//             owner: "admin",
//             category: "escalada",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Zapatos de escalada con suela adherente",
//             description: "Zapatos de escalada con suela de goma adherente, diseñados para máxima fricción en roca.",
//             price: 95,
//             code: 81345,
//             stock: 20,
//             status: true,
//             owner: "admin",
//             category: "escalada",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Bolsa de magnesio con cierre",
//             description: "Bolsa de magnesio con cierre ajustable, ideal para mantener las manos secas en la escalada.",
//             price: 20,
//             code: 49125,
//             stock: 32,
//             status: true,
//             owner: "admin",
//             category: "escalada",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Pies de gato para escalada en roca",
//             description: "Pies de gato con ajuste preciso y excelente adherencia para rutas en roca y boulder.",
//             price: 85,
//             code: 37489,
//             stock: 14,
//             status: true,
//             owner: "admin",
//             category: "escalada",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Cinta express para escalada deportiva",
//             description: "Cinta express ligera y resistente, diseñada para escalada deportiva y trad.",
//             price: 15,
//             code: 67832,
//             stock: 25,
//             status: true,
//             owner: "admin",
//             category: "escalada",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Descensor de escalada automático",
//             description: "Descensor con bloqueo automático para rapeles seguros y controlados en escalada.",
//             price: 60,
//             code: 92517,
//             stock: 10,
//             status: true,
//             owner: "admin",
//             category: "escalada",
//             thumbnails: "https://picsum.photos/600/400"
//         },
//         {
//             title: "Guantes de escalada resistentes",
//             description: "Guantes de protección para escalada, diseñados para rutas largas y aseguramientos cómodos.",
//             price: 35,
//             code: 15673,
//             stock: 22,
//             status: true,
//             owner: "admin",
//             category: "escalada",
//             thumbnails: "https://picsum.photos/600/400"
//         }
//     ]
//     export const connectionDBproducts=async()=>{
//         try {
//             await mongoose.connect(
//             "mongodb+srv://gabriela:wO2Mjvm7zojeyD7T@cluster0testgaby.l3ofz0y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0TestGaby",
//             {
//                 dbName: "ecommerce"
//             }
//             )
//             console.log("DB conectada...!!!")
//             await mongoose.connection.collection("products").deleteMany({});
//             console.log("Todos los documentos de la colección 'products' han sido eliminados.");

//             await productsModel.insertMany(products)
//             console.log("Nuevos productos han sido insertados.");

//         } catch (error) {
//             throw new Error(`Error al conectar a DB: ${error}`)
//         }
//     }
//     connectionDBproducts()


// ---------------- carts  ---------------------------//

//     export const connectionDBCarts=async()=>{
//         try {
//             await mongoose.connect(
//             "mongodb+srv://gabriela:wO2Mjvm7zojeyD7T@cluster0testgaby.l3ofz0y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0TestGaby",
//             {
//                 dbName: "ecommerce"
//             }
//             )
//             console.log("DB conectada...!!!")
//             await mongoose.connection.collection("carts").deleteMany({});
//             console.log("Todos los documentos de la colección 'carts' han sido eliminados.");

//         } catch (error) {
//             throw new Error(`Error al conectar a DB: ${error}`)
//         }
//     }
//     connectionDBCarts()


// ---------------- users  ---------------------------//

// export const connectionDBusers=async()=>{
//     try {
//         await mongoose.connect(
//         "mongodb+srv://gabriela:wO2Mjvm7zojeyD7T@cluster0testgaby.l3ofz0y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0TestGaby",
//         {
//             dbName: "ecommerce"
//         }
//         )
//         console.log("DB conectada...!!!")
//         await mongoose.connection.collection("users").deleteMany({});
//         console.log("Todos los documentos de la colección 'users' han sido eliminados.");

//     } catch (error) {
//         throw new Error(`Error al conectar a DB: ${error}`)
//     }
// }
//     connectionDBusers()


// ---------------- tickets  ---------------------------//

// export const connectionDBtickets=async()=>{
//     try {
//         await mongoose.connect(
//         "mongodb+srv://gabriela:wO2Mjvm7zojeyD7T@cluster0testgaby.l3ofz0y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0TestGaby",
//         {
//             dbName: "ecommerce"
//         }
//         )
//         console.log("DB conectada...!!!")
//         await mongoose.connection.collection("tickets").deleteMany({});
//         console.log("Todos los documentos de la colección 'tickets' han sido eliminados.");

//     } catch (error) {
//         throw new Error(`Error al conectar a DB: ${error}`)
//     }
// }
//     connectionDBtickets()


