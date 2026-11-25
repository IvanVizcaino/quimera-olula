import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useCallback, useEffect, useState } from "react";
import { formatearCantidad } from "../../orden/dominio.ts";
import { AccionesTarea } from "../acciones/AccionesTarea.tsx";
import { TareaProduccion } from "../diseño.ts";
import { duracion, etiquetaEstadoTarea, fechaHora, textoInicialFinal, textoTrabajador } from "../dominio.ts";
import { getTarea } from "../infraestructura.ts";

/**
 * Detalle de una tarea de producción (solo lectura) con sus acciones. `version` cambia cuando
 * se opera una tarea desde la lista: entonces se vuelve a leer.
 */
export const DetalleTarea = ({
    id,
    version,
    trasAccion,
    cerrar,
}: {
    id?: string;
    version: number;
    trasAccion: () => Promise<void>;
    cerrar: () => void;
}) => {
    const [tarea, setTarea] = useState<TareaProduccion | null>(null);

    const leer = useCallback(async () => {
        if (!id) return;
        setTarea(await getTarea(id));
    }, [id]);

    useEffect(() => {
        setTarea(null);
        leer();
    }, [leer, version]);

    if (!id || !tarea) return null;

    return (
        <Detalle<TareaProduccion>
            id={id}
            entidad={tarea}
            setEntidad={() => {}}
            obtenerTitulo={(t) => `${t.id} · ${t.descripcion || t.codigo}`}
            obtenerEstado={(t) => <EtiquetaEstado {...etiquetaEstadoTarea(t.estado)} />}
            cerrarDetalle={cerrar}
        >
            <div className="DetalleTareaProduccion">
                <AccionesTarea tarea={tarea} trasAccion={trasAccion} />
                <quimera-formulario>
                    <QInput label="Orden" nombre="ordenId" valor={tarea.ordenId} soloLectura />
                    <QInput label="Lote" nombre="loteId" valor={tarea.loteId} soloLectura />
                    <QInput label="Artículo" nombre="articulo"
                        valor={tarea.articulo ? `${tarea.articuloId} - ${tarea.articulo}` : tarea.articuloId} soloLectura />
                    <QInput label="Cantidad" nombre="cantidad" valor={formatearCantidad(tarea.cantidad)} soloLectura />
                    <QInput label="Tarea del proceso" nombre="codigo" valor={tarea.codigo} soloLectura />
                    <QInput label="Tipo de proceso" nombre="tipoProcesoId" valor={tarea.tipoProcesoId} soloLectura />
                    <QInput label="Centro de coste" nombre="centroId" valor={tarea.centroId} soloLectura />
                    <QInput label="Inicial/final" nombre="inicialFinal" valor={textoInicialFinal(tarea)} soloLectura />
                    <QInput label="Realizada por" nombre="realizadaPor" valor={textoTrabajador(tarea)} soloLectura />
                    <QInput label="Inicio" nombre="inicio" valor={fechaHora(tarea.diaInicio, tarea.tiempoInicio)} soloLectura />
                    <QInput label="Fin" nombre="fin" valor={fechaHora(tarea.diaFin, tarea.tiempoFin)} soloLectura />
                    <QInput label="Duración" nombre="duracion" valor={tarea.diaFin ? duracion(tarea.intervalo) : ""} soloLectura />
                    <QInput label="Tiempo invertido" nombre="tiempoInvertido"
                        valor={formatearCantidad(tarea.tiempoInvertido)} soloLectura />
                </quimera-formulario>
            </div>
        </Detalle>
    );
};
