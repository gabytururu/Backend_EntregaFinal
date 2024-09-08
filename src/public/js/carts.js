
const checkCartDetails=(_id)=>{
        window.location.href = `/carts/${_id}`
}

const finalizarCompra = async(cid)=>{ 
        const response = await fetch(`/api/carts/${cid}/purchase`,{
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
        })
        
        if(response.status===422){
            Swal.fire({
                icon: "error",
                title: "Ooops!! Compra No Completada",
                html: `
                    <p>No pudimos completar tu compra :(</p>
                    <p>Esto ha ocurrido porque tu carrito está vacío, o no tenemos stock para surtirlo</p>
                    <h3>¡Sigue Explorando y Comprando!</h3>
                    `,
              });
        }

        if(response.status===403 || response.status===401){
            Swal.fire({
                icon: "error",
                title: "Ooops!! No podemos completar la acción",
                html: `
                    <p>Usted no está autorizado para finalizar esta compra</p>
                    <p>Sólo los usuarios "dueños" del carrito pueden finalizar la compra correspondiente a su carrito</p>
                    <h3>¡Contáctanos si consideras que esto es un error de nuestra parte y Sigue Explorando!</h3>
                    `,
              });
        }
        
        const data = await response.json()
        if(response.status===200){
            const tid = data.payload._id            
            window.location.href = `/purchase/${tid}`
        }       

}

const quitarDelCarrito = async(cid,pid)=>{
    const response = await fetch(`/api/carts/${cid}/products/${pid}`,{
        method:"DELETE",
        headers: {
            'Content-Type': 'application/json',
        },
    })
    window.location.reload();    
}