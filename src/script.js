document.addEventListener('DOMContentLoaded', async () => {
    const productList = document.getElementById('productList');
    const cartCountSpan = document.getElementById('cartCount');
    const cartDrawer = document.getElementById('cartDrawer');
    const closeCartButton = document.getElementById('closeCart');
    const headerCartButton = document.getElementById('cartButton');
    const cartItemsList = document.getElementById('cartItems');
    const cartTotal = document.createElement('p');
    const viewScreen = document.getElementById('viewScreen');
    cartTotal.classList.add('cart-total');
    cartDrawer.appendChild(cartTotal);

    let cartItemCount = 0;
    const cartItems = [];
    let products = [];

    const loadingSpinner = document.createElement('div');
    loadingSpinner.classList.add('loading-spinner');
    document.body.appendChild(loadingSpinner);

    try {
        const getData = await fetch('https://fakestoreapi.com/products');
        products = await getData.json();

        document.body.removeChild(loadingSpinner);

        if (products.length === 0) {
            const noDataMessage = document.createElement('p');
            noDataMessage.textContent = 'No products available.';
            productList.appendChild(noDataMessage);
        } else {
            products.forEach(product => {
                console.log(product,"=====>")
                const productDiv = document.createElement('div');
                productDiv.classList.add('product');
                productDiv.innerHTML = `
                    <img class='productImage' src="${product.image}" alt="${product.title}">
                    <p class='productCategory'>${product.category}</p>
                    <p class='productTitle'>${product.title}</p>
                    <p class='productDescription'>${product.description}</p>
                    <p class='productRating'> <span> ${product.rating.rate} *</span> (${product.rating.count} reviews)</p>
                    <p class='productPrice' >$${product.price}</p>
                    <div class='buttonDiv'>
                    <button data-id="${product.id}" class="addToCartButton">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <button data-id="${product.id}" class="viewButton">View</button>
                    </div>
                   
                `;
                productList.appendChild(productDiv);
            });

            const addToCartButtons = document.querySelectorAll('.addToCartButton');
            addToCartButtons.forEach(button => {
                button.addEventListener('click', addToCart);
            });

            const viewButtons = document.querySelectorAll('.viewButton');
            viewButtons.forEach(button => {
                button.addEventListener('click', openViewPage);
            });
        }
    } catch (error) {
        document.body.removeChild(loadingSpinner);

        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'An error occurred while fetching products.';
        productList.appendChild(errorMessage);
        console.error('Error fetching products:', error);
    }

    closeCartButton.addEventListener('click', () => {
        cartDrawer.classList.remove('show');
    });

    headerCartButton.addEventListener('click', () => {
        updateCartDrawer();
        cartDrawer.classList.add('show');
    });

    async function openViewPage(event) {
        const selectedItemId = event.target.closest('button').getAttribute('data-id');
        try {
            const fetchSelecteditemData = await fetch(`https://fakestoreapi.com/products/${selectedItemId}`);
            const response = await fetchSelecteditemData.json();
            productList.style.display = 'none';
            viewScreen.innerHTML = '';  

            const createNewDiv = document.createElement('div');
            createNewDiv.innerHTML = `
                <div class='viewItemContainer'>
                    <div class='leftContentDiv'>
                    <div class='leftContentImgDiv'>
                    <img class='cart-item-image' src="${response.image}" alt="${response.title}">
                    </div>
                       
                        <div class='leftContentButtonDiv'>
                            <button>Buy</button>
                            <button id="viewAddToCart" class="addToCartButton" data-id="${response.id}">Add to Cart</button>
                        </div>
                    </div>
                    <div class='viewRightContent'>
                        <p class='viewTitle'>${response.title}</p>
                        <p class='viewDiscription'>${response.description}</p>
                        <p class='viewRating'><span class='viewSpan'>* ${response.rating.rate}</span> Rating & (${response.rating.count} reviews)</p>
                        <p class='viewPrice'>$${response.price}</p>
                    </div>
                </div>
            `;
            viewScreen.appendChild(createNewDiv);

           
            const viewAddToCartButton = document.getElementById('viewAddToCart');
            viewAddToCartButton.addEventListener('click', addToCart);
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    }

    function addToCart(event) {
        const productId = event.target.closest('button').getAttribute('data-id');
        const selectedProduct = products.find(product => product.id == productId);

        const existingCartItem = cartItems.find(item => item.id == productId);
        if (existingCartItem) {
            existingCartItem.quantity++;
        } else {
            cartItems.push({ id: productId, title: selectedProduct.title, price: selectedProduct.price, quantity: 1, image: selectedProduct.image });
            cartItemCount++;
        }

        updateCartCountDisplay();
        updateCartDrawer();
    }

    function updateCartDrawer() {
        cartItemsList.innerHTML = '';

        cartItems.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <div class='cart-item-image'><img  src="${item.image}" alt="${item.title}"></div>
                <div class='additemContent'>
                    <div class='additemContentHeading'>${item.title}</div>
                    <div>
                        <button class="quantity-control" style='border-radius:50%;background:white;' data-id="${item.id}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-control" data-id="${item.id}" data-action="increase"  style='border-radius:50%;background:white;' >+</button>
                    </div>
                    <div>
                        <span>$${item.price * item.quantity}</span>
                    </div>
                    <div><button class="remove-item" data-id="${item.id}">Remove</button></div>
                </div>
            `;
            cartItemsList.appendChild(cartItem);
        });

        updateTotalDisplay();

        const quantityControlButtons = document.querySelectorAll('.quantity-control');
        quantityControlButtons.forEach(button => {
            button.addEventListener('click', adjustQuantity);
        });

        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach(button => {
            button.addEventListener('click', removeItem);
        });
    }

    function adjustQuantity(event) {
        const productId = event.target.getAttribute('data-id');
        const action = event.target.getAttribute('data-action');
        const item = cartItems.find(item => item.id == productId);
        if (action === 'decrease' && item.quantity > 1) {
            item.quantity--;
            // cartItemCount--;
        } else if (action === 'increase') {
            item.quantity++;
            // cartItemCount++;
        }
        updateCartCountDisplay();
        updateCartDrawer();
    }

    function removeItem(event) {
        const productId = event.target.getAttribute('data-id');
        const index = cartItems.findIndex(item => item.id == productId);
        if (index !== -1) {
            cartItemCount -= cartItems[index].quantity;
            cartItems.splice(index, 1);
            updateCartCountDisplay();
            updateCartDrawer();
        }
    }

    function updateCartCountDisplay() {
        cartCountSpan.textContent = cartItemCount > 0 ? cartItemCount : '';
    }

    function updateTotalDisplay() {
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    }
});
