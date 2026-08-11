# Listado con "activo" string y gestión de UrlParams

## 0. Motivación

La idea principal de este cambio es poder gestionar la URL de manera que podamos cargar una pantalla de detalle si nos viene una Id, o filtrar/ordenar un listado si nos viene un filtro. Para ello, deberemos de ser capaces de actualizar la URL cuando se den estos cambios.

## 1. Adaptar el Detalle.tsx

Como queremos cargar el detalle a partir de un Id, hay que asegurarse de que podemos cargar la información solo con este dato. Para ello, vamos a recibir un Id por props y hacer una llamada de carga a la API.

1. Convertir la prop en string

```tsx
// Lo normal sería tener una prop similar a esta
export const DetalleXXX = (
    { inicial = null }: { inicial: XXX | null },
)
// Y la transformaríamos para recibir un string
export const DetalleXXX = (
    { id }: { id?: string },
)
```

2. Quitar recolecciones de Id (ya sea de la entidad inicial o de useParams)

3. Emitir el cambio en la Id

```tsx
useEffect(() => {
    emitir("id_cambiado", id);
}, [id]);
```

4. Ya puestos, he quitado (dentro del render) la comprobación de que haya Id para renderizar, y he añadido esta línea, para no renderizar nada si no hay detalle

```tsx
if (!ctx.xxx.id) return;
```

#### Se puede ver el código completo en `contextos/crm/lead/detalle/DetalleLead.tsx`

## 2. Adaptar funcionalidad del Maestro

Para poder adaptar las nuevas funcionalidades en nuestro maestro, se han creado unas copias de algunos ficheros para poder modificarlos sin riesgo de romper las pantallas que ya están funcionando. Por tanto, tendremos que cambiar las importaciones en algunos ficheros.

1. En `diseño` del master

> Cambiar `ListaEntidades` por `ListaActivaEntidades`

```tsx
// Antes
xxx: ListaEntidades<XXX>

// Ahora
xxx: ListaActivaEntidades<XXX>
```

2. En `dominio` del master

> Cambiar `accionesListaEntidades` por `accionesListaActivaEntidades`
> 
> Cambiar `ProcesarListaEntidades` por `ProcesarListaActivaEntidades`

```tsx
// Antes
const conXXX = (fn: ProcesarListaEntidades<XXX>) =>
    (ctx: ContextoMaestroXXX) => (
        { ...ctx, xxx: fn(ctx.xxx) }
);

export const XXX = accionesListaEntidades(conXXX);

// Ahora
const conXXX = (fn: ProcesarListaActivaEntidades<XXX>) =>
    (ctx: ContextoMaestroXXX) => (
        { ...ctx, xxx: fn(ctx.xxx) }
);

export const XXX = accionesListaActivaEntidades(conXXX);
```

3. En `maquina` del master

Como una de las reformas que se han hecho incluye el Criteria del listado, dentro de `ListaActivaEntidades`, se ha incluído también una "acción" para actualizarlo . Esta es `xxx.filtrar` (similar a activar, incluir o cambiar). Por tanto, nos conviene añadir un evento en la máquina que reaccione a los cambios de criteria:

```tsx
// En estado INICIAL:

criteria_cambiado: [XXX.filtrar, recargarXXX],
```

#### Se puede ver el código completo en `contextos/crm/lead/maestro/*.ts`


## 3. Adaptar Maestro.tsx

Este sería el cambio más grande que necesitamos. Aunque sirve para simplificar en lugar de añadir complejidad.

1. Eliminar cargando. Vamos a quitar el useState de `[cargado, setCargando]` y la prop que va al listado.

2. Eliminar recargar. La función sobra si no utilizamos el cargando.

3. Obtener y actualizar los datos de la URL.

```tsx
// Obtener. Al inicio del componente
const { id, criteria } = getUrlParams();

// Actualizar. Después de crear el contexto
useUrlParams(ctx.xxx.activo, ctx.xxx.criteria);
```

4. Actualizar la lista de entidades a la lista activa y añadimos id y criteria como inicialización

```tsx
// Antes
const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    xxx: listaEntidadesInicial<XXX>(),
});

// Ahora
const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    xxx: listaActivaEntidadesInicial<XXX>(id, criteria),
});
```

5. Pedir los datos una única vez

```tsx
useEffect(() => {
    emitir("recarga_de_xxx_solicitada", ctx.xxx.criteria);
}, []);
```

6. Actualizar los componentes del render

> Cambiar `MaestroDetalleControlado` por `MaestroDetalleActivoControlado`
>
> Cambiar `ListadoControlado` por `ListadoActivoControlado`

Además cambiar el criteria inicial, por el criteria actual

```tsx
// Antes
criteriaInicial={criteriaDefecto}

// Ahora
criteria={ctx.xxx.criteria}
```

Y el callback del cambio en criteria

```tsx
// Antes
onCriteriaChanged={recargar}

// Ahora
onCriteriaChanged={
    (payload) => emitir("criteria_cambiado", payload)
}
```

7. Cambiar inicialización del Detalle

```tsx
// Antes
<Detalle activo={ctx.activo} />

// Ahora
<Detalle activo={ctx.activo} />
```

#### Se puede ver el código completo en `contextos/crm/lead/maestro/MaestroLeads.tsx`

## Conclusión

Y esto sería todo. En principio somos capaces de gestionar los datos que vienen por la URL, así como actualizarlos. Si hay algo que no funciona correctamente, se puede revisar en los scripts que se detallan arriba para ver si hay alguna diferencia o alguna necesidad extra que no estaba contemplada en esta guía.
