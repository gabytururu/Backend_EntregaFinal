// --------- all products view ----------//
const addProdToCart= async(_id)=>{
    const cid = document.querySelector('#userCart').dataset.userCid
    const response = await fetch(`/api/carts/${cid}/products/${_id}`,{
        method:"PUT",
        headers: {
            'Content-Type': 'application/json',
        },
    })
   
    const data=await response.json()
    let politica="Users cannot buy their own products.Pid#66dca5bf4c3697a6d4d7ea56 Is owned by greenfreedomblueworld@gmail.com.  Hence, product cannot be added to its own cart "
    if(response.status === 500 && data.message === politica){
        Swal.fire({
            icon: "error",
            title: "Ooops!! No podemos agregar este producto a tu carrito",
            html: `
                <p>De acuerdo a nuestros registros ¡Tú eres el dueño(owner) de este producto!</p>
                <p>Por políticas internas, los usuarios no pueden comprar productos que fueron cargados y gestionados por ellos mismos (owners).</p>
                <h3>¡Contáctanos si consideras que esto es un error de nuestra parte y Sigue Explorando!</h3>
                `,
          });
    }

    if(response.status===200){
        Swal.fire({
            text: `El producto id#${_id} fue agregado a tu carrito ${cid}`,
            toast: true,
            position: "center"
        })
    }   
}


const checkProductDetails=(_id)=>{
    window.location.href = `/products/${_id}`
}

//--------single products view------------

const finalizePurchase = async(_id) =>{
    const cid = document.querySelector(".buyButton").dataset.userCid
    const response = await fetch(`/api/carts/${cid}/products/${_id}`,{
        method:"PUT",
        headers: {
            'Content-Type': 'application/json',
        },
    })
    
    const data=await response.json()
    let politica="Users cannot buy their own products.Pid#66dca5bf4c3697a6d4d7ea56 Is owned by greenfreedomblueworld@gmail.com.  Hence, product cannot be added to its own cart "
    if(response.status === 500 && data.message === politica){
        Swal.fire({
            icon: "error",
            title: "Ooops!! No podemos agregar este producto a tu carrito",
            html: `
                <p>De acuerdo a nuestros registros ¡Tú eres el dueño(owner) de este producto!</p>
                <p>Por políticas internas, los usuarios no pueden comprar productos que fueron cargados y gestionados por ellos mismos (owners).</p>
                <h3>¡Contáctanos si consideras que esto es un error de nuestra parte y Sigue Explorando!</h3>
                `,
          });
    }

    if(response.status===200){       
        Swal.fire({
            text: `El producto id#${_id} fue agregado al carrito ${cid}`,
            toast: true,
            position: "center"
        })
    }  
}


