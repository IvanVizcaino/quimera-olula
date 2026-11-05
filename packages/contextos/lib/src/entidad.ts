import { Entidad, ListaSeleccionable } from "./diseño.js";

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
    lista: [entidad, ...listaS.lista],
    idActivo: activar ? entidad.id : listaS.idActivo,
})

export const quitarItem = <E extends Entidad>(id: string) =>
    (listaS: ListaSeleccionable<E>): ListaSeleccionable<E> =>
        quitarItemDeLista(listaS, id);


export const quitarItemDeLista = <E extends Entidad>(listaS: ListaSeleccionable<E>, id: string): ListaSeleccionable<E> => ({
    lista: listaS.lista.filter(e => e.id !== id),
    idActivo: listaS.idActivo === id ? null : listaS.idActivo,
});


export const cargar = <E extends Entidad>(entidades: E[], idActivoParam: string | null | undefined = undefined) =>
    (lsAnterior: ListaSeleccionable<E>): ListaSeleccionable<E> => {

        let idActivo = idActivoParam;
        if (lsAnterior.idActivo && idActivoParam === undefined) {
            const indice = lsAnterior.lista.findIndex(e => e.id === lsAnterior.idActivo);
            if (entidades.length > indice) {
                idActivo = entidades[indice].id;
            } else if (entidades.length > 0) {
                idActivo = entidades[entidades.length - 1].id;
            }
        } else if (idActivo) {
            const indice = entidades.findIndex(e => e.id === idActivo);
            if (indice === -1) {
                idActivo = null;
            }
        }
        return cargarLista(entidades, idActivo || null);
    }

export const cargarLista = <E extends Entidad>(entidades: E[], idActivo: string | null) => ({
    lista: entidades,
    idActivo,
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