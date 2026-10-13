import { reciboCompraPagable } from "#/tesoreria/recibo_compra/dominio.js";
import { ReciboCompra } from "#/tesoreria/recibo_compra/diseño.js";
import { getRecibosCompra } from "#/tesoreria/recibo_compra/infraestructura.js";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RemesaPago } from "../../diseño.js";

const metaTablaReciboCompra: MetaTabla<ReciboCompra> = [
    { id: "codigo", cabecera: "Código" },
    { id: "nombreProveedor", cabecera: "Proveedor" },
    { id: "fechaVencimiento", cabecera: "F. Vencimiento", tipo: "fecha" },
    { id: "estado", cabecera: "Estado" },
    { id: "importe", cabecera: "Importe", tipo: "moneda" },
];

export const AsociarRecibosRemesaPago = ({
    remesa,
    publicar,
}: {
    remesa: RemesaPago;
    publicar: EmitirEvento;
}) => {
    const idsEnRemesa = useMemo(
        () => new Set(remesa.recibos.map((recibo) => recibo.id)),
        [remesa.recibos]
    );

    const [criteria, setCriteria] = useState<Criteria>(criteriaDefecto);
    const [recibos, setRecibos] = useState<ReciboCompra[]>([]);
    const [total, setTotal] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [seleccionados, setSeleccionados] = useState<string[]>([]);
    const [multiseleccion, setMultiseleccion] = useState(true);

    const recargar = useCallback(async (c: Criteria) => {
        setCargando(true);
        try {
            const resultado = await getRecibosCompra(c);
            const filtrados = resultado.datos.filter(
                (recibo) =>
                    reciboCompraPagable(recibo) && !idsEnRemesa.has(recibo.id)
            );
            setRecibos(filtrados);
            setTotal(resultado.total);
        } finally {
            setCargando(false);
        }
    }, [idsEnRemesa]);

    useEffect(() => {
        recargar(criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const asociar_ = useCallback(
        async () => publicar("asociar_recibos_confirmado", seleccionados),
        [publicar, seleccionados]
    );

    const cancelar_ = useCallback(
        () => publicar("asociar_recibos_cancelado"),
        [publicar]
    );

    const [asociar, cancelar] = useForm(asociar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="asociar_recibos_remesa_pago"
            titulo="Añadir recibos a la remesa"
            onCerrar={cancelar}
            anchoEstable
        >
            <div className="AsociarRecibosRemesaPago">
                <QEtiqueta variante="primario">
                    Solo recibos pendientes o devueltos, misma divisa (
                    {remesa.divisaId}) y no incluidos en otra remesa. Requiere{" "}
                    <strong>remesas_prov</strong>.
                </QEtiqueta>
                <Listado<ReciboCompra>
                    metaTabla={metaTablaReciboCompra}
                    criteria={criteria}
                    modoInicial="tabla"
                    entidades={recibos}
                    totalEntidades={total}
                    seleccionada={undefined}
                    seleccionadas={seleccionados}
                    onMultiSeleccion={setSeleccionados}
                    modoMultiseleccion={multiseleccion}
                    onModoMultiseleccionChanged={setMultiseleccion}
                    cargando={cargando}
                    onSeleccion={() => null}
                    onCriteriaChanged={(c) => {
                        setCriteria(c);
                        recargar(c);
                    }}
                    onSiguientePagina={(c) => {
                        setCriteria(c);
                        recargar(c);
                    }}
                    renderAcciones={() => (
                        <div className="maestro-botones">
                            <QBoton
                                onClick={asociar}
                                deshabilitado={seleccionados.length === 0}
                            >
                                {`Añadir (${seleccionados.length})`}
                            </QBoton>
                        </div>
                    )}
                />
            </div>
        </QModal>
    );
};
