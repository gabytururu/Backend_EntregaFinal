import { usersModel } from './models/usersModel.js'

export class UsersMongoDAO{

    async getAll(){
       // return await usersModel.find().populate("cart").populate("productsOwned").populate("tickets").lean()
        return await usersModel.find().lean()
    }

    async getOneBy(propFilter={}){
        //decide if with/without population
        //return await usersModel.findOne(propFilter).populate("cart").populate("tickets.orderTicket").populate("productsOwned.ownedProduct").lean()
        //return await usersModel.findOne(propFilter).populate("cart").populate("productsOwned.ownedProduct").lean()
       // return await usersModel.findOne(propFilter).populate("productsOwned").lean()
        return await usersModel.findOne(propFilter).populate("cart").lean()
    }   

    async create(newUser){
        let newUserCreated= await usersModel.create(newUser)
        return newUserCreated.toJSON()
    }  

    //new conditional added - (hasownprop reference) - testing pending on the other conditionals to verify none of them broke
    async push(uid,itemToUpdate){
        let query;
        //console.log se usa para debugear el cambio de itemstoupdate a objeto simple como lo hice con owned product y evitar el _id adicional en cada push de ticket y document
        console.log('el item to update que llega a DAO-->',itemToUpdate)
        if(itemToUpdate.hasOwnProperty('purchaser')){
            let orderTicket = itemToUpdate._id
            //query = {$push:{tickets:{orderTicket}}}
            query = {$push:{tickets:orderTicket}}
        }else if(itemToUpdate.hasOwnProperty('reference')){
            let document = itemToUpdate
           //query={$push:{documents:{document}}}
            query={$push:{documents:document}}
        }else{
            let ownedProduct = itemToUpdate
           // query = {$push:{productsOwned:{ownedProduct}}}
            query = {$push:{productsOwned:ownedProduct}}
        }

        return await usersModel.findByIdAndUpdate(
            uid,
            query,
            {runValidators:true, returnDocument:'after'}
        )
    }

    async remove(uid,ownedProduct){
        return await usersModel.findByIdAndUpdate(
            uid,
            {$pull:{productsOwned:{ownedProduct}}},
            {runValidators:true, returnDocument:'after'}
        )
    }

    async update(uid,updatedData){
        return await usersModel.findOneAndUpdate(
            uid, updatedData, { new: true }
        )
    }

    async delete(cutOffTiming){
        console.log("la last connection limit en el DAO DELETE:",cutOffTiming)
       // return await usersModel.deleteMany({last_connection: {$lt:lastConnectionLimit}})
    }


    // async addTicketToUser(uid,orderTicket){
    //     return await usersModel.findByIdAndUpdate(
    //         uid,
    //         {$push:{tickets:{orderTicket}}},
    //         {runValidators:true, returnDocument:'after'}
    //     )       
    // }

    // async addProductToOwner(uid,ownedProduct){
    //     return await usersModel.findByIdAndUpdate(
    //         uid,
    //         {$push:{productsOwned:{ownedProduct}}},
    //         {runValidators:true, returnDocument:'after'}
    //     )
    // }
}