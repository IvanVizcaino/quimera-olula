import { Lote } from "#/almacen/comun/componentes/Lote.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";
import { EntradasSalidasLote } from "../diseño.ts";
import { ResumenLoteTrazado } from "../componentes/MovimientosLote.tsx";
import { pestanasTrazabilidad } from "../componentes/pestanas.tsx";
import "../componentes/Trazabilidad.css";

/**
 * Producción > Trazabilidad de lotes: se busca un lote (o se llega con `?lote=`) y se ven sus
 * entradas y salidas y su trazabilidad hacia atrás y hacia delante. Desde el árbol se salta a
 * otro lote.
 */
export const TrazabilidadLotes = () => {
    const [params, setParams] = useSearchParams();
    const loteId = params.get("lote") ?? "";
    const [texto, setTexto] = useState(loteId);
    const [datos, setDatos] = useState<EntradasSalidasLote | null>(null);
    const conListaLotes = puede("almacen.lote");

    const abrirLote = useCallback((id: string) => {
        const limpio = id.trim();
        setTexto(limpio);
        setParams(limpio ? { lote: limpio } : {});
    }, [setParams]);

    return (
        <div className="TrazabilidadLotes">
            <h2>Trazabilidad de lotes</h2>
            <div className="buscador-lote">
                {conListaLotes
                    ? (
                        <Lote
                            label="Lote"
                            nombre="lote_trazabilidad"
                            valor={loteId}
                            permitirNuevo
                            onChange={(opcion) => abrirLote(opcion?.valor ?? "")}
                        />
                    )
                    : (
                        <form onSubmit={(e) => { e.preventDefault(); abrirLote(texto); }}>
                            <QInput label="Código de lote" nombre="lote_trazabilidad" valor={texto} onChange={(v) => setTexto(v)} />
                            <QBoton tipo="submit">Buscar</QBoton>
                        </form>
                    )}
            </div>
            {!loteId && <p className="nota-trazabilidad">Elija un lote para ver de dónde viene y a dónde ha ido.</p>}
            {loteId && (
                <>
                    <h3>Lote {loteId}</h3>
                    {datos?.loteId === loteId && <ResumenLoteTrazado datos={datos} />}
                    <Tabs key={loteId}>
                        {pestanasTrazabilidad(loteId, { abrirLote, alCargarMovimientos: setDatos })}
                    </Tabs>
                </>
            )}
        </div>
    );
};
