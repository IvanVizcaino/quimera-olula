# Renderizar aplicaciones Quimera en Olula

Estas son las instrucciones necesarias para adaptar una aplicación de Olula para incluir una aplicación Quimera dentro de ella. Se puede ver un ejemplo funcional en `apps/legacy_app`.

## Índice

1. Asegurarse de que el código de Quimera está actualizado
1. Preparar las dependencias
1. Preparar el servidor
1. Construir el fichero legacy.tsx
1. Añadir las rutas

### Código Quimera

Lo primero será descargar/actualizar la rama `migracion_v1` en el repositorio `quimera-mono`. Cuando la tengamos, copiamos las carpetas `apps`, `extensions` y `libs` del repositorio `quimera-mono` en la carpeta `legacy` de este repositorio.

#### Resumen
> Actualizar rama `quimera-mono/migracion_v1`
>
> Copiar carpetas `apps`, `extensions` y `libs` en `legacy`

### Preparar Dependencias

Para preparar las dependencias del cliente, debemos hacer que la aplicación pueda utilizar el código legacy. Para ello, añadimos en el `package.json` la siguiente dependencia: `"quimera": "workspace:@quimera/core@*"`. Debemos realizar un `pnpm install` después de añadirla.

Para poder renderizar los iconos necesitamos añadir a nuestro `index.html` la fuente de `Material Icons`. Para ello añadimos esta línea: `<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />` dentro de la etiqueta `head`.

Por último, necesitamos que `typescript` sea capaz de reconocer de dónde vamos a recoger los ficheros legacy. Para ello, añadimos al final del `include` dentro del `tsconfig.json` la dependencia del proyecto de la aplicación: `"../../legacy/apps/__applicacion__/src/project.ts"` sustituyendo la ruta con el nombre de nuestra aplicación.

#### Resumen
> Añadir `quimera` a las dependencias de la aplicación
>
> Añadir la fuente de `Material Icons`
>
> Incluir el fichero del proyecto en `tsconfig.json`

### Preparar Servidor

En la parte de servidor vamos a realizar un simple cambio en las dependencias de base de datos relacionadas con el login. Para ello vamos a modificar/sobreescribir el archivo `token.ini` en las dependencias de `auth`. Por defecto, las dependencias de base de datos contienen la siguiente línea: `mod: comandos.auth.token.infraestructura.bd`, que utiliza las tablas `usuarios` y `flusers` para persistir usuarios y tokens. La idea es cambiar todas por `mod: comandos.auth.token.infraestructura.bd_con_legacy`, que nos va a permitir duplicar esta información en las tablas `auth_user` y `authtoken_token`, que son las que utiliza `quimera-mono`, permitiéndonos utilizar el mismo login para ambas aplicaciones.

#### Resumen
> Cambiar las dependencias de base de datos de `auth.token` por `infraestructura.bd_con_legacy`

### Construir legacy.tsx

Este es el código que debemos incluir en `legacy.tsx`, un nuevo fichero en la raíz de la aplicación:

```ts
import { crearRouterLegacy } from "@olula/lib/router_legacy.ts";
import Quimera from "quimera";
import project from "../../../legacy/apps/base/src/project.ts";

const environment = {
  production: import.meta.env.MODE !== "development",
  getCurrentTitle: () => import.meta.env.VITE_APP_TITLE,
  inDevelopment: () => import.meta.env.MODE === "development",
  getAPIUrl: () =>
    import.meta.env.VITE_LEGACY_API_URL || "http://127.0.0.1:8006/api/",
  getUrlDict: () => JSON.parse(import.meta.env.VITE_URL_DICT ?? "{}"),
  getToken: () => {
    const tk = localStorage.getItem("token-refresco");
    return tk ? `Token ${tk}` : false;
  },
  renderHeader: false,
};

const LegacyAppComp = (
  <Quimera.App project={project} environment={environment} />
);

export const routerLegacy = crearRouterLegacy(project, LegacyAppComp);
```

#### Resumen
> Creamos un `environment`: entorno que ya teníamos en `quimera-mono`.
>
> Le añadimos `getToken`: función que te permite compartir el token con `olula` dentro de `quimera-mono`.
>
> Ponemos `renderHeader` a false: para evitar que se renderice la cabecera de `quimera-mono` y se mezcle con la nuestra.
>
> Creamos un aplicación `LegacyAppComp` de `quimera` a partir del entorno y un proyecto que hemos importado de legacy.
>
> La utilizamos para crear un `routerLegacy` que exportamos.

### Añadir las rutas

Ya solo queda añadir las rutas a nuestra aplicación. Para ello, en el fichero `main.tsx` sustituimos la variable `rutas` por la siguiente:

```ts
import { routerLegacy } from "./legacy.tsx";

// ...

const rutas = createBrowserRouter([
  {
    path: "/",
    middleware: [authMiddleware],
    Component: Vista,
    children: [...router, ...routerLegacy] as RouteObject[],
  },
]);
```

Básicamente añadimos al array de rutas el router que hemos creado en el paso anterior.

En caso de querer añadir ciertas pantallas al menú, podemos añadirlo con una ruta que esté definida en la aplicación de `quimera-mono` (siempre y cuando no esté ya definida en `olula`). Ej: `"Ventas/Pedidos Legacy": { url: "/ventas/pedidos", regla: "ventas.pedido.leer" },`.

#### Resumen
> Añadir las rutas creadas en `legacy.tsx` al router de `main.tsx`
>
> Añadir las rutas necesarias a las "router factories" de nuestra aplicación.