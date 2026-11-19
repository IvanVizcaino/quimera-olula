import { FilaFormulario } from "#/contabilidad/comun/componentes/FilaFormulario.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useCallback, useEffect, useState } from "react";
import { EventoColaDetalle } from "../diseño.ts";
import { formatearMarcaTiempo, puedeReiniciarse, varianteEstadoEvento } from "../dominio.ts";
import { getEventoCola, reiniciarEventoCola } from "../infraestructura.ts";
import "./DetalleEventoCola.css";

/** El payload es JSON: se enseña con sangría para poder leerlo. */
const legible = (texto: string | null): string => {
    if (!texto) return "";
    try {
        return JSON.stringify(JSON.parse(texto), null, 2);
    } catch {
        return texto;
    }
};

const Campo = ({ label, nombre, valor }: { label: string; nombre: string; valor: string | number | null }) => (
    <QInput label={label} nombre={nombre} valor={valor === null ? "" : String(valor)} soloLectura />
);

/** Ficha del evento (flcolas.ui): sólo lectura, con «Reiniciar proceso». */
export const DetalleEventoCola = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const [evento, setEvento] = useState<EventoColaDetalle | null>(null);
    const [confirmando, setConfirmando] = useState(false);

    const cargar = useCallback(async (idEvento: string) => {
        setEvento(await getEventoCola(idEvento));
    }, []);

    useEffect(() => {
        setEvento(null);
        if (id) cargar(id).catch(() => setEvento(null));
    }, [id, cargar]);

    if (!id || !evento) return null;

    const reiniciar = async () => {
        await reiniciarEventoCola(evento.id);
        setConfirmando(false);
        const original = evento.padreId ?? evento.id;
        await publicar("evento_reiniciado", original);
        await cargar(original);
    };

    const acciones = [{
        texto: "Reiniciar proceso",
        onClick: () => setConfirmando(true),
        deshabilitado: !puedeReiniciarse(evento) || !puede("comun.evento_cola.reiniciar"),
    }];

    return (
        <Detalle
            id={id}
            obtenerTitulo={(e: EventoColaDetalle) => `${e.id} · ${e.tipo}`}
            setEntidad={() => {}}
            entidad={evento}
            cerrarDetalle={() => publicar("evento_deseleccionado", null)}
        >
            <div className="DetalleEventoCola">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <quimera-formulario>
                    <FilaFormulario columnas="1fr 2fr">
                        <Campo label="Tipo del evento" nombre="tipo" valor={evento.tipo} />
                        <Campo label="Nombre de cola" nombre="cola_id" valor={evento.colaId} />
                    </FilaFormulario>
                    <FilaFormulario>
                        <Campo label="Fecha creación" nombre="creacion" valor={formatearMarcaTiempo(evento.creacion)} />
                        <Campo label="Fecha programada" nombre="programada" valor={formatearMarcaTiempo(evento.programada)} />
                        <Campo label="Fecha inicio" nombre="inicio" valor={formatearMarcaTiempo(evento.inicio)} />
                        <Campo label="Fecha fin" nombre="fin" valor={formatearMarcaTiempo(evento.fin)} />
                    </FilaFormulario>
                    <FilaFormulario>
                        <Campo label="Intento" nombre="num_intento" valor={evento.numIntento} />
                        <div className="DetalleEventoCola-estado">
                            <span className="etiqueta">Estado</span>
                            <QEtiqueta variante={varianteEstadoEvento(evento.estado)}>{evento.estado}</QEtiqueta>
                        </div>
                        <Campo label="Usuario" nombre="usuario" valor={evento.usuarioId} />
                        <Campo label="Clave" nombre="clave" valor={evento.clave} />
                    </FilaFormulario>
                    <FilaFormulario>
                        <Campo label="Id." nombre="id" valor={evento.id} />
                        <Campo label="Id padre" nombre="padre_id" valor={evento.padreId} />
                    </FilaFormulario>
                </quimera-formulario>
                <Tabs children={[
                    <Tab key="tab-entrada" label="Entrada" children={
                        <pre className="DetalleEventoCola-texto">{legible(evento.payload)}</pre>
                    } />,
                    <Tab key="tab-errores" label="Errores" children={
                        <pre className="DetalleEventoCola-texto">{evento.datosError || "Sin errores."}</pre>
                    } />,
                ]} tabInicial={evento.datosError ? 1 : 0} />
            </div>
            <QModalConfirmacion
                nombre="reiniciar_evento_cola"
                abierto={confirmando}
                titulo="Reiniciar proceso"
                mensaje="Se borrarán los reintentos de este evento y volverá a la cola como pendiente, desde el primer intento. ¿Continuar?"
                labelAceptar="Reiniciar"
                onCerrar={() => setConfirmando(false)}
                onAceptar={reiniciar}
            />
        </Detalle>
    );
};
