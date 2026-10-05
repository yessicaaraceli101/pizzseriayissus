/* =========================================================
   Conexión con el sistema Gastro (Firebase / Firestore)
   Guarda cada pedido de la web en la colección "pedidos" con el
   mismo formato que usa Gastro (assets/js/pedidos.js), así aparece
   en Gastro > Pedidos de la sucursal de La Boletería.
   ========================================================= */
(function () {
  const G = (window.CONFIG || {}).gastro || {};
  let db = null;

  function configurado() {
    return !!(G.activo &&
      window.firebase &&
      G.empresaId && !G.empresaId.startsWith("PONER_") &&
      G.sucursalId && !G.sucursalId.startsWith("PONER_"));
  }

  function iniciar() {
    if (db) return db;
    if (!configurado()) {
      if (G.activo) console.warn("[Gastro] Falta configurar empresaId y sucursalId en js/config.js. Los pedidos solo se envían por WhatsApp.");
      return null;
    }
    // App con nombre propio para no chocar con otra inicialización de Firebase
    const app = firebase.apps.find(a => a.name === "web-carta") || firebase.initializeApp(G.firebase, "web-carta");
    db = app.firestore();
    return db;
  }

  // El ID del documento es el "Código" que muestra Gastro en la tabla.
  // Usamos uno corto y legible (ej. WEB-K7P2QX) para que coincida con
  // el que recibe el cliente y se pueda buscar fácil en el sistema.
  function generarCodigo() {
    const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O/0 ni I/1
    let c = "";
    for (let i = 0; i < 6; i++) c += letras[Math.floor(Math.random() * letras.length)];
    return `${G.prefijoCodigo || "WEB"}-${c}`;
  }

  // Gastro muestra customer.address como "Dirección" en el detalle.
  // Ahí dejamos dónde se entrega y la nota para la cocina.
  function textoDireccion(p) {
    const partes = [];
    if (p.modalidad === "Delivery") partes.push(p.direccion || "Delivery (sin dirección)");
    else partes.push("Retira en el local");
    if (p.nota) partes.push(`Nota: ${p.nota}`);
    return partes.join(". ");
  }

  /**
   * Guarda el pedido. Devuelve el código (ej. "WEB-K7P2QX")
   * o null si no está configurado o no se pudo guardar.
   */
  async function enviarPedido(p) {
    const base = iniciar();
    if (!base) return null;

    const codigo = generarCodigo();

    // Mismo formato que crearPedido() de Gastro
    const doc = {
      customer: {
        name: p.nombre,
        phone: p.telefono || "",
        address: textoDireccion(p)
      },
      deliveryType: p.modalidad === "Delivery" ? "delivery" : "pickup", // Gastro: Delivery / Retiro
      status: "Pending",               // aparece como "Pendiente"
      items: p.items.map(i => ({
        name: i.opcion ? `${i.nombre} (${i.opcion})` : i.nombre,
        qty: i.cantidad,
        price: i.precio
      })),
      charges: { delivery: Number(p.envio) || 0, tax: 0 },
      created_at: new Date().toISOString(),
      empresaId: G.empresaId,
      sucursalId: G.sucursalId,

      // Datos extra: Gastro no los usa, pero quedan guardados
      origen: G.origen || "web",
      nota: p.nota || ""
    };

    // Si la conexión es mala no hacemos esperar al cliente más de 7 segundos
    const limite = new Promise((_, mal) => setTimeout(() => mal(new Error("tiempo agotado")), 7000));
    try {
      await Promise.race([base.collection("pedidos").doc(codigo).set(doc), limite]);
      return codigo;
    } catch (e) {
      console.error("[Gastro] No se pudo guardar el pedido:", e);
      if (String(e && e.message).toLowerCase().includes("permission")) {
        console.error("[Gastro] Las reglas de Firestore no permiten crear pedidos desde la web para esta empresa. Ver LEEME.md.");
      }
      return null;
    }
  }

  /* ---------------------------------------------------------
     MENÚ: lee los productos de Gastro > Menú
     Misma consulta que usa Gastro: productos de la empresa, de
     esta sucursal o sin sucursal asignada. Se queda escuchando,
     así un cambio de precio en el sistema se ve al instante.
     --------------------------------------------------------- */
  // Devuelve el primer valor cargado; el último argumento es el valor por defecto
  const primero = (...v) => {
    const x = v.slice(0, -1).find(x => x !== undefined && x !== null && x !== "");
    return x !== undefined ? x : v[v.length - 1];
  };

  function aMilisegundos(v) {
    if (!v) return 0;
    if (typeof v.toMillis === "function") return v.toMillis(); // Timestamp de Firestore
    const n = Date.parse(v);
    return isNaN(n) ? 0 : n;
  }

  // Gastro guarda el precio del menú en dólares (moneda base del sistema,
  // rates = { "US$": 1, "Gs": 7300 }). Un precio en guaraníes nunca es
  // menor a 100, así que si viene chico lo pasamos de US$ a Gs.
  function precioEnGuaranies(valor) {
    const n = Number(valor) || 0;
    const tasa = Number(G.tasaGs) || 7300;
    if (G.precioMenuEnDolares === false) return Math.round(n);
    if (G.precioMenuEnDolares === true || (n > 0 && n < 100)) return Math.round(n * tasa);
    return Math.round(n);
  }

  // Gastro guarda la categoría con un nombre interno en inglés
  const NOMBRES_CATEGORIA = {
    drinks: "Bebidas", drink: "Bebidas", beverages: "Bebidas", bebidas: "Bebidas",
    food: "Comidas", foods: "Comidas", meals: "Comidas", comidas: "Comidas", mains: "Comidas",
    desserts: "Postres", dessert: "Postres", postres: "Postres",
    pizzas: "Pizzas", pizza: "Pizzas"
  };
  function nombreCategoria(valor) {
    const t = String(valor || "").trim();
    return NOMBRES_CATEGORIA[t.toLowerCase()] || (t ? t.charAt(0).toUpperCase() + t.slice(1) : "Menú");
  }

  function normalizarProducto(id, d) {
    const nombre = primero(d.name, d.nombre, "");
    if (!nombre) return null;
    // Productos desactivados en el sistema no se muestran
    if ([d.activo, d.active, d.visible, d.mostrarEnWeb].some(v => v === false)) return null;
    return {
      id,
      nombre: String(nombre),
      precio: precioEnGuaranies(primero(d.price, d.precio, 0)),
      categoria: nombreCategoria(primero(d.category, d.categoria, d.categoryName, d.cat, "")),
      descripcion: String(primero(d.description, d.descripcion, d.desc, d.detalle, d.detail,
        d.details, d.subtitle, d.subtitulo, d.notes, d.nota, d.ingredients, d.ingredientes, d.info, "")),
      imagen: String(primero(d.image, d.imagen, d.imageUrl, d.imagenUrl, d.foto, d.img, "")),
      codigo: String(primero(d.code, d.codigo, d.sku, "")),
      disponible: !(d.disponible === false || d.available === false || d.agotado === true),
      opciones: Array.isArray(d.opciones) ? d.opciones : [],
      creado: aMilisegundos(primero(d.created_at, d.createdAt, d.creado))
    };
  }

  function escucharMenu(alRecibir, alFallar) {
    const base = iniciar();
    if (!base) return false;
    let recibido = false;
    const espera = setTimeout(() => { if (!recibido) alFallar(new Error("tiempo agotado")); }, 12000);

    base.collection("productos")
      .where("empresaId", "==", G.empresaId)
      .onSnapshot(snap => {
        recibido = true;
        clearTimeout(espera);
        const lista = [];
        snap.forEach(doc => {
          const d = doc.data();
          if (d.sucursalId && d.sucursalId !== G.sucursalId) return; // de otra sucursal
          const p = normalizarProducto(doc.id, d);
          if (p) lista.push(p);
        });
        alRecibir(lista);
      }, err => {
        clearTimeout(espera);
        console.error("[Gastro] No se pudo leer el menú:", err);
        if (String(err && err.message).toLowerCase().includes("permission")) {
          console.error("[Gastro] Las reglas de Firestore no permiten leer los productos de esta empresa desde la web. Ver LEEME.md.");
        }
        alFallar(err);
      });
    return true;
  }

  window.Gastro = { enviarPedido, escucharMenu, configurado };
})();
