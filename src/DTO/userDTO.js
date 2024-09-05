export class userDTO{
    constructor(user){
        this.fullName = user.rol==="admin"?user.nombre:`${user.first_name.toUpperCase()} ${user.last_name.toUpperCase()}`
        this.email = user.email
        this.cart= user.cart
        this.rol=user.rol
        this.docStatus=user.docStatus
        this.productsOwned=user.rol==="premium" || user.rol==="user"?user.productsOwned:'N/A for admin users'
        this.tickets=user.tickets?user.tickets:'N/A'
        this.last_connection=user.last_connection
        this.id=user._id
        this.documents=user.rol==="admin"?"N/A":user.documents.map(doc=>doc.name)       
    }
}