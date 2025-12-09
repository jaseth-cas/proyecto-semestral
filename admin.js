// ---------------------------
//  PAQUETES INICIALES (solo si no existen en localStorage)
// ---------------------------

const paquetesIniciales = [
    {
        titulo: "El Valle de Antón Aventura",
        descripcion: "Explora el único pueblo dentro de un cráter volcánico. Cascadas, mercados artesanales y naturaleza exuberante.",
        precio: 499,
        imagenes: [
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=600&fit=crop"
        ],
        miniatura: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
        caracteristicas: [
            "Trekking",
            "Hotel 4★",
            "Alimentación incluida",
            "Transporte"
        ]
    },
    {
        titulo: "Playas del Pacífico Premium",
        descripcion: "Relájate en las mejores playas de Coclé. Arena dorada, deportes acuáticos y gastronomía local excepcional.",
        precio: 699,
        imagenes: [
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
        ],
        miniatura: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200&h=200&fit=crop",
        caracteristicas: [
            "Playa privada",
            "Todo incluido",
            "Deportes acuáticos",
            "Spa"
        ]
    },
    {
        titulo: "Ruta Cultural Coclesana",
        descripcion: "Sumérgete en la historia y tradiciones de Coclé. Iglesias coloniales, artesanías y gastronomía auténtica.",
        precio: 399,
        imagenes: [
            "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1533669955142-6a73332af4db?w=800&h=600&fit=crop"
        ],
        miniatura: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&h=200&fit=crop",
        caracteristicas: [
            "Historia",
            "Artesanía",
            "Gastronomía",
            "Fotografía"
        ]
    },
    {
        titulo: "Ecoturismo Extremo",
        descripcion: "Para los aventureros de corazón. Canopy, rappel en cascadas, kayaking y camping bajo las estrellas.",
        precio: 599,
        imagenes: [
            "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop"
        ],
        miniatura: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=200&h=200&fit=crop",
        caracteristicas: [
            "Escalada",
            "Canopy",
            "Camping",
            "Kayaking"
        ]
    }
];

// Si no hay paquetes guardados, agregar los iniciales
if (!localStorage.getItem("paquetes")) {
    localStorage.setItem("paquetes", JSON.stringify(paquetesIniciales));
}

// ---------------------------
//  AUTOCORRECCIÓN DE PAQUETES
// ---------------------------

function corregirPaquete(p) {
    if (!p || typeof p !== "object") return null;

    return {
        titulo: p.titulo ? String(p.titulo).trim() : "Paquete sin nombre",
        descripcion: p.descripcion ? String(p.descripcion).trim() : "Sin descripción",
        precio: Number(p.precio) || 0,

        imagenes: Array.isArray(p.imagenes)
            ? p.imagenes.filter(x => x && x.length > 5)
            : ["https://via.placeholder.com/800x600?text=Sin+imagen"],

        miniatura: p.miniatura || (Array.isArray(p.imagenes) ? p.imagenes[0] : ""),

        // 🔹 AHORA SOLO ARRAY DE STRINGS
        caracteristicas: Array.isArray(p.caracteristicas)
            ? p.caracteristicas
                .map(c => String(c).trim())
                .filter(c => c !== "")
            : []
    };
}

// ---------------------------
//  CARGAR / GUARDAR PAQUETES
// ---------------------------

function cargarPaquetes() {
    let data = JSON.parse(localStorage.getItem("paquetes"));

    if (!Array.isArray(data)) return [];

    return data.map(p => corregirPaquete(p));
}

function guardarPaquetes(paquetes) {
    localStorage.setItem("paquetes", JSON.stringify(paquetes));
}

let paquetes = cargarPaquetes();

// ---------------------------
//  MOSTRAR LISTA EN PANEL
// ---------------------------

function mostrarPaquetes() {
    const contenedor = document.getElementById("listaPaquetes");
    contenedor.innerHTML = "";

    paquetes.forEach((p, index) => {
        contenedor.innerHTML += `
            <div class="admin-card">
                <h3>${p.titulo}</h3>

                <p><strong>Imágenes:</strong> ${p.imagenes.length}</p>
                <p><strong>Características:</strong> ${p.caracteristicas.length}</p>

                <strong>$${p.precio}</strong>

                <div class="btn-group">
                    <button class="btn-edit" onclick="editarPaquete(${index})">Editar</button>
                    <button class="btn-delete" onclick="eliminarPaquete(${index})">Eliminar</button>
                </div>
            </div>
        `;
    });
}

mostrarPaquetes();

// ---------------------------
//  GUARDAR O EDITAR
// ---------------------------

document.getElementById("btnGuardar").addEventListener("click", () => {
    const titulo = document.getElementById("titulo").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const precio = Number(document.getElementById("precio").value);
    const imagenesTxt = document.getElementById("imagenes").value.trim();
    const caracteristicasTxt = document.getElementById("caracteristicas").value.trim();
    const editIndex = document.getElementById("editIndex").value;

    if (!titulo || !descripcion || !precio || !imagenesTxt || !caracteristicasTxt) {
        alert("Completa todos los campos");
        return;
    }

    // URLs de imágenes, una por línea
    const imagenes = imagenesTxt
        .split("\n")
        .map(x => x.trim())
        .filter(x => x !== "");

    // 🔹 Características: UNA POR LÍNEA, solo texto
    const caracteristicas = caracteristicasTxt
        .split("\n")
        .map(l => l.trim())
        .filter(l => l !== "");

    const paquete = corregirPaquete({
        titulo,
        descripcion,
        precio,
        imagenes,
        miniatura: imagenes[0],
        caracteristicas
    });

    if (editIndex === "") {
        paquetes.push(paquete);
    } else {
        paquetes[editIndex] = paquete;
    }

    guardarPaquetes(paquetes);
    mostrarPaquetes();
    resetFormulario();
});

// ---------------------------
//  EDITAR
// ---------------------------

function editarPaquete(index) {
    const p = paquetes[index];

    document.getElementById("titulo").value = p.titulo;
    document.getElementById("descripcion").value = p.descripcion;
    document.getElementById("precio").value = p.precio;
    document.getElementById("imagenes").value = p.imagenes.join("\n");

    // 🔹 Volvemos a poner una característica por línea
    document.getElementById("caracteristicas").value = p.caracteristicas.join("\n");

    document.getElementById("formTitle").textContent = "Editar Paquete";
    document.getElementById("editIndex").value = index;
}

// ---------------------------
//  ELIMINAR
// ---------------------------

function eliminarPaquete(index) {
    if (confirm("¿Eliminar paquete?")) {
        paquetes.splice(index, 1);
        guardarPaquetes(paquetes);
        mostrarPaquetes();
    }
}

// ---------------------------
//  RESET FORM
// ---------------------------

function resetFormulario() {
    document.getElementById("titulo").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("imagenes").value = "";
    document.getElementById("caracteristicas").value = "";
    document.getElementById("editIndex").value = "";
    document.getElementById("formTitle").textContent = "Agregar Paquete";
}

// ---------------------------
//  LOGOUT
// ---------------------------

document.getElementById("btnLogout").addEventListener("click", () => {
    localStorage.removeItem("logueado");
    localStorage.removeItem("rol");
    window.location.href = "login.html";
});
