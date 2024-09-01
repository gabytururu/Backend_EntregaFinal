const userForm = document.querySelector("#getUser")
const displayUser =async (e)=>{
    e.preventDefault();   
    const uid = document.querySelector("#userId").value
    const response = await fetch(`/api/users/${uid}`)
    const data=  await response.json()
    const {first_name, last_name,email, rol, tickets, productsOwned,last_connection} = data.payload

    const today = new Date()
    const lastConn = new Date(last_connection)
    const daysLastConn= (today - lastConn)/(1000*60*60*24)
    let hoursLastConn;
    if(daysLastConn<1) hoursLastConn= daysLastConn*24

    const userDiv = document.querySelector("#userContainer")
    userDiv.innerHTML=`
        <h3>Usuario Solicitado:</h3>
        <p><strong>Nombre: </strong>${first_name}<p>
        <p><strong>Apellido: </strong>${last_name}<p>
        <p><strong>Email: </strong>${email}<p>
        <p><strong>Rol: </strong>${rol}<p>
        <p><strong>Cantidad de compras históricas(tickets): </strong>${tickets.length}<p>
        <p><strong>Cantidad de Productos Publicados (owner): </strong>${productsOwned.length}<p>
        <p><strong>Última conexión del usuario: </strong>Hace ${daysLastConn<1?
            `${hoursLastConn.toFixed(2)} horas`
        :
            `${daysLastConn.toFixed(2)} dias`
        }, | el ${last_connection}
        <p>
        
    `
}
userForm.addEventListener("submit",displayUser)









// function updateFormAction(e) {
//     console.log("function triggered")
//     e.preventDefault()
//     const uid = document.querySelector("#userId").value;
//     console.log("aca el userId elegido:", uid)
// }