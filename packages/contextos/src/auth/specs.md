# Auth

## Specs

### Rutas públicas del middleware

<!-- [auth-rutas_publicas-01] [nueva] -->
Las rutas públicas fijas (`/login`, `/auth/passkey/enlace-magico`, `/auth/reset-password`) se siguen atendiendo sin comprobar el token, igual que ahora, en todas las apps.

<!-- [auth-rutas_publicas-02] [nueva] -->
Una app puede declarar rutas públicas adicionales en su factory (`Auth.rutas_publicas: string[]`). El middleware las suma a las fijas; si la app no las declara, el comportamiento es el actual.

<!-- [auth-rutas_publicas-03] [nueva] -->
Las rutas públicas de la factory se comparan por prefijo de segmento: `/producto` cubre `/producto` y `/producto/camiseta-azul`, pero no `/productos`. La ruta `/` solo cubre la raíz exacta.

<!-- [auth-rutas_publicas-04] [nueva] -->
En una ruta pública el middleware no llama a `comprobarToken` ni redirige a `/login`, pero sí deja continuar la navegación (`next()`), de modo que los loaders de la ruta se ejecutan.
<!-- nota: hoy, en ruta pública, el middleware hace `return` sin llamar a `next()`; comprobar con react-router que ambas formas cargan la ruta y mantener la que no rompa las apps existentes -->

<!-- [auth-rutas_publicas-05] [nueva] -->
En una ruta no pública con token inválido o sin token se redirige a `/login`, igual que ahora.
