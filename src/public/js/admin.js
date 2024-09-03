const userForm = document.querySelector("#getUser");
const changeRolButton=document.querySelector("#changeUserRol");
const deleteUserButton= document.querySelector('#deleteUser')
let uid=null;
let userRol=null;

const displayUser =async (e)=>{
    e.preventDefault();   
    uid = document.querySelector("#userId").value

    try {
        const response = await fetch(`/api/users/${uid}`)
        const data=  await response.json()

        if(response.status===400){
            Swal.fire({
                icon: "error",
                title: "Operacion no completada",
                text: "El formato del id# proporcionado no es válido - intenta nuevamente",
              });
              return
        }
        if(response.status===404){
            Swal.fire({
                icon: "error",
                title: "Operacion no completada",
                text: "El id# proporcionado no está asociado a ningún usuario - intenta nuevamente",
              });
            return
        }
        
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
        return
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error de Procesamiento (500)",
            text: "El servidor no pudo procesar su solicitud. Por favor verifique la información e intente nuevamente",
            footer:error.message
          });
          return
    }
}

const changeUserRol=async()=>{
    if(uid=== null){
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
    if(response.status === 400){
        Swal.fire({
            icon: "error",
            title: "Operación Cancelada",
            text: "No es posible cambiar el rol a premium. El usuario id# es inválido, o no ha enviado aún toda la documentación requerida.",
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

const deleteUser=async()=>{
    if(uid === null){
        Swal.fire({
            icon: "error",
            title: "Operacion no completada",
            text: "Debe Elegir un usuario para proceder con la eliminación.",
          });
          return
    }
    try{
        const response= await fetch(`api/users/${uid}`,{
            method:"DELETE",
            headers:{
                'Content-Type':'application/json'
            }
        })
        if(response.status===400){
            Swal.fire({
                icon: "error",
                title: "Operacion no completada",
                text: "El formato del id# proporcionado no es válido - intenta nuevamente",
              });
              return
        }
        if(response.status===404){
            Swal.fire({
                icon: "error",
                title: "Operacion no completada",
                text: "El id# proporcionado no está asociado a ningún usuario - intenta nuevamente",
              });
              return
        }

        const data= await response.json()
        const email = data.payload.email
        Swal.fire({
            position: "center",
            icon: "success",
            title: "Operación Exitosa",
            text:`El usuario fué borrado exitosamente. Hemos enviado un email a ${email} para notificar la accion`,
            showConfirmButton: false,
            timer: 3000
          }); 

        const userDiv = document.querySelector("#userContainer")
        userDiv.innerHTML=`
            <h3>Usuario Solicitado:</h3>
            <p>Usted aún no ha elegido ningún usuario</p>

        `
            uid=null
          return      
    }catch(error){
        Swal.fire({
            icon: "error",
            title: "Error de Procesamiento (500)",
            text: "El servidor no pudo procesar su solicitud. Por favor verifique la información e intente nuevamente",
            footer:error.message
          });
          return
    }
   
}

userForm.addEventListener("submit",displayUser)
changeRolButton.addEventListener("click",changeUserRol)
deleteUserButton.addEventListener("click",deleteUser)




