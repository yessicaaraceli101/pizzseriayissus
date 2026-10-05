# Yissus Pizza — Sitio web

Carta online conectada al sistema **Gastro**:
- **El menú sale de Gastro > Menú** de Yissus Pizza (precios, fotos, categorías). Lo que cambiás en el sistema se ve en la web al instante.
- **Los pedidos caen en Gastro > Pedidos** como *Pendiente*, con código `WEB-XXXXXX`, y además salen por WhatsApp al 0974 276 125.
- El cliente elige **Delivery** (con dirección) o **Retiro en el local**. En Gastro se ve en la columna Tipo, y la dirección aparece en el detalle.

## Archivos
- `index.html`: la página.
- `js/config.js`: **lo único que hay que editar**.
- `js/gastro.js`: conexión con Gastro (menú y pedidos).
- `js/app.js`, `js/comun.js`, `css/estilos.css`: funcionamiento y diseño.
- `data/productos.js`: carta de ejemplo, solo mientras no esté configurada la sucursal.
- `img/`: logo e ícono.

## Antes de publicar
En `js/config.js`:
1. **`gastro.sucursalId`**: el ID de la sucursal de la pizzería. Está en Firebase → Firestore → `empresas` → `pizzeria-yissus` → `sucursales`. Copiá el ID del documento. Hasta que lo pongas, la web muestra una carta de ejemplo y los pedidos solo van por WhatsApp.
2. `direccion`, `mapa` y `mapaBusqueda`: la ubicación real de la pizzería.
3. `horarios`: los días y horas reales.
4. `instagram`: el enlace, si tienen. Si queda vacío, no se muestra.
5. `costoDelivery`: el costo del envío en Gs. Con 0 se muestra "A confirmar".

## Publicar en GitHub Pages
1. Creá un repositorio, por ejemplo `yissuspizza`.
2. Subí el contenido de esta carpeta (`index.html` y las carpetas `css`, `js`, `img` y `data`).
3. En Settings → Pages, elegí la rama `main` y guardá.

## Si algo no funciona
Abrí la web, apretá F12 y mirá la pestaña Consola.
- *"Missing or insufficient permissions"*: las reglas de Firestore no dejan leer el menú o crear pedidos para `pizzeria-yissus` sin iniciar sesión. Hay que agregar ese empresaId en las reglas, igual que para La Boletería.
- Si la carta está vacía, revisá que los platos estén cargados en Gastro > Menú con el usuario de Yissus Pizza, y que el `sucursalId` sea el correcto.
