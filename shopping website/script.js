const productContainer = document.querySelector(".product-list");
const isProductDetailPage = document.querySelector(".product-detail");
const isCartPage = document.querySelector(".cart");

if (productContainer) {
    displayProducts();
} else if (isProductDetailPage) {
    displayProductDetail();
} else if (isCartPage){
    displayCart();
}

function displayProducts() {
    // Clear container before rendering (if needed)
    productContainer.innerHTML = "";

    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
            <div class="img-box">
                <img src="${product.colors[0].mainImage}">
            </div>
            <h2 class="title">${product.title}</h2>
            <span class="price">${product.price}</span>
        `;
        productContainer.appendChild(productCard);

        const imgBox = productCard.querySelector(".img-box");
        imgBox.addEventListener("click", () => {
            sessionStorage.setItem("selectedProduct", JSON.stringify(product));
            window.location.href = "product-detail.html";
        });
    });
}

function displayProductDetail() {
    const productData = JSON.parse(sessionStorage.getItem("selectedProduct"));

    const titleEl = document.querySelector(".title");
    const priceEl = document.querySelector(".price");
    const descriptionEl = document.querySelector(".description");
    const mainImageContainer = document.querySelector(".main-img");
    const thumbnailContainer = document.querySelector(".thumbnail-list");
    const colorContainer = document.querySelector(".color-options");
    const sizeContainer = document.querySelector(".size-options");
    const addToCartBtn = document.querySelector("#add-cart-btn");

    let selectedColor = productData.colors[0];
    let selectedSize = selectedColor.sizes[0];

    function updateProductDisplay(colorData) {
        if (!colorData.sizes.includes(selectedSize)) {
            selectedSize = colorData.sizes[0];
        }

        // Update main image
        mainImageContainer.innerHTML = `<img src="${colorData.mainImage}">`;

        // Update thumbnails
        thumbnailContainer.innerHTML = "";
        const allThumbnails = [colorData.mainImage, ...colorData.thumbnails.slice(0, 3)];
        allThumbnails.forEach(thumb => {
            const img = document.createElement("img");
            img.src = thumb;
            thumbnailContainer.appendChild(img);
            img.addEventListener("click", () => {
                mainImageContainer.innerHTML = `<img src="${thumb}">`;
            });
        });

        // Update color options
        colorContainer.innerHTML = "";
        productData.colors.forEach(color => {
            const img = document.createElement("img");
            img.src = color.mainImage;
            if (color.name === colorData.name) img.classList.add("selected");

            colorContainer.appendChild(img);

            img.addEventListener("click", () => {
                selectedColor = color;
                updateProductDisplay(color);
            });
        });

        // Update size options
        sizeContainer.innerHTML = "";
        colorData.sizes.forEach(size => {
            const btn = document.createElement("button");
            btn.textContent = size;
            if (size === selectedSize) btn.classList.add("selected");

            sizeContainer.appendChild(btn);

            btn.addEventListener("click", () => {
                document.querySelectorAll(".size-options button").forEach(el => el.classList.remove("selected"));
                btn.classList.add("selected");
                selectedSize = size;
            });
        });
    }

    // Set initial product info
    titleEl.textContent = productData.title;
    priceEl.textContent = productData.price;
    descriptionEl.textContent = productData.description;

    updateProductDisplay(selectedColor);

    addToCartBtn.addEventListener("click", () => {
        addToCart(productData, selectedColor, selectedSize);
    });
}

function addToCart(product, color, size) {
    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  
    const existingItem = cart.find(item =>
      item.id === product.id &&
      item.color === color.name &&
      item.size === size
    );
  
    // 🧹 Clean up price string, remove ₹ and commas
    const cleanPrice = parseFloat(
      String(product.price).replace(/[^0-9.]/g, "")
    );
  
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: cleanPrice,
        image: color.mainImage,
        color: color.name,
        size: size,
        quantity: 1
      });
    }
  
    sessionStorage.setItem("cart", JSON.stringify(cart));

    updateCartBadge();
  }
  
  function displayCart() {
    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    const cartItemsContainer = document.querySelector(".cart-items");
    const subtotalEl = document.querySelector(".subtotal");
    const grandTotalEl = document.querySelector(".grand-total");
  
    // Clear previous content
    cartItemsContainer.innerHTML = "";
  
    // Handle empty cart
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
      subtotalEl.textContent = "₹0";
      grandTotalEl.textContent = "₹0";
      return;
    }
  
    let subtotal = 0;
  
    // Loop through cart items
    cart.forEach((item, index) => {
      // Parse price and quantity safely
      let price = parseFloat(item.price);
      let quantity = parseInt(item.quantity);
  
      // If parsing fails, fall back to 0 or 1
      price = isNaN(price) ? 0 : price;
      quantity = isNaN(quantity) ? 1 : quantity;
  
      const itemTotal = price * quantity;
      subtotal += itemTotal;
  
      // Create cart item HTML
      const cartItem = document.createElement("div");
      cartItem.classList.add("cart-item");
      cartItem.innerHTML = `
        <div class="product">
          <img src="${item.image}" alt="${item.title}" style="width: 80px; height: auto;">
          <div class="item-detail">
            <p>${item.title}</p>
            <div class="size-color-box">
              <span class="size"> ${item.size || "N/A"}</span>
              <span class="color"> ${item.color || "N/A"}</span>
            </div>
          </div>
        </div>
        <span class="price">₹${price.toFixed(2)}</span>
        <div class="quantity">
          <input type="number" value="${quantity}" min="1" data-index="${index}">
        </div>
        <span class="total-price">₹${itemTotal.toFixed(2)}</span>
        <button class="remove" data-index="${index}">
          <i class="ri-close-line"></i>
        </button>
      `;
  
      cartItemsContainer.appendChild(cartItem);
    });
  
    // Update totals
    subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    grandTotalEl.textContent = `₹${subtotal.toFixed(2)}`;

    removeCartItem();
    updateCartQuantity();
  }
  function removeCartItem(){
    document.querySelectorAll(".remove").forEach(button => {
        button.addEventListener("click", function(){
            let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
            const index = this.getAttribute("data-index");
            cart.splice(index, 1);
            sessionStorage.setItem("cart", JSON.stringify(cart));
            displayCart();
            updateCartBadge();
        });
    });
  }
  function updateCartQuantity() {
    document.querySelectorAll(".quantity input").forEach(input => {
        input.addEventListener("change", function(){
            let cart =JSON.parse(sessionStorage.getItem("cart")) || [];
            const index =this.getAttribute("data-index");
            cart[index].quantity = parseInt(this.value);
            sessionStorage.setItem("cart", JSON.stringify(cart));
            displayCart();
            updateCartBadge();
        });
    });
  }
  
  function updateCartBadge(){
    const cart =JSON.parse(sessionStorage.getItem("cart")) || [];
    const cartCount = cart.reduce((total,item) => total + item.quantity,0);
    const badge =document.querySelector(".cart-item-count");

    if(badge){
        if(cartCount > 0){
            badge.textContent =cartCount;
            badge.style.display ="block";
        }else{
            badge.style.display ="none";
        }
    }
  }
  updateCartBadge();