import { usersModel } from './models/usersModel.js'

export class UsersMongoDAO{

    async getAll(propFilter={}){
        return await usersModel.find(propFilter={}).lean()
    }

    async getOneBy(propFilter={}){
        return await usersModel.findOne(propFilter).populate("tickets").lean()
    }   

    async create(newUser){
        let newUserCreated= await usersModel.create(newUser)
        return newUserCreated.toJSON()
    }  

    async push(uid,itemToUpdate){
        let query;
        if(itemToUpdate.hasOwnProperty('purchaser')){
            let orderTicket = itemToUpdate._id
            query = {$push:{tickets:orderTicket}}
        }else if(itemToUpdate.hasOwnProperty('reference')){
            let document = itemToUpdate
            query={$push:{documents:document}}
        }else{
            let ownedProduct = itemToUpdate
            query = {$push:{productsOwned:ownedProduct}}
        }

        return await usersModel.findByIdAndUpdate(
            uid,
            query,
            {runValidators:true, returnDocument:'after'}
        )
    }

    async pull(uid,ownedProduct){
        return await usersModel.findByIdAndUpdate(
            uid,
            {$pull:{productsOwned:ownedProduct}},
            {runValidators:true, returnDocument:'after'}
        )
    }

    async update(uid,updatedData){
        return await usersModel.findOneAndUpdate(
            uid, updatedData, { new: true }
        )
    }

    async deleteById(uid){
        return await usersModel.findByIdAndDelete(uid)
    }

    async deleteMany(cutOffTiming){
        return await usersModel.deleteMany({last_connection: {$lt:cutOffTiming}})
    }
}