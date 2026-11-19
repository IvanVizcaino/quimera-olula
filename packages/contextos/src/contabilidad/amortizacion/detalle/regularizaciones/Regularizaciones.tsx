import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback, useEffect, useState } from "react";
import { CrearRegularizacion } from "../../crear_regularizacion/CrearRegularizacion.tsx";
import { Amortizacion, RegularizacionValor } from "../../diseño.ts";
import { deleteRegularizacion, getRegularizaciones } from "../../infraestructura.ts";

const metaTabla: MetaTabla<RegularizacionValor> = [
    { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "importe", cabecera: "Importe", tipo: "moneda" },
];

type Estado = "INICIAL" | "CREANDO" | "BORRANDO";

const BorrarRegularizacion = ({
    regularizacion, onBorrada, onCancelar,
}: { regularizacion: RegularizacionValor; onBorrada: () => void; onCancelar: () => void }) => {
    const borrar_ = useCallback(async () => {
        await deleteRegularizacion(regularizacion.id);
        onBorrada();
    }, [regularizacion.id, onBorrada]);
    const [borrar, cancelar] = useForm(borrar_, onCancelar);
    return (
        <QModalConfirmacion nombre="borrarRegularizacionValor" abierto={true}
            titulo="Borrar regularización de valor"
            mensaje="¿Confirma borrar la regularización de valor?"
            onCerrar={cancelar} onAceptar={borrar} />
    );
};

/** Pestaña «Regularizaciones» (`co_regvaloramor`): solo registro de datos. */
export const Regularizaciones = ({ amortizacion }: { amortizacion: Amortizacion }) => {
    const [lista, setLista] = useState<RegularizacionValor[]>([]);
    const [cargando, setCargando] = useState(true);
    const [activa, setActiva] = useState<RegularizacionValor | null>(null);
    const [estado, setEstado] = useState<Estado>("INICIAL");

    const recargar = useCallback(async () => {
        setCargando(true);
        try {
            setLista(await getRegularizaciones(amortizacion.id));
        } finally {
            setCargando(false);
        }
    }, [amortizacion.id]);

    useEffect(() => { recargar(); }, [recargar]);

    const cambiado = useCallback(async () => {
        setEstado("INICIAL");
        setActiva(null);
        await recargar();
    }, [recargar]);

    return (
        <div className="RegularizacionesValor">
            <div className="botones maestro-botones">
                <QBoton onClick={() => setEstado("CREANDO")}>Nueva regularización</QBoton>
                <QBoton onClick={() => setEstado("BORRANDO")} deshabilitado={!activa}>Borrar</QBoton>
            </div>
            <QTabla metaTabla={metaTabla} datos={lista} cargando={cargando}
                seleccionadaId={activa?.id} onSeleccion={setActiva}
                orden={["fecha", "ASC"]} totalEntidades={lista.length} />
            {estado === "CREANDO" && (
                <CrearRegularizacion amortizacion={amortizacion} onCreada={cambiado}
                    onCancelar={() => setEstado("INICIAL")} />
            )}
            {estado === "BORRANDO" && activa && (
                <BorrarRegularizacion regularizacion={activa} onBorrada={cambiado}
                    onCancelar={() => setEstado("INICIAL")} />
            )}
        </div>
    );
};
