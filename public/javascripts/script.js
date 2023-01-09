
function addToCart(proId) {
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                let count = $('#cart-count').html()
                count = parseInt(count) + 1
                $("#cart-count").html(count)
            }
        }
    })
}

function deleteCartItem(cartId, proId) {
    $.ajax({
        url: '/delete-cart-item',
        data: {
            cart: cartId,
            product: proId
        },
        method: 'post',
        success: (response) => {
            if (response.DeletedProduct) {
                alert('Deleted Product from cart')
                location.reload()
            }
        }
    })
}


function changeQuantity(cartId, proId, userId, count) {
    let quantity = parseInt(document.getElementById(proId).innerHTML) 
    count = parseInt(count)
    console.log(userId);
    console.log(cartId);
    console.log(proId);
    console.log(count);
    

    $.ajax({
        url: '/change-product-quantity', 
        data: {
            user: userId,
            cart: cartId,
            product: proId,
            count: count,
            quantity: quantity 
        },
        method: 'post',
        success: (response) => {
            
            if (response.removeProduct) {
                alert('product Removed from cart')
                location.reload()
            } else {
                console.log(response); 
                document.getElementById(proId).innerHTML = quantity + count
                document.getElementById('total').innerHTML = response.total
            }

        }
    })
}
