/* Funciones de formato y dibujos de la carta */
(function () {
  function gs(n) {
    const num = Math.round(Number(n) || 0);
    return "Gs. " + String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function esc(t) {
    return String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // Dibujos de línea para cada categoría (se usan cuando el producto no tiene foto)
  const ICONOS = {
    "Pizzas": '<svg viewBox="0 0 64 64"><path d="M32 58 8 14c15-8 33-8 48 0z"/><path d="M12 21c13-6 27-6 40 0"/><circle cx="26" cy="30" r="3.5"/><circle cx="38" cy="32" r="3.5"/><circle cx="31" cy="43" r="3.5"/></svg>',
    "Comidas": '<svg viewBox="0 0 64 64"><path d="M10 36c0-14 44-14 44 0z"/><path d="M8 42h48"/><path d="M10 48h44a4 4 0 0 1-4 6H14a4 4 0 0 1-4-6z"/><path d="M24 26v.01M32 24v.01M40 26v.01"/></svg>',
    "Bebidas": '<svg viewBox="0 0 64 64"><path d="M26 6h12v8l4 8v34a2 2 0 0 1-2 2H24a2 2 0 0 1-2-2V22l4-8z"/><path d="M22 30h20M22 46h20"/></svg>',
    "Postres": '<svg viewBox="0 0 64 64"><path d="M14 30h36l-4 24H18z"/><path d="M12 30c0-10 8-16 20-16s20 6 20 16"/><circle cx="32" cy="10" r="4"/></svg>'
  };
  const ICONO_DEFECTO = ICONOS["Pizzas"];

  const PALABRAS = [
    [/pizza/, "Pizzas"],
    [/postre|dulce|helad|flan|torta/, "Postres"],
    [/bebida|drink|gaseosa|cerveza|jugo|agua|refresco/, "Bebidas"],
    [/comida|food|empanada|lomito|hamburg|sandw|plato|minuta/, "Comidas"]
  ];

  function icono(categoria) {
    if (ICONOS[categoria]) return ICONOS[categoria];
    const t = String(categoria || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const hit = PALABRAS.find(([re]) => re.test(t));
    return hit ? ICONOS[hit[1]] : ICONO_DEFECTO;
  }

  window.Comun = { gs, esc, icono };
})();
