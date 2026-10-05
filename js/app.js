(function () {
  const C = window.CONFIG;
  const { gs, esc, icono } = window.Comun;
  const $ = s => document.querySelector(s);

  let productos = [];
  const pedido = []; // { clave, id, nombre, opcion, precio, cantidad }

  /* ---------- Datos del local ---------- */
  $("#marcaNombre").textContent = C.nombre;
  $("#marcaSub").textContent = C.subtitulo;
  $("#direccion").textContent = C.direccion;
  $("#pieDireccion").textContent = C.direccion;
  if (C.instagram) { $("#navIg").href = C.instagram; $("#pieIg").href = C.instagram; }
  else { $("#navIg").hidden = true; $("#sepIg").hidden = true; }
  const tel = C.telefonoVisible || "";
  const telLink = "tel:+" + C.whatsapp;
  ["#telHero", "#telPie"].forEach(s => { $(s).textContent = tel; $(s).href = telLink; });
  $("#btnLlamar").href = telLink;
  const urlSistema = (C.gastro && C.gastro.urlSistema) || "";
  if (urlSistema) $("#btnAcceder").href = urlSistema;
  else $("#btnAcceder").hidden = true;
  $("#btnMapa").href = C.mapa;
  $("#mapa").src = "https://maps.google.com/maps?q=" + encodeURIComponent(C.mapaBusqueda || "Estación de Sapucai, Paraguay") + "&z=16&output=embed";
  $("#waFlotante").href = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent("¡Hola, " + C.nombre + "! Quiero hacer un pedido.")}`;
  $("#pieMapa").href = C.mapa;
  $("#pieWa").href = "https://wa.me/" + C.whatsapp;
  $("#anio").textContent = new Date().getFullYear();

  /* ---------- Horarios ---------- */
  const DIAS = [
    ["lunes", "Lunes"], ["martes", "Martes"], ["miercoles", "Miércoles"],
    ["jueves", "Jueves"], ["viernes", "Viernes"], ["sabado", "Sábado"], ["domingo", "Domingo"]
  ];
  const aMin = h => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };

  function pintarHorarios() {
    const ahora = new Date();
    const idxHoy = (ahora.getDay() + 6) % 7; // lunes = 0
    const lista = $("#listaHorarios");
    lista.innerHTML = DIAS.map(([clave, nombre], i) => {
      const h = C.horarios[clave];
      const texto = h ? `${h.abre} a ${h.cierra}` : "Cerrado";
      return `<li class="${i === idxHoy ? "hoy" : ""} ${h ? "" : "cerrado"}">
        <span>${nombre}${i === idxHoy ? " <em>hoy</em>" : ""}</span><span>${texto}</span></li>`;
    }).join("");

  }
  pintarHorarios();
  setInterval(pintarHorarios, 60000);

  /* ---------- Filtros ---------- */
  let categorias = [];
  const selCat = $("#filtroCategoria");

  // Las categorías salen de los productos; las de config.categorias van primero, en ese orden
  function armarCategorias() {
    const orden = C.categorias || [];
    categorias = [...new Set(productos.map(p => p.categoria))].sort((a, b) => {
      const ia = orden.indexOf(a), ib = orden.indexOf(b);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      return a.localeCompare(b, "es");
    });
    const actual = selCat.value;
    selCat.innerHTML = `<option value="">Todas las categorías</option>` +
      categorias.map(c => `<option>${esc(c)}</option>`).join("");
    selCat.value = categorias.includes(actual) ? actual : "";
  }

  const chips = $("#chips");
  function pintarChips() {
    const actual = selCat.value;
    chips.innerHTML = ["", ...categorias].map(cat =>
      `<button type="button" role="tab" aria-selected="${cat === actual}" data-cat="${esc(cat)}">${cat ? esc(cat) : "Todo"}</button>`
    ).join("");
  }
  chips.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    selCat.value = b.dataset.cat;
    render();
  });

  ["#buscar", "#filtroCategoria", "#orden", "#soloDisponibles"].forEach(s =>
    $(s).addEventListener(s === "#buscar" ? "input" : "change", render));

  $("#limpiarFiltros").addEventListener("click", () => {
    $("#buscar").value = ""; selCat.value = ""; $("#soloDisponibles").checked = false;
    render();
  });

  const normal = t => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  function filtrar() {
    const q = normal($("#buscar").value.trim());
    const cat = selCat.value;
    const solo = $("#soloDisponibles").checked;
    let lista = productos.filter(p =>
      (!cat || p.categoria === cat) &&
      (!solo || p.disponible) &&
      (!q || normal(p.nombre).includes(q) || normal(p.codigo).includes(q) || normal(p.descripcion).includes(q))
    );
    const orden = $("#orden").value;
    const precioBase = p => (p.opciones && p.opciones.length ? Math.min(...p.opciones.map(o => o.precio)) : p.precio);
    if (orden === "recientes") lista.sort((a, b) => (b.creado || 0) - (a.creado || 0) || a.nombre.localeCompare(b.nombre, "es"));
    if (orden === "precio-asc") lista.sort((a, b) => precioBase(a) - precioBase(b));
    if (orden === "precio-desc") lista.sort((a, b) => precioBase(b) - precioBase(a));
    if (orden === "nombre") lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    return lista;
  }

  /* ---------- Boletos (tarjetas) ---------- */
  function boleto(p) {
    const tieneOpc = p.opciones && p.opciones.length > 0;
    const precio = tieneOpc ? p.opciones[0].precio : p.precio;
    const visual = p.imagen
      ? `<img src="${esc(p.imagen)}" alt="" loading="lazy">`
      : `<span class="boleto__dibujo" aria-hidden="true">${icono(p.categoria)}</span>`;
    const selector = tieneOpc
      ? `<label class="boleto__opc"><span class="sr">Opción de ${esc(p.nombre)}</span>
           <select data-opc="${esc(p.id)}">
             ${p.opciones.map((o, i) => `<option value="${i}">${esc(o.nombre)} · ${gs(o.precio)}</option>`).join("")}
           </select></label>`
      : "";
    return `
      <article class="boleto ${p.disponible ? "" : "agotado"}" data-id="${esc(p.id)}">
        <div class="boleto__cuerpo">
          <div class="boleto__visual">${visual}</div>
          <div class="boleto__info">
            <span class="boleto__cat">${esc(p.categoria)}</span>
            <h3>${esc(p.nombre)}</h3>
            ${p.descripcion ? `<p>${esc(p.descripcion)}</p>` : ""}
            ${selector}
          </div>
        </div>
        <div class="boleto__talon">
          ${p.codigo ? `<span class="boleto__num">Nº ${esc(p.codigo)}</span>` : ""}
          <strong class="boleto__precio" data-precio="${esc(p.id)}">${gs(precio)}</strong>
          ${p.disponible
            ? `<button class="boton boton--talon" type="button" data-agregar="${esc(p.id)}">Agregar</button>`
            : `<span class="sello">Agotado hoy</span>`}
        </div>
      </article>`;
  }

  function render() {
    if (estadoCarta !== "lista") return;
    pintarChips();
    const lista = filtrar();
    $("#boletos").innerHTML = lista.map(boleto).join("");
    $("#contador").textContent = `${lista.length} ${lista.length === 1 ? "producto" : "productos"}`;
    $("#vacio").hidden = lista.length > 0;
  }

  /* ---------- Carga de la carta ---------- */
  let estadoCarta = "cargando"; // cargando | lista | error

  function recibirProductos(lista) {
    productos = lista;
    estadoCarta = "lista";
    $("#errorCarta").hidden = true;
    $(".filtros").hidden = false;
    armarCategorias();
    // Si un producto del pedido cambió de precio o se quitó del menú, lo actualizamos
    for (let i = pedido.length - 1; i >= 0; i--) {
      const p = productos.find(x => x.id === pedido[i].id);
      if (!p || !p.disponible) pedido.splice(i, 1);
      else if (!p.opciones.length) pedido[i].precio = p.precio;
    }
    pintarPedido();
    render();
  }

  function mostrarError() {
    if (estadoCarta === "lista") return; // ya había carta: dejamos la última que llegó
    estadoCarta = "error";
    $("#boletos").innerHTML = "";
    $("#contador").textContent = "";
    $("#vacio").hidden = true;
    $(".filtros").hidden = true;
    $("#chips").innerHTML = "";
    $("#errorCarta").hidden = false;
  }

  function cargarCarta() {
    $("#boletos").innerHTML = `<p class="cargando">Cargando la carta…</p>`;
    const conectado = window.Gastro && window.Gastro.escucharMenu(recibirProductos, mostrarError);
    if (!conectado) {
      // Sin IDs de Gastro configurados: carta de ejemplo para poder ver el diseño
      console.warn("[Carta] Mostrando la carta de ejemplo (data/productos.js). Configurá gastro en js/config.js para usar el menú del sistema.");
      recibirProductos(JSON.parse(JSON.stringify(window.PRODUCTOS_INICIALES || [])));
    }
  }

  $("#boletos").addEventListener("change", e => {
    const sel = e.target.closest("select[data-opc]");
    if (!sel) return;
    const p = productos.find(x => x.id === sel.dataset.opc);
    const o = p.opciones[Number(sel.value)];
    document.querySelector(`[data-precio="${CSS.escape(p.id)}"]`).textContent = gs(o.precio);
  });

  $("#boletos").addEventListener("click", e => {
    const b = e.target.closest("[data-agregar]");
    if (!b) return;
    const p = productos.find(x => x.id === b.dataset.agregar);
    const sel = document.querySelector(`select[data-opc="${CSS.escape(p.id)}"]`);
    const o = sel ? p.opciones[Number(sel.value)] : null;
    agregar(p, o);
    b.classList.add("marcado");
    b.textContent = "Agregado";
    setTimeout(() => { b.classList.remove("marcado"); b.textContent = "Agregar"; }, 1100);
  });

  /* ---------- Pedido ---------- */
  function agregar(p, o) {
    $("#pedidoListo").hidden = true;
    const clave = p.id + "|" + (o ? o.nombre : "");
    const item = pedido.find(i => i.clave === clave);
    if (item) item.cantidad++;
    else pedido.push({ clave, id: p.id, nombre: p.nombre, opcion: o ? o.nombre : "", precio: o ? o.precio : p.precio, cantidad: 1 });
    pintarPedido();
    // Pequeño salto del botón para que se note dónde está el pedido
    const flot = $("#abrirPedido");
    flot.classList.remove("salto"); void flot.offsetWidth; flot.classList.add("salto");
    avisar(`Agregaste ${p.nombre}${o ? " (" + o.nombre + ")" : ""}`);
  }

  const total = () => pedido.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const unidades = () => pedido.reduce((s, i) => s + i.cantidad, 0);

  function pintarPedido() {
    $("#listaPedido").innerHTML = pedido.map(i => `
      <li data-clave="${esc(i.clave)}">
        <div>
          <strong>${esc(i.nombre)}</strong>
          ${i.opcion ? `<small>${esc(i.opcion)}</small>` : ""}
          <small>${gs(i.precio)} c/u</small>
        </div>
        <div class="cantidad">
          <button type="button" data-menos aria-label="Quitar uno">−</button>
          <span>${i.cantidad}</span>
          <button type="button" data-mas aria-label="Agregar uno">+</button>
        </div>
      </li>`).join("");
    $("#pedidoVacio").hidden = pedido.length > 0 || !$("#pedidoListo").hidden;
    $("#formPedido").hidden = pedido.length === 0;
    const envio = envioActual();
    $("#lineaEnvio").hidden = !esDelivery();
    $("#envioPedido").textContent = envio ? gs(envio) : "A confirmar";
    $("#totalPedido").textContent = gs(total() + envio);
    const flot = $("#abrirPedido");
    flot.hidden = pedido.length === 0;
    $("#cantFlotante").textContent = unidades();
    $("#totalFlotante").textContent = gs(total());
  }

  $("#listaPedido").addEventListener("click", e => {
    const li = e.target.closest("li");
    if (!li) return;
    const idx = pedido.findIndex(i => i.clave === li.dataset.clave);
    if (e.target.closest("[data-mas]")) pedido[idx].cantidad++;
    if (e.target.closest("[data-menos]")) {
      pedido[idx].cantidad--;
      if (pedido[idx].cantidad <= 0) pedido.splice(idx, 1);
    }
    pintarPedido();
    if (!pedido.length) cerrarPedido();
  });

  function abrirPedido() {
    $("#panelPedido").classList.add("abierto");
    $("#panelPedido").setAttribute("aria-hidden", "false");
    $("#velo").hidden = false;
    $("#cerrarPedido").focus();
  }
  function cerrarPedido() {
    $("#panelPedido").classList.remove("abierto");
    $("#panelPedido").setAttribute("aria-hidden", "true");
    $("#velo").hidden = true;
  }
  $("#abrirPedido").addEventListener("click", abrirPedido);
  $("#cerrarPedido").addEventListener("click", cerrarPedido);
  $("#velo").addEventListener("click", cerrarPedido);
  document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarPedido(); });

  $("#vaciarPedido").addEventListener("click", () => { pedido.length = 0; pintarPedido(); cerrarPedido(); });

  // Delivery o retiro: la dirección solo se pide para delivery
  const esDelivery = () => document.querySelector('input[name="modalidad"]:checked').value === "Delivery";
  const envioActual = () => (pedido.length && esDelivery() ? Number(C.costoDelivery) || 0 : 0);

  function actualizarModalidad() {
    const delivery = esDelivery();
    $("#bloqueDireccion").hidden = !delivery;
    $("#direccionCliente").required = delivery;
    pintarPedido();
  }
  document.querySelectorAll('input[name="modalidad"]').forEach(r => r.addEventListener("change", actualizarModalidad));

  // El costo del delivery se ve junto a la opción, aunque esté marcado Retiro
  $("#precioDeliveryOpcion").textContent = Number(C.costoDelivery) > 0
    ? `+ ${gs(C.costoDelivery)}` : "Costo a confirmar";

  $("#formPedido").addEventListener("submit", async e => {
    e.preventDefault();
    const nombre = $("#nombreCliente").value.trim();
    if (!nombre) { $("#nombreCliente").focus(); return; }
    const modalidad = document.querySelector('input[name="modalidad"]:checked').value;
    const direccion = modalidad === "Delivery" ? $("#direccionCliente").value.trim() : "";
    if (modalidad === "Delivery" && !direccion) { $("#direccionCliente").focus(); return; }
    const envio = envioActual();
    const telefono = $("#telefonoCliente").value.trim();
    const nota = $("#nota").value.trim();
    const boton = $("#enviarPedido");

    // La ventana de WhatsApp se abre ya, antes de esperar a Gastro,
    // porque si no el navegador la bloquea como ventana emergente.
    const ventana = window.open("", "_blank");

    boton.disabled = true;
    boton.textContent = "Enviando pedido…";

    const codigo = window.Gastro
      ? await window.Gastro.enviarPedido({ nombre, telefono, modalidad, direccion, envio, nota, items: pedido, total: total() })
      : null;

    const lineas = pedido.map(i =>
      `• ${i.cantidad} x ${i.nombre}${i.opcion ? " (" + i.opcion + ")" : ""}: ${gs(i.precio * i.cantidad)}`);
    const texto = [
      `¡Hola, ${C.nombre}! Quiero hacer un pedido${codigo ? " (código " + codigo + ")" : ""}:`,
      "",
      ...lineas,
      "",
      modalidad === "Delivery" ? `Delivery: ${envio ? gs(envio) : "a confirmar"}` : null,
      `*Total: ${gs(total() + envio)}*`,
      `Modalidad: ${modalidad}`,
      direccion ? `Dirección: ${direccion}` : null,
      `Nombre: ${nombre}`,
      telefono ? `Teléfono: ${telefono}` : null,
      nota ? `Nota: ${nota}` : null
    ].filter(l => l !== null).join("\n");

    const url = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(texto)}`;
    if (ventana) ventana.location.href = url;
    else location.href = url;

    boton.disabled = false;
    boton.textContent = "Enviar pedido por WhatsApp";

    if (codigo) {
      // Pedido registrado en el sistema: vaciamos el carrito y mostramos el código
      pedido.length = 0;
      pintarPedido();
      $("#codigoListo").textContent = codigo;
      $("#pedidoListo").hidden = false;
      $("#pedidoVacio").hidden = true;
      $("#abrirPedido").hidden = true;
    }
  });

  $("#nuevoPedido").addEventListener("click", () => {
    $("#pedidoListo").hidden = true;
    $("#formPedido").reset();
    actualizarModalidad();
    cerrarPedido();
  });

  /* ---------- Aviso breve ---------- */
  let tAviso;
  function avisar(msg) {
    const a = $("#aviso");
    a.textContent = msg;
    a.classList.add("visible");
    clearTimeout(tAviso);
    tAviso = setTimeout(() => a.classList.remove("visible"), 1800);
  }

  $("#errorWa").href = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent("¡Hola, " + C.nombre + "! Quiero ver la carta.")}`;
  pintarPedido();
  cargarCarta();
})();