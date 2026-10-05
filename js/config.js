/* =========================================================
   CONFIGURACIÓN DE YISSUS PIZZA
   Editá estos datos y guardá el archivo. No hace falta tocar nada más.
   ========================================================= */
window.CONFIG = {
  nombre: "Yissus Pizza",
  subtitulo: "SAPUCAI",

  // Número de WhatsApp con 595, SIN el 0, sin espacios ni guiones.
  // 0974 276 125  ->  595974276125
  whatsapp: "595974276125",
  telefonoVisible: "0974 276 125",

  // Dejalo vacío ("") si no hay Instagram: el enlace se oculta.
  instagram: "",
  direccion: "Sapucai, Paraguarí",
  mapa: "https://maps.google.com/?q=Sapucai,+Paraguarí",
  // Texto que se busca en el mapa de la sección "Dónde estamos"
  mapaBusqueda: "Sapucai, Paraguarí, Paraguay",

  // Costo del delivery en Gs. Con 0 se muestra "A confirmar".
  costoDelivery: 5000,

  // Horarios (formato 24 h). Poné null el día que está cerrado.
  horarios: {
    lunes:     null,
    martes:    { abre: "18:00", cierra: "23:30" },
    miercoles: { abre: "18:00", cierra: "23:30" },
    jueves:    { abre: "18:00", cierra: "23:30" },
    viernes:   { abre: "18:00", cierra: "00:30" },
    sabado:    { abre: "18:00", cierra: "00:30" },
    domingo:   { abre: "18:00", cierra: "23:30" }
  },

  /* =======================================================
     CONEXIÓN CON EL SISTEMA GASTRO
     La carta sale de Gastro > Menú y cada pedido cae en
     Gastro > Pedidos como "Pendiente". Si algo falla, el
     pedido igual sale por WhatsApp.
     ======================================================= */
  gastro: {
    activo: true,

    firebase: {
      apiKey: "AIzaSyAttBvD83gI770HibucrqDVzMuqLcYONNY",
      authDomain: "gastro-7c5ad.firebaseapp.com",
      projectId: "gastro-7c5ad",
      storageBucket: "gastro-7c5ad.firebasestorage.app",
      messagingSenderId: "990505475007",
      appId: "1:990505475007:web:09a5066610de6c7e81df0a"
    },

    // Empresa de Yissus Pizza en Gastro (Firestore > empresas)
    empresaId: "pizzeria-yissus",

    // ⚠️ OBLIGATORIO: ID de la sucursal de la pizzería.
    // Está en Firestore > empresas > pizzeria-yissus > sucursales.
    // Mientras diga PONER_..., la web muestra la carta de ejemplo
    // y los pedidos solo salen por WhatsApp.
    sucursalId: "sapucai",

    // Dirección del sistema Gastro (botón "Acceder"). Vacío lo oculta.
    urlSistema: "",

    // Gastro guarda los precios del menú en dólares y los muestra en Gs
    // multiplicando por esta tasa (la misma de pedidos.js: Gs 7300).
    tasaGs: 7300,

    prefijoCodigo: "WEB",
    origen: "web-yissus"
  },

  // Orden de las categorías del menú de Gastro.
  categorias: ["Pizzas", "Comidas", "Bebidas", "Postres"]
};