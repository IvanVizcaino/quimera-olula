import { InsigniaClase } from "#/almacen/slotting/Slotting.tsx";
import { StockUbicacionItem } from "#/almacen/ubicacion/diseño.ts";
import { getStocksUbicacion } from "#/almacen/ubicacion/infraestructura.ts";
import { StocksUbicacion } from "#/almacen/ubicacion/vistas/detalle/stocks/StocksUbicacion.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { useEffect, useState } from "react";
import { UbicacionMapa } from "../diseño.ts";
import { textoDistancias } from "../dominio.ts";

const fmt = (n: number) => n.toLocaleString("es-ES");

/** Panel de la ubicación pulsada: qué contiene, su picking fijo, sus clases y su stock con movimientos. */
export const DetalleUbicacionMapa = ({ ubicacion, onCerrar }: { ubicacion: UbicacionMapa; onCerrar: () => void }) => {
    const [stocks, setStocks] = useState<StockUbicacionItem[] | null>(null);

    useEffect(() => {
        setStocks(null);
        getStocksUbicacion(ubicacion.ubicacionId).then(setStocks);
    }, [ubicacion.ubicacionId]);

    const conStock = (stocks ?? []).filter((s) => s.cantidadFisica !== 0);
    const descripcion = (articuloId: string) => stocks?.find((s) => s.articuloId === articuloId)?.articulo;
    const pf = ubicacion.pickingFijo;

    return (
        <section className="mapa-panel mapa-detalle-ubicacion">
            <div className="mapa-panel-cabecera">
                <h3>
                    Ubicación {ubicacion.ubicacion}
                    {ubicacion.bloqueada && <> <QEtiqueta variante="error">Bloqueada</QEtiqueta></>}
                </h3>
                <QBoton variante="texto" onClick={onCerrar}>Cerrar</QBoton>
            </div>

            <ul className="mapa-detalle-articulos">
                {stocks === null ? <li>Cargando stock…</li>
                    : conStock.length === 0 ? <li>Vacía</li>
                        : conStock.map((s) => (
                            <li key={s.id}>
                                <strong>{s.articuloId}</strong> {s.articulo}
                                <span className="mapa-detalle-stock">Stock: <strong>{fmt(s.cantidadFisica)}</strong></span>
                            </li>
                        ))}
                {pf && (
                    <li>
                        Picking fijo de <strong>{pf.articuloId}</strong> {descripcion(pf.articuloId) ?? ""}
                        <span className="mapa-detalle-stock">
                            mín. {fmt(pf.minimo)} · máx. {fmt(pf.maximo)}
                        </span>
                    </li>
                )}
            </ul>

            <dl className="mapa-detalle-clases">
                <div>
                    <dt>ABC hueco</dt>
                    <dd>{ubicacion.claseUbicacion ? <InsigniaClase clase={ubicacion.claseUbicacion} /> : "—"}</dd>
                </div>
                <div>
                    <dt>ABC artículo</dt>
                    <dd>{ubicacion.claseArticulo ? <InsigniaClase clase={ubicacion.claseArticulo} /> : "—"}</dd>
                </div>
                <div>
                    <dt>Clase</dt>
                    <dd>{ubicacion.clasesAlmacenamiento.length ? ubicacion.clasesAlmacenamiento.join(", ") : "—"}</dd>
                </div>
            </dl>

            {textoDistancias(ubicacion) && <p className="mapa-detalle-distancia">{textoDistancias(ubicacion)}</p>}

            {conStock.length > 0 && <StocksUbicacion stocks={conStock} />}
        </section>
    );
};
