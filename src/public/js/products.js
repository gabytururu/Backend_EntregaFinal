const addProdToCart= async(_id)=>{
    const cid = document.querySelector('#userCart').dataset.userCid
    const response = await fetch(`/api/carts/${cid}/products/${_id}`,{
        method:"PUT",
        headers: {
            'Content-Type': 'application/json',
        },
    })

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

const finalizePurchase = async(_id) =>{
    const cid = document.querySelector(".buyButton").dataset.userCid
    const response = await fetch(`/api/carts/${cid}/products/${_id}`,{
        method:"PUT",
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if(response.status===200){
        let payloadData = await response.json()
        console.log('la payloadData: ',payloadData)
        Swal.fire({
            text: `El producto id#${_id} fue agregado al carrito ${cid}`,
            toast: true,
            position: "center"
        })
    }  
}
