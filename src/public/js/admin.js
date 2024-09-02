const userForm = document.querySelector("#getUser");
const changeRolButton=document.querySelector("#changeUserRol");
let uid=null;
let userRol=null;

const displayUser =async (e)=>{
    e.preventDefault();   
    uid = document.querySelector("#userId").value
   

    //no funciona por??--------------------------------------------------------//
    console.log("el uid value aca al inicio",uid)
    if(uid=== null || uid === undefined){
        Swal.fire({
            icon: "error",
            title: "Operacion no completada",
            text: "Elija un usuario para realizar el cambio de rol.",
          });
          return
    }
        //no funciona por??--------------------------------------------------------//

    const response = await fetch(`/api/users/${uid}`)
    const data=  await response.json()
    const {first_name, last_name,email, rol, tickets, productsOwned,last_connection, _id} = data.payload

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
        <p id="rol"><strong>Rol: </strong>${rol}<p>
        <p><strong>Cantidad de compras históricas(tickets): </strong>${tickets.length}<p>
        <p><strong>Cantidad de Productos Publicados (owner): </strong>${productsOwned.length}<p>
        <p><strong>Última conexión del usuario: </strong>Hace ${daysLastConn<1?
            `${hoursLastConn.toFixed(2)} horas`
        :
            `${daysLastConn.toFixed(2)} dias`
        }, | el ${last_connection}
        <p>
          <p><strong>Id#: </strong>${_id}<p> 
    `
    document.querySelector("#userId").value = "";
}

const changeUserRol=async()=>{   
    if(uid=== null || uid === undefined){
        Swal.fire({
            icon: "error",
            title: "Operacion no completada",
            text: "Elija un usuario para realizar el cambio de rol.",
          });
          return
    }
    const response = await fetch(`api/users/premium/${uid}`,{
        method: "PUT",
        headers:{
            'Content-Type':'application/json'
        }
    })
    const data = await response.json()
    if(response.status === 400 && data.error){
        Swal.fire({
            icon: "error",
            title: "Operación Cancelada",
            text: "No es posible cambiar el rol a premium. El usuario no ha enviado toda la documentación requerida.",
          });
          return
    }

    userRol =data.payload.rol
    let rolDisplayed = document.querySelector("#rol")
    rolDisplayed.innerHTML = `
     <p id="rol"><strong>Rol: </strong>${userRol}<p>`

     Swal.fire({
        position: "center",
        icon: "success",
        title: "Operación Exitosa",
        text:`El rol del usuario fue cambiado a ${userRol}`,
        showConfirmButton: false,
        timer: 2000
      });

}
userForm.addEventListener("submit",displayUser)
changeRolButton.addEventListener("click",changeUserRol)







// function updateFormAction(e) {
//     console.log("function triggered")
//     e.preventDefault()
//     const uid = document.querySelector("#userId").value;
//     console.log("aca el userId elegido:", uid)
// }