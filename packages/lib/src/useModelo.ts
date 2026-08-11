import { useCallback, useContext, useEffect, useState } from "react";

import { ContextoError } from "./contexto.ts";
import { Modelo, TipoInput, ValorCampoUI } from "./diseño.ts";
import { getFormProps, MetaModelo } from "./dominio.ts";

export function useModelo<T extends Modelo>(
    meta: MetaModelo<T>,
    modeloInicialProp: T,
    onModeloListo?: (t: T) => Promise<void>
): HookModelo<T> {

    const [modelo, setModelo] = useState(modeloInicialProp);
    const [modeloInicial, setModeloInicial] = useState<T>(modeloInicialProp);

    const { intentar } = useContext(ContextoError);

    const init = useCallback((nuevoModelo?: T) => {
        const modeloAUsar = nuevoModelo || modeloInicialProp;
        setModelo(modeloAUsar);
        setModeloInicial(modeloAUsar);
    }, [modeloInicialProp]);

    const onModeloListoConError = useCallback(
        async (modelo: T) => {
            return onModeloListo
                ? await intentar(
                    async () => await onModeloListo(modelo)
                ) :
                Promise.resolve();
        },
        [intentar, onModeloListo]
    );


    useEffect(() => {
        setModelo(modeloInicialProp);
        setModeloInicial(modeloInicialProp);
    }, [modeloInicialProp]);

    return {
        modelo,
        modeloInicial: modeloInicial || modeloInicialProp,
        init,
        set: setModelo,
        ...getFormProps(modelo, modeloInicial, meta, setModelo, onModeloListoConError),
    } as const;
}

export type HookModelo<T extends Modelo> = {
    modelo: T,
    modeloInicial: T,
    uiProps: (campo: string, secundario?: string) => UiProps,
    init: (entidad?: T) => void,
    set: (entidad: T) => void,
    modificado: boolean,
    valido: boolean,
    editable: boolean,
}

type ParamOpcion = {
    valor: string;
    descripcion?: string
};

export type ValorControl = null | boolean | string | ParamOpcion;

export type UiProps = {
    nombre: string;
    valor: ValorCampoUI;
    tipo: TipoInput;
    textoValidacion: string;
    deshabilitado: boolean;
    erroneo: boolean;
    advertido: boolean;
    opcional: boolean;
    valido: boolean;
    modificado: boolean;
    soloTexto: boolean;
    onChange: (valor: ValorControl) => void;
    evaluarCambio: () => void;
    descripcion?: string;
}

