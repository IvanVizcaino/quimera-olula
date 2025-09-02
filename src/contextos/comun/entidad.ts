import { Entidad, ListaSeleccionable } from "./diseño.ts";

type OpcionesIncluirEnLista = {
    activar?: boolean;
}
export const listaSeleccionableVacia = <E extends Entidad>() => {
    const lista: ListaSeleccionable<E> = {
        lista: [],
        idActivo: null,
    };
    return lista;
};


export const incluirItem = <E extends Entidad>(entidad: E, { activar = true }: OpcionesIncluirEnLista) =>
    (listaS: ListaSeleccionable<E>): ListaSeleccionable<E> =>
        incluirItemEnLista(listaS, entidad, { activar });

// Poder añadir el item al inicio con alguna ocpion u otra funcion
export const incluirItemEnLista = <E extends Entidad>(
    listaS: ListaSeleccionable<E>,
    entidad: E,
    { activar = true }: OpcionesIncluirEnLista
) => ({
    lista: [...listaS.lista, entidad],
    idActivo: activar ? entidad.id : listaS.idActivo,
})

export const quitarItem = <E extends Entidad>(id: string) =>
    (listaS: ListaSeleccionable<E>): ListaSeleccionable<E> =>
        quitarItemDeLista(listaS, id);


export const quitarItemDeLista = <E extends Entidad>(listaS: ListaSeleccionable<E>, id: string): ListaSeleccionable<E> => ({
    lista: listaS.lista.filter(e => e.id !== id),
    idActivo: listaS.idActivo === id ? null : listaS.idActivo,
});


export const cargar = <E extends Entidad>(entidades: E[]) =>
    (_: ListaSeleccionable<E>): ListaSeleccionable<E> =>
        cargarLista(entidades);

export const cargarLista = <E extends Entidad>(entidades: E[]) => ({
    lista: entidades,
    idActivo: null,
});


export const seleccionarItem = <E extends Entidad>(entidad: E) =>
    (listaS: ListaSeleccionable<E>): ListaSeleccionable<E> =>
        seleccionarItemEnLista(listaS, entidad);

export const seleccionarItemEnLista = <E extends Entidad>(listaS: ListaSeleccionable<E>, entidad: E) => ({
    ...listaS,
    idActivo: entidad.id,
});

export const quitarSeleccion = <E extends Entidad>() =>
    (listaS: ListaSeleccionable<E>): ListaSeleccionable<E> =>
        quitarSeleccionDeLista(listaS);

export const quitarSeleccionDeLista = <E extends Entidad>(listaS: ListaSeleccionable<E>): ListaSeleccionable<E> => {
    return {
        ...listaS,
        idActivo: null,
    };
}

export const cambiarItem = <E extends Entidad>(entidad: E) =>
    (listaS: ListaSeleccionable<E>): ListaSeleccionable<E> =>
        cambiarItemEnLista(listaS, entidad);

export const cambiarItemEnLista = <E extends Entidad>(listaS: ListaSeleccionable<E>, entidad: E) => {
    const lista = listaS.lista.map(e => e.id === entidad.id ? entidad : e);
    return {
        ...listaS,
        lista,
    };
}

export const getSeleccionada = <E extends Entidad>(listaS: ListaSeleccionable<E>): E | null => {
    if (listaS.idActivo) {
        return listaS.lista.find(e => e.id === listaS.idActivo) || null;
    }
    return null;
}