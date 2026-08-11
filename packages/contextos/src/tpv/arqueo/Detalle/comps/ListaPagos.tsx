import { MetaTabla } from "@olula/componentes/index.js";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.js";
import { getMetaFiltroDefecto } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { ContextoError } from "@olula/lib/contexto.js";
import { Criteria, RespuestaLista2 } from "@olula/lib/diseño.js";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useCallback, useContext, useEffect, useState } from "react";
import { PagoArqueoTpv } from "../../diseño.ts";
import { getPagosArqueo } from "../../infraestructura.ts";



export const ListaPagos = ({
    arqueoId,
}: {
    arqueoId?: string;
}) => {
    
    const { intentar } = useContext(ContextoError);

    const [arqueoIdAnterior, setArqueoIdAnterior] = useState<string | null>(null);
    const [pagos, setPagos] = useState<RespuestaLista2<PagoArqueoTpv>>({ datos:[], total: 0 });

    const cargarPagos = useCallback(async (criteria: Criteria = criteriaDefecto) => {
        if (arqueoId) {
            const respuesta = await intentar(() => getPagosArqueo(arqueoId, criteria));
            setPagos({
                datos: respuesta.datos,
                total: respuesta.total < 0 ? pagos.total : respuesta.total 
            });
        } else {
            setPagos({ datos: [], total: 0 });
        }
    }, [arqueoId, intentar, pagos, setPagos]);
    
    useEffect(() => {
        if (arqueoId !== arqueoIdAnterior) {
            setArqueoIdAnterior(arqueoId ?? null);
            cargarPagos();
        }
    }, [arqueoId, cargarPagos, arqueoIdAnterior, setArqueoIdAnterior]);

    return (
        <>
            <h3>Pagos</h3>
            <ListadoSemiControlado
                metaTabla={metaTablaPagos}
                metaFiltro={metaFiltroPagos}
                cargando={false}
                criteriaInicial={criteriaDefecto}
                idReiniciarCriteria={arqueoId}
                modo={'tabla'}
                entidades={pagos.datos}
                totalEntidades={pagos.total}
                seleccionada={null}
                onSeleccion={()=>{}}
                onCriteriaChanged={cargarPagos}
            />
        </>
    );
};

const metaTablaPagos: MetaTabla<PagoArqueoTpv> = [
    {
        id: "fecha",
        cabecera: "Fecha",
        tipo: "fecha",
    },
    {
        id: "codigoVenta",
        cabecera: "Venta",
    },
    { id: "formaPago", cabecera: "Forma de pago",
        render: (pago: PagoArqueoTpv) => pago.vale
            ? `${pago.formaPago} ${pago.vale}`
            : `${pago.formaPago}`,
    },
    { id: "importe", cabecera: "Importe", tipo: "moneda" },
];

const metaFiltroPagos = getMetaFiltroDefecto(metaTablaPagos);
