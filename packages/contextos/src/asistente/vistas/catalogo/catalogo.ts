import { Catalog } from "@a2ui/web_core/v0_9";
import { basicCatalog, type ReactComponentImplementation } from "@a2ui/react/v0_9";
import { Boton } from "#/asistente/vistas/catalogo/Boton.tsx";
import { Formulario } from "#/asistente/vistas/catalogo/Formulario.tsx";
import { Tabla } from "#/asistente/vistas/catalogo/Tabla.tsx";
import { TarjetaDatos } from "#/asistente/vistas/catalogo/TarjetaDatos.tsx";
import { TarjetaConfirmacion } from "#/asistente/vistas/catalogo/TarjetaConfirmacion.tsx";
import { TarjetaResultado } from "#/asistente/vistas/catalogo/TarjetaResultado.tsx";
import { ListaSeleccion } from "#/asistente/vistas/catalogo/ListaSeleccion.tsx";

// Mismo catalogId que el básico — el backend no tiene que cambiar el createSurface,
// solo empezar a usar los nombres de componente nuevos (Tabla/TarjetaDatos/Boton/
// TarjetaConfirmacion/Formulario/TarjetaResultado/ListaSeleccion) dentro de
// updateComponents.
export const catalogoAsistente = new Catalog<ReactComponentImplementation>(
    basicCatalog.id,
    [
        ...basicCatalog.components.values(), Tabla, TarjetaDatos, Boton, TarjetaConfirmacion, Formulario,
        TarjetaResultado, ListaSeleccion,
    ],
    [...basicCatalog.functions.values()]
);
