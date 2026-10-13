import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useState } from "react";
import {
    puedeExcluirReciboDeRemesaPago,
    remesaPagoRecibosEditable,
} from "../../dominio.js";
import { ReciboDeRemesaPago, RemesaPago } from "../../diseño.js";

const metaTablaRecibos: MetaTabla<ReciboDeRemesaPago> = [
    { id: "codigo", cabecera: "Código" },
    { id: "nombreProveedor", cabecera: "Proveedor" },
    { id: "fechaVencimiento", cabecera: "F. Vencimiento", tipo: "fecha" },
    { id: "estado", cabecera: "Estado" },
    { id: "importe", cabecera: "Importe", tipo: "moneda" },
];

export const RecibosRemesaPago = ({
    remesa,
    publicar,
}: {
    remesa: RemesaPago;
    publicar: EmitirEvento;
}) => {
    const [seleccionada, setSeleccionada] = useState<ReciboDeRemesaPago | null>(
        null
    );
    const editable = remesaPagoRecibosEditable(remesa);
    const puedeQuitar =
        seleccionada !== null &&
        puedeExcluirReciboDeRemesaPago(remesa, seleccionada.id);

    return (
        <div className="RecibosRemesaPago">
            <ListadoSemiControlado
                metaTabla={metaTablaRecibos}
                entidades={remesa.recibos}
                totalEntidades={remesa.recibos.length}
                cargando={false}
                seleccionada={seleccionada}
                onSeleccion={(id) => setSeleccionada(id)}
                criteriaInicial={criteriaDefecto}
                onCriteriaChanged={() => null}
                modo="tabla"
                renderAcciones={() =>
                    editable ? (
                        <div className="maestro-botones">
                            <QBoton onClick={() => publicar("asociar_recibos_solicitado")}>
                                Añadir recibos
                            </QBoton>
                            <QBoton
                                advertencia
                                deshabilitado={!puedeQuitar}
                                onClick={() =>
                                    publicar(
                                        "excluir_recibo_solicitado",
                                        seleccionada!.id
                                    )
                                }
                            >
                                Quitar de la remesa
                            </QBoton>
                        </div>
                    ) : null
                }
            />
        </div>
    );
};
