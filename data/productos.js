/* =========================================================
   CARTA DE EJEMPLO
   Solo se usa mientras no esté configurada la sucursal de Gastro
   en js/config.js, para poder ver el diseño. Con Gastro conectado,
   la carta sale de Gastro > Menú y este archivo se ignora.
   ========================================================= */
window.PRODUCTOS_INICIALES = [
  { id: "p1", codigo: "", nombre: "Pizza muzzarella", categoria: "Pizzas", descripcion: "Salsa de tomate, muzzarella y orégano.", precio: 45000, opciones: [{ nombre: "Mediana", precio: 45000 }, { nombre: "Grande", precio: 60000 }], disponible: true, imagen: "", creado: 10 },
  { id: "p2", codigo: "", nombre: "Pizza pepperoni", categoria: "Pizzas", descripcion: "Muzzarella y pepperoni.", precio: 55000, opciones: [{ nombre: "Mediana", precio: 55000 }, { nombre: "Grande", precio: 70000 }], disponible: true, imagen: "", creado: 9 },
  { id: "p3", codigo: "", nombre: "Pizza napolitana", categoria: "Pizzas", descripcion: "Muzzarella, tomate en rodajas y ajo.", precio: 50000, opciones: [], disponible: true, imagen: "", creado: 8 },
  { id: "p4", codigo: "", nombre: "Pizza cuatro quesos", categoria: "Pizzas", descripcion: "Muzzarella, queso Paraguay, parmesano y roquefort.", precio: 65000, opciones: [], disponible: false, imagen: "", creado: 7 },
  { id: "p5", codigo: "", nombre: "Empanadas", categoria: "Comidas", descripcion: "De carne o de pollo.", precio: 6000, opciones: [{ nombre: "Unidad", precio: 6000 }, { nombre: "Docena", precio: 65000 }], disponible: true, imagen: "", creado: 6 },
  { id: "p6", codigo: "", nombre: "Lomito árabe", categoria: "Comidas", descripcion: "Con papas fritas.", precio: 35000, opciones: [], disponible: true, imagen: "", creado: 5 },
  { id: "p7", codigo: "", nombre: "Gaseosa 2 L", categoria: "Bebidas", descripcion: "", precio: 15000, opciones: [], disponible: true, imagen: "", creado: 4 },
  { id: "p8", codigo: "", nombre: "Cerveza 1 L", categoria: "Bebidas", descripcion: "", precio: 18000, opciones: [], disponible: true, imagen: "", creado: 3 },
  { id: "p9", codigo: "", nombre: "Flan casero", categoria: "Postres", descripcion: "Con dulce de leche.", precio: 12000, opciones: [], disponible: true, imagen: "", creado: 2 }
];
