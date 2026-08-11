# Testing

En este documento se citarán algunas pautas y recursos para testear aplicaciones.

## Recursos

- [Vitest](https://vitest.dev/guide/): Entorno de test utilizado a lo largo del proyecto.
- [Testing-library](https://testing-library.com/docs/react-testing-library/cheatsheet): Librería que permite renderizar componentes e interactuar con ellos como si fuésemos un usuario real. Este es un cheatsheet de la API del proyecto.

## Ejemplos

Existen ejemplos de varios tipos de tests disponibles en esta base de código:

Todos los ejemplos están bajo la ruta `packages/contextos/src/`

- `/almacen/transferencias/test/maquina_listado_transferencias.test.ts`:
> En este fichero podemos encontrar cómo probar una máquina de estados sin tener que utilizar la parte de React. Se proveen algunas funciones para simplificar los tests y se muestra un estilo de pruebas mediante pipes.
>
> También podría aplicarse a cualquier lógica independiente de la interfaz.

- `/almacen/transferencias/test/maestro_listado_transferencias.test.tsx`:
> En este fichero se puede ver un ejemplo de testing de interfaces. El ejemplo incluye `render` del componente, búsqueda de elementos en la página e interacción con los mismos, así como las aserciones necesarias.
>
> Por otra parte, se puede ver el mockeo de una API, en este caso la infraestructura, para evitar que el test conecte con el servidor, proveyendo los datos necesarios para nuestra prueba.
>
> Para más información sobre los métodos de búsqueda e interacciones, utilizar el enlace de la sección recursos sobre `Testing Library`.