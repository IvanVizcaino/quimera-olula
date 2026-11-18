import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { Fragment, useEffect, useState } from "react";
import { DesgloseCajaStockUbicacion, MoviStockUbicacion, StockUbicacionItem } from "../../../diseño.ts";
import { getDesgloseCajaStockUbicacion, getStockUbicacion } from "../../../infraestructura.ts";

type ModoVista = "plana" | "cajas";

type GrupoCaja = {
    idCaja: string | null;
    caja: string | null;
    cantidad: number;
    movimientos: MoviStockUbicacion[];
};

const claveCaja = (idCaja: string | null) => idCaja ?? "__sin_caja";

// El desglose viene por caja y lote: se suma por caja. Solo incluye cajas con
// saldo != 0 en la ubicación, así que las que ya salieron no aparecen.
const agruparPorCaja = (
    desglose: DesgloseCajaStockUbicacion[],
    movimientos: MoviStockUbicacion[],
): GrupoCaja[] => {
    const mapa = new Map<string, GrupoCaja>();
    for (const d of desglose) {
        const clave = claveCaja(d.idCaja);
        if (!mapa.has(clave)) {
            mapa.set(clave, {
                idCaja: d.idCaja,
                caja: d.caja,
                cantidad: 0,
                movimientos: movimientos.filter((m) => m.idCaja === d.idCaja),
            });
        }
        mapa.get(clave)!.cantidad += d.cantidad;
    }
    return Array.from(mapa.values()).filter((g) => g.cantidad !== 0);
};

const TablaMovimientosPlana = ({ movimientos }: { movimientos: MoviStockUbicacion[] }) => (
    <table>
        <thead>
            <tr>
                <th>Fecha/Hora</th>
                <th>Lote</th>
                <th>Caja</th>
                <th>Concepto</th>
                <th>Cantidad</th>
            </tr>
        </thead>
        <tbody>
            {movimientos.map((m) => (
                <tr key={m.id}>
                    <td>{m.fechaHora.toLocaleString("es-ES")}</td>
                    <td>{m.lote}</td>
                    <td>{m.caja ?? "Sin caja"}</td>
                    <td>{m.concepto}</td>
                    <td>{m.cantidad.toLocaleString("es-ES")}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

const CajasArticulo = ({
    desglose,
    movimientos,
}: {
    desglose: DesgloseCajaStockUbicacion[];
    movimientos: MoviStockUbicacion[];
}) => {
    const grupos = agruparPorCaja(desglose, movimientos);
    const [desplegadas, setDesplegadas] = useState<Set<string>>(new Set());

    const alternar = (clave: string) =>
        setDesplegadas((actuales) => {
            const nuevas = new Set(actuales);
            if (nuevas.has(clave)) nuevas.delete(clave);
            else nuevas.add(clave);
            return nuevas;
        });

    if (!grupos.length) return <p>Sin cajas con stock</p>;

    return (
        <table className="cajas-articulo">
            <thead>
                <tr>
                    <th>Caja</th>
                    <th>Cantidad</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {grupos.map((grupo) => {
                    const clave = claveCaja(grupo.idCaja);
                    const desplegada = desplegadas.has(clave);
                    return (
                        <Fragment key={clave}>
                            <tr>
                                <td>{grupo.caja ?? "Sin caja"}</td>
                                <td>{grupo.cantidad.toLocaleString("es-ES")}</td>
                                <td>
                                    <QBoton
                                        tamaño="pequeño"
                                        variante="borde"
                                        onClick={() => alternar(clave)}
                                    >
                                        {desplegada ? "Ocultar movimientos" : "Ver movimientos"}
                                    </QBoton>
                                </td>
                            </tr>
                            {desplegada && (
                                <tr>
                                    <td colSpan={3}>
                                        <TablaMovimientosPlana movimientos={grupo.movimientos} />
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    );
                })}
            </tbody>
        </table>
    );
};

const ExpansionMovimientos = ({ entidad }: { entidad: StockUbicacionItem }) => {
    const [movimientos, setMovimientos] = useState<MoviStockUbicacion[]>([]);
    const [desglose, setDesglose] = useState<DesgloseCajaStockUbicacion[]>([]);
    const [cargando, setCargando] = useState(true);
    const [modo, setModo] = useState<ModoVista>("plana");

    useEffect(() => {
        setCargando(true);
        Promise.all([getStockUbicacion(entidad.id), getDesgloseCajaStockUbicacion(entidad.id)])
            .then(([stock, desgloseCajas]) => {
                setMovimientos(stock.movimientos);
                setDesglose(desgloseCajas);
            })
            .finally(() => setCargando(false));
    }, [entidad.id]);

    if (cargando) return <p>Cargando movimientos...</p>;
    if (!movimientos.length) return <p>Sin movimientos</p>;

    return (
        <div className="ExpansionMovimientos">
            <div className="expansion-movimientos-barra">
                <QBoton
                    tamaño="pequeño"
                    variante={modo === "plana" ? "solido" : "borde"}
                    onClick={() => setModo("plana")}
                >
                    Lista plana
                </QBoton>
                <QBoton
                    tamaño="pequeño"
                    variante={modo === "cajas" ? "solido" : "borde"}
                    onClick={() => setModo("cajas")}
                >
                    Por cajas
                </QBoton>
            </div>
            {modo === "plana" ? (
                <TablaMovimientosPlana movimientos={movimientos} />
            ) : (
                <CajasArticulo desglose={desglose} movimientos={movimientos} />
            )}
        </div>
    );
};

const metaTablaStocks: MetaTabla<StockUbicacionItem> = {
    cols: [
        { id: "articulo", cabecera: "Artículo" },
        { id: "cantidadFisica", cabecera: "Cantidad física", tipo: "numero" },
    ],
    expansion: ExpansionMovimientos,
};

export const StocksUbicacion = ({ stocks }: { stocks: StockUbicacionItem[] }) => {
    return (
        <ListadoSemiControlado
            metaTabla={metaTablaStocks}
            entidades={stocks}
            totalEntidades={stocks.length}
            cargando={false}
            seleccionada={null}
            onSeleccion={() => {}}
            criteriaInicial={criteriaDefecto}
            onCriteriaChanged={() => null}
            modo="tabla"
        />
    );
};
