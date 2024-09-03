import { UsersMongoDAO as UsersDAO } from '../dao/usersMongoDAO.js'

class UsersService{
    constructor(dao){
        this.dao=dao
    }

    getUsers=async()=>{
        return await this.dao.getAll()
    }

    getUsersBy=async(cutOffTiming)=>{
        return await this.dao.getAll({last_connection:{$lt:cutOffTiming}})
    }

    getUserById= async(uid)=>{
        return await this.dao.getOneBy(uid)
    }

    getUserByEmail= async(email)=>{
        return await this.dao.getOneBy(email)
    }

    createUser= async(newUser)=>{
        return await this.dao.create(newUser)
    }

    addTicketToUser=async(uid,orderTicket)=>{
        return await this.dao.push(uid,orderTicket)
    }

    addProductToOwner=async(uid,ownedProduct)=>{    
        return await this.dao.push(uid,ownedProduct)
    }

    removeProductFromOwner=async(uid,ownedProduct)=>{
        console.log("el uid y typeof del servicio:",uid, typeof uid)
        console.log("el ownedProduct y typeof del servicio:",ownedProduct, typeof ownedProduct)
        return await this.dao.pull(uid,ownedProduct) 
    }

    changeUserRol=async(uid,updatedRol)=>{
        return await this.dao.update(uid,updatedRol)
    }
    changeUserPassword=async(uid,updatedPassword)=>{
        return await this.dao.update(uid,updatedPassword)
    }

    udpateUserLastConnection=async(uid, lastConnection)=>{
        return await this.dao.update(uid,lastConnection)
    }  

    addDocumentToUser=async(uid,document)=>{
        return await this.dao.push(uid,document)
    }

    changeUserDocStatus=async(uid,status)=>{
        return await this.dao.update(uid,status)
    }

    deleteSingleUser=async(uid)=>{
        return await this.dao.deleteById(uid)
    }

    deleteOldConnectionsUsers=async(cutOffTiming)=>{
        return await this.dao.deleteMany(cutOffTiming)
    }

    
}

 
export const usersService= new UsersService(new UsersDAO())