import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCargando } from "@olula/componentes/atomos/qcargando.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { CategoriaModulo } from "../diseño.ts";
import {
    etiquetaCategoriaModulo, etiquetaFiltroModulos, fichasModulos, FiltroModulos, filtrarFichas, RUTA_SUSCRIPCION,
    recuentoFichas,
} from "../dominio.ts";
import { getMaquina } from "../pagina/maquina.ts";
import { contextoPaginaInicial } from "../pagina/pagina.ts";
import "../pagina/PaginaSuscripcion.css";
import { PagoSuscripcion } from "../pago/PagoSuscripcion.tsx";
import { FichaModulo } from "./FichaModulo.tsx";
import "./PaginaModulos.css";
import { RecomendadorModulos } from "./RecomendadorModulos.tsx";
import { TarjetaModulo } from "./TarjetaModulo.tsx";

const CATEGORIAS: CategoriaModulo[] = ["contexto", "plugin", "servicio"];

/**
 * Ajustes › Módulos disponibles: el catálogo para la empresa, con buscador, recomendador y la
 * ficha de cada módulo (demo y contratación). `?modulo=<id>` abre directamente su ficha (lo
 * usa la suscripción). Comparte la máquina de la página de suscripción: el cambio y el pago
 * se aplican igual que allí.
 */
export const PaginaModulos = () => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoPaginaInicial);
    const [busqueda, setBusqueda] = useSearchParams();
    const [texto, setTexto] = useState("");
    const [filtro, setFiltro] = useState<FiltroModulos>("todos");
    const cargado = useRef(false);

    useEffect(() => {
        if (cargado.current) return;
        cargado.current = true;
        void emitir("carga_solicitada", undefined, true).catch(() => undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { estado, mi, catalogo } = ctx;
    const fichas = useMemo(() => (mi && catalogo ? fichasModulos(mi, catalogo) : []), [mi, catalogo]);
    const visibles = filtrarFichas(fichas, texto, filtro);
    const recuento = recuentoFichas(fichas);
    const periodicidad = mi?.suscripcion?.periodicidad ?? "mensual";

    const abierto = busqueda.get("modulo");
    const fichaAbierta = fichas.find((f) => f.modulo.id === abierto) ?? null;
    const abrir = (id: string | null) => setBusqueda(id ? { modulo: id } : {}, { replace: true });

    return (
        <div className="PaginaSuscripcion PaginaModulos">
            <header className="modulos-cabecera">
                <div>
                    <h2>Módulos disponibles</h2>
                    <p className="susc-secundario">Descubre qué más puede hacer Olula por tu empresa, pruébalo con datos de ejemplo y añádelo cuando quieras.</p>
                </div>
                <QBoton variante="borde" enlace={RUTA_SUSCRIPCION}>Mi suscripción</QBoton>
            </header>

            {estado === "CARGANDO" && <QCargando visible mensaje="Cargando el catálogo…" />}
            {estado === "ERROR" && (
                <QAviso variante="error">
                    <div>
                        <p><strong>No hemos podido cargar los módulos.</strong></p>
                        <p>{ctx.error}</p>
                        <QBoton variante="borde" onClick={() => emitir("carga_solicitada")}>Reintentar</QBoton>
                    </div>
                </QAviso>
            )}
            {estado === "SIN_SUSCRIPCION" && (
                <QAviso variante="info">Tu empresa todavía no tiene un plan contratado. Escríbenos para activarlo.</QAviso>
            )}

            {mi?.suscripcion && catalogo && (estado === "ABIERTA" || estado === "PIDIENDO_MANDATO") && (
                <>
                    {ctx.aviso && (
                        <QAviso variante="info">
                            <span>{ctx.aviso}</span>
                            {estado === "ABIERTA" && (
                                <QBoton variante="texto" tamaño="pequeño" onClick={() => emitir("aviso_cerrado")}>Cerrar</QBoton>
                            )}
                        </QAviso>
                    )}
                    {estado === "PIDIENDO_MANDATO" && <PagoSuscripcion mi={mi} estado={estado} publicar={emitir} />}

                    <RecomendadorModulos fichas={fichas} periodicidad={periodicidad} onAbrir={abrir} />

                    <div className="modulos-barra">
                        <div className="modulos-buscador">
                            <QIcono nombre="buscar" tamaño="sm" />
                            <QInput label="Buscar en el catálogo" nombre="buscar_modulo" placeholder="Nombre, función o palabra clave"
                                valor={texto} onChange={setTexto} />
                        </div>
                        <div className="modulos-filtros" role="radiogroup" aria-label="Filtrar por situación">
                            {(Object.keys(etiquetaFiltroModulos) as FiltroModulos[])
                                .filter((f) => f === "todos" || recuento[f] > 0)
                                .map((f) => (
                                    <button key={f} type="button" role="radio" aria-checked={filtro === f}
                                        className={filtro === f ? "activo" : ""} onClick={() => setFiltro(f)}>
                                        {etiquetaFiltroModulos[f]} <span className="recuento">{recuento[f]}</span>
                                    </button>
                                ))}
                        </div>
                    </div>

                    {visibles.length === 0 && <p className="susc-secundario">Ningún módulo coincide con la búsqueda.</p>}

                    {CATEGORIAS.map((categoria) => {
                        const deCategoria = visibles.filter((f) => f.modulo.categoria === categoria);
                        if (!deCategoria.length) return null;
                        return (
                            <section key={categoria} className="modulos-categoria">
                                <h3>{etiquetaCategoriaModulo[categoria]}</h3>
                                <div className="rejilla-modulos">
                                    {deCategoria.map((f) => (
                                        <TarjetaModulo key={f.modulo.id} ficha={f} periodicidad={periodicidad}
                                            onAbrir={() => abrir(f.modulo.id)} />
                                    ))}
                                </div>
                            </section>
                        );
                    })}

                    {fichaAbierta && (
                        <FichaModulo key={fichaAbierta.modulo.id} ficha={fichaAbierta} mi={mi} catalogo={catalogo}
                            deshabilitado={estado !== "ABIERTA"} publicar={emitir} onCerrar={() => abrir(null)} />
                    )}
                </>
            )}
        </div>
    );
};
