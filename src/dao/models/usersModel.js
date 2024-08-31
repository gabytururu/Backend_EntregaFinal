import mongoose from "mongoose";

const usersCollection = 'users'

const usersSchema = new mongoose.Schema(
    {
        first_name:String,
        last_name:String,
        email:{
            type: String,
            unique: true,
        },
        age: Number,
        password:String,
        cart:{
            type:mongoose.Types.ObjectId,
            ref:"carts"
        },
        rol:{
            type:String,
            default:"user"
        },
        docStatus:{
            type:String,
            default:"pending"
        },
        tickets: [{
                    type:mongoose.Types.ObjectId,
                    ref:"tickets"
        }],
        productsOwned:[{
                        type:mongoose.Types.ObjectId,
                        ref:"products"
        }],    
        last_connection:{
            type: Date,
            default: new Date()
        },
        //OJO AQUI... Este NO ES un mongooseTypes.objectId por ende no se puede popular. ademas de eso, la reference es una path relativa de el folder PUBLIC... quiza una mejora sria a futuro convertir esto en algo que se va a una nueva collection de mongo... de modo que el type sea un mongoose.types.objectId de ref "documents" y asi podemos enviar los datos de nombre y reference quiza deja de ser util pq ya la referencia debiera ser el doc id#... repensar y decidir.. por lo menos por ahorita funciona   
        documents:[{
        name:String,
        reference:String
        }] 
                // productsOwned: {
        //     type:[
        //         {
        //             ownedProduct:{
        //                 type:mongoose.Types.ObjectId,
        //                 ref:"products"
        //             }
        //         }
        //     ]
        // },
          // tickets: {
        //     type:[
        //         {
        //             orderTicket:{
        //                 type:mongoose.Types.ObjectId,
        //                 ref:"tickets"
        //             }
        //         }
        //     ]
        // },
        // documents:{
        //     type:[
        //         {
        //             name:String,
        //             reference:String
        //         }
        //     ]
        // }       
                    
    },
    {timestamps:true, strict:false}
)

export const usersModel = mongoose.model(
    usersCollection,
    usersSchema,
)