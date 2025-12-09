/* ---------------------------------------------------------
        VARIABLES GLOBALES
--------------------------------------------------------- */
let cart = [];
let currentSlide = 0;
let carouselPositions = [];
let gameTime = 0;
let gameMoves = 0;
let gamePairs = 0;
let gameTimer = null;
let flippedCards = [];
let matchedPairs = 0;

/* ---------------------------------------------------------
        OBTENER PAQUETES DEL ADMIN
--------------------------------------------------------- */
function obtenerPaquetesAdmin() {
    return JSON.parse(localStorage.getItem("paquetes")) || [];
}

/* ---------------------------------------------------------
        LOGIN GLOBAL
--------------------------------------------------------- */
window.login = function () {
    const usuario = document.getElementById("user").value.trim();
    const pass = document.getElementById("pass").value.trim();
    const error = document.getElementById("mensaje-error");

    if (usuario === "admin" && pass === "admin123") {
        localStorage.setItem("logueado", "true");
        localStorage.setItem("rol", "admin");
        window.location.href = "admin.html";
        return;
    }

    if (usuario === "cliente" && pass === "12345") {
        localStorage.setItem("logueado", "true");
        localStorage.setItem("rol", "user");
        window.location.href = "index.html";
        return;
    }

    error.textContent = "Usuario o contraseña incorrectos";
};

/* ---------------------------------------------------------
        DOMCONTENTLOADED (TODO LO GLOBAL AQUÍ)
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {

    /* ---- Cargar carrito ---- */
    loadCartFromStorage();
    updateCart();

    /* ---- BOTÓN DE CERRAR SESIÓN ---- */
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("logueado");
            localStorage.removeItem("rol");
            window.location.href = "login.html";
        });
    }

    /* ---- SLIDER ---- */
    startSlider();

    /* ---- JUEGO ---- */
    if (document.getElementById("gameBoard")) initGame();

    /* ---- PAQUETES DEL ADMIN ---- */
    if (document.getElementById("packagesGrid")) {
        mostrarPaquetes();
    }

    /* ---- EVENTOS GENERALES ---- */
    setupEventListeners();

    /* ---- MODAL DE BIENVENIDA ---- */
    const closeBtn = document.getElementById("closeWelcome");
    const welcomeModal = document.getElementById("welcomeModal");
    if (closeBtn && welcomeModal) {
        closeBtn.addEventListener("click", () => welcomeModal.style.display = "none");
    }

    /* ---- ICONO DEL CARRITO ---- */
    const cartIcon = document.getElementById("cartIcon");
    if (cartIcon) {
        cartIcon.addEventListener("click", (e) => {
            e.preventDefault();
            toggleCart();
        });
    }
});

/* ---------------------------------------------------------
        EVENT LISTENERS
--------------------------------------------------------- */
function setupEventListeners() {
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("navMenu");
    const chatInput = document.getElementById("chatInput");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
    }

    if (chatInput) {
        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") sendMessage();
        });
    }

    document.querySelectorAll("a[href^='#']").forEach(a => {
        a.addEventListener("click", (e) => {
            e.preventDefault();
            const target = document.querySelector(a.getAttribute("href"));
            if (target) target.scrollIntoView({ behavior: "smooth" });
        });
    });
}

/* ---------------------------------------------------------
        SLIDER AUTOMÁTICO
--------------------------------------------------------- */
function startSlider() {
    const slides = document.querySelectorAll(".slide");
    if (slides.length === 0) return;

    slides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add("active");

    setTimeout(startSlider, 5000);
}

/* ---------------------------------------------------------
        MOSTRAR PAQUETES EN LA WEB
--------------------------------------------------------- */
function mostrarPaquetes() {
    const grid = document.getElementById("packagesGrid");
    if (!grid) return;

    const paquetes = obtenerPaquetesAdmin();
    grid.innerHTML = "";

    paquetes.forEach((p, index) => {
        const card = document.createElement("div");
        card.className = "package-card";

        card.innerHTML = `
            <div class="package-carousel" data-package="${index}">
                ${p.imagenes.map(img => `<img src="${img}" class="carousel-image">`).join("")}
                <button class="carousel-btn prev" onclick="moveCarousel(${index}, -1)">&#10094;</button>
                <button class="carousel-btn next" onclick="moveCarousel(${index}, 1)">&#10095;</button>
            </div>

            <div class="package-info">
                <h3>${p.titulo}</h3>
                <p>${p.descripcion}</p>

                <div class="caracteristicas-list">
                    ${p.caracteristicas.map(texto => `<span class="chip">${texto}</span>`).join("")}
                </div>

                <div class="package-footer">
                    <span class="package-price">$${p.precio}</span>
                    <button class="add-to-cart-btn"
                        onclick="addToCart('${p.titulo}', ${p.precio}, '${p.imagenes[0]}')">
                        <i class="fas fa-cart-plus"></i> Agregar
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    iniciarCarruseles();
}

/* ---------------------------------------------------------
        CARRUSEL
--------------------------------------------------------- */
let posiciones = [];

function iniciarCarruseles() {
    const carousels = document.querySelectorAll(".package-carousel");

    carousels.forEach((carousel, index) => {
        posiciones[index] = 0;

        const imgs = carousel.querySelectorAll(".carousel-image");
        imgs.forEach(img => img.style.display = "none");

        if (imgs[0]) imgs[0].style.display = "block";
    });
}

function moveCarousel(index, step) {
    const carousel = document.querySelectorAll(".package-carousel")[index];
    if (!carousel) return;

    const imgs = carousel.querySelectorAll(".carousel-image");

    posiciones[index] =
        (posiciones[index] + step + imgs.length) % imgs.length;

    imgs.forEach((img, i) => {
        img.style.display = (i === posiciones[index]) ? "block" : "none";
    });
}

/* ---------------------------------------------------------
        CARRITO COMPLETO (SIDEBAR + carrito.html)
--------------------------------------------------------- */

// Cargar carrito desde localStorage
function loadCartFromStorage() {
    const saved = localStorage.getItem("turismoCart");
    cart = saved ? JSON.parse(saved) : [];
}

// Guardar carrito
function saveCartToStorage() {
    localStorage.setItem("turismoCart", JSON.stringify(cart));
}

// Agregar producto al carrito
function addToCart(name, price, image) {
    cart.push({ id: Date.now(), name, price, image });
    saveCartToStorage();
    updateCart();
    showNotification("¡Paquete agregado al carrito!");
}

// Actualizar contenido del carrito (sidebar)
function updateCart() {
    const cartCount = document.getElementById("cartCount");
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    if (!cartCount || !cartItems || !cartTotal) return;

    cartCount.textContent = cart.length;

    if (cart.length === 0) {
        cartItems.innerHTML = `<p style='text-align:center;padding:2rem;color:#888;'>Tu carrito está vacío</p>`;
        cartTotal.textContent = "$0";
        return;
    }

    let total = 0;

    cartItems.innerHTML = cart.map(item => {
        total += item.price;
        return `
            <div class="cart-item">
                <img src="${item.image}" class="cart-item-image">
                <div>
                    <p>${item.name}</p>
                    <span>$${item.price}</span>
                </div>
                <button onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join("");

    cartTotal.textContent = `$${total}`;
}

// Remover producto del carrito
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCartToStorage();
    updateCart();

    // Si estamos en carrito.html, refrescar lista
    if (document.getElementById("cartItemsContainer")) {
        loadCartPage();
        updateCartSummary();
    }
}

// Abrir / Cerrar sidebar
function toggleCart() {
    const sidebar = document.getElementById("cartSidebar");
    sidebar.classList.toggle("active");
}

/* ---------------------------------------------------------
        SECCIÓN PARA carrito.html
--------------------------------------------------------- */

// Pintar los items en carrito.html
function loadCartPage() {
    const container = document.getElementById("cartItemsContainer");
    const emptyMsg = document.getElementById("emptyCartMessage");

    if (!container) return;

    if (cart.length === 0) {
        emptyMsg.style.display = "block";
        container.innerHTML = "";
        updateCartSummary();
        return;
    }

    emptyMsg.style.display = "none";

    container.innerHTML = cart.map(item => `
        <div class="cart-page-item">
            <img src="${item.image}" class="cart-page-item-image">
            <div class="cart-page-item-info">
                <h3>${item.name}</h3>
                <p>Paquete turístico personalizado</p>
                <span class="price">$${item.price}</span>
            </div>

            <button class="remove-cart-item-btn"
                onclick="removeFromCart(${item.id}); loadCartPage();">
                <i class="fas fa-trash"></i> Eliminar
            </button>
        </div>
    `).join("");

    updateCartSummary();
}

/* ---------------------------------------------------------
        RESUMEN DE COMPRA (subtotal, impuesto, total)
--------------------------------------------------------- */
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * 0.07; // ITBMS Panamá
    const serviceFee = cart.length > 0 ? 25 : 0;

    const summarySubtotal = document.getElementById("summarySubtotal");
    const summaryTax = document.getElementById("summaryTax");
    const summaryService = document.getElementById("summaryService");
    const summaryTotal = document.getElementById("summaryTotal");

    if (summarySubtotal) summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (summaryTax) summaryTax.textContent = `$${tax.toFixed(2)}`;
    if (summaryService) summaryService.textContent = `$${serviceFee.toFixed(2)}`;

    const finalTotal = subtotal + tax + serviceFee;
    if (summaryTotal) summaryTotal.textContent = `$${finalTotal.toFixed(2)}`;
}

/* ---------------------------------------------------------
        CUPONES DE DESCUENTO
--------------------------------------------------------- */
const discountCodes = {
    "VERANO2025": 50,
    "PROMO10": 10,
    "DESCUENTO15": 15
};

function applyCoupon() {
    const input = document.getElementById("couponInput");
    const code = input.value.trim().toUpperCase();

    if (!discountCodes[code]) {
        alert("Cupón inválido");
        return;
    }

    const discountAmount = discountCodes[code];

    let subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    let tax = subtotal * 0.07;
    let serviceFee = cart.length > 0 ? 25 : 0;

    let newTotal = subtotal + tax + serviceFee - discountAmount;

    document.getElementById("summaryTotal").textContent = `$${newTotal.toFixed(2)}`;

    showNotification(`Cupón ${code} aplicado correctamente`);

    input.value = "";
}

/* ---------------------------------------------------------
        PROCESO DE CHECKOUT
--------------------------------------------------------- */
function processCheckout() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    const total = document.getElementById("summaryTotal").textContent;

    const confirmBuy = confirm(`¿Confirmar compra por ${total}?`);

    if (confirmBuy) {
        const orderId = "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase();

        alert(`
Compra realizada con éxito 🎉

Número de orden: ${orderId}
Total pagado: ${total}
Te contactaremos en las próximas horas.
        `);

        cart = [];
        saveCartToStorage();
        updateCart();

        if (document.getElementById("cartItemsContainer")) {
            loadCartPage();
            updateCartSummary();
        }

        window.location.href = "index.html";
    }
}

/* ---------------------------------------------------------
        AUTO-CARGA PARA carrito.html
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("cartItemsContainer")) {
        loadCartFromStorage();
        loadCartPage();
        updateCartSummary();
    }
});


/* ---------------------------------------------------------
        CONTACTO
--------------------------------------------------------- */
const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();

        let isValid = true;

        const nombre = document.getElementById("nombre");
        const email = document.getElementById("email");
        const telefono = document.getElementById("telefono");
        const mensaje = document.getElementById("mensaje");

        if (nombre.value.trim().length < 3) showError("nombreError"), isValid = false;
        if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) showError("emailError"), isValid = false;
        if (telefono.value.trim().length < 7) showError("telefonoError"), isValid = false;
        if (mensaje.value.trim().length < 10) showError("mensajeError"), isValid = false;

        if (isValid) {
            alert("¡Mensaje enviado correctamente!");
            contactForm.reset();
        }
    });
}

function showError(id) {
    const err = document.getElementById(id);
    err.style.display = "block";
    setTimeout(() => err.style.display = "none", 2500);
}

/* ---------------------------------------------------------
        JUEGO
--------------------------------------------------------- */
function initGame() {
    const icons = ['🏔️','🏖️','🌊','🌴','☀️','🦜','🍹','🎒'];
    const cards = [...icons, ...icons].sort(() => Math.random() - 0.5);
    const board = document.getElementById("gameBoard");

    board.innerHTML = cards.map(icon =>
        `<div class="game-card" data-icon="${icon}" onclick="flipCard(this)">❓</div>`
    ).join("");
}

function flipCard(card) {
    if (flippedCards.length === 2 || card.classList.contains("flipped")) return;

    if (flippedCards.length === 0 && !gameTimer) {
        gameTimer = setInterval(() => {
            gameTime++;
            document.getElementById("gameTime").textContent = gameTime;
        }, 1000);
    }

    card.classList.add("flipped");
    card.textContent = card.dataset.icon;
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        gameMoves++;
        document.getElementById("gameMoves").textContent = gameMoves;
        setTimeout(checkMatch, 800);
    }
}

function checkMatch() {
    const [c1, c2] = flippedCards;

    if (c1.dataset.icon === c2.dataset.icon) {
        matchedPairs++;
        gamePairs++;
        document.getElementById("gamePairs").textContent = gamePairs;

        if (matchedPairs === 8) {
            clearInterval(gameTimer);
            alert(`🎉 ¡Felicidades! Tiempo: ${gameTime}, Movimientos: ${gameMoves}`);
        }
    } else {
        c1.classList.remove("flipped");
        c2.classList.remove("flipped");
        c1.textContent = "❓";
        c2.textContent = "❓";
    }

    flippedCards = [];
}

/* ---------------------------------------------------------
        CHATBOT
--------------------------------------------------------- */
function toggleChat() {
    const win = document.getElementById("chatWindow");
    if (win) win.classList.toggle("active");
}

function sendMessage() {
    const input = document.getElementById("chatInput");
    const msg = input.value.trim();
    if (!msg) return;

    addChatMessage(msg, "user");
    input.value = "";

    setTimeout(() => addChatMessage(getBotResponse(msg.toLowerCase()), "bot"), 500);
}

function addChatMessage(text, sender) {
    const box = document.getElementById("chatMessages");
    const div = document.createElement("div");
    div.className = `chat-message ${sender}`;
    div.textContent = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function getBotResponse(msg) {
    const responses = {
        "hola": "¡Hola! ¿En qué puedo ayudarte?",
        "paquetes": "Tenemos varios paquetes turísticos disponibles.",
        "precio": "Cada paquete muestra su precio.",
        "gracias": "¡A la orden!",
        "adios": "¡Hasta pronto!"
    };

    for (let key in responses)
        if (msg.includes(key)) return responses[key];

    return "Puedes preguntar sobre precios o paquetes.";
}

/* ---------------------------------------------------------
        NOTIFICACIONES
--------------------------------------------------------- */
function showNotification(message) {
    const div = document.createElement("div");
    div.style.cssText = `
        position:fixed;top:100px;right:20px;
        background:var(--secondary);color:white;
        padding:1rem 1.5rem;border-radius:8px;
        box-shadow:var(--shadow-lg);z-index:2000;
    `;
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}
