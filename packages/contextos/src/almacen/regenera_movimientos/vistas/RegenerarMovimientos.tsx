import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { Articulo as ArticuloSelector } from "#/almacen/comun/componentes/Articulo.tsx";
import { Familia } from "#/almacen/comun/componentes/Familia.tsx";
import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useState } from "react";
import { FormRegenerarMovimientos, ResumenRegeneracion } from "../diseño.ts";
import {
    anadirArticulo,
    formRegenerarVacio,
    MENSAJE_CONFIRMAR_REGENERACION,
    peticionDesdeForm,
    validarRegeneracion,
} from "../dominio.ts";
import { postRegenerarMovimientos } from "../infraestructura.ts";
import "#/comun/estilos/pagina_proceso.css";

export const RegenerarMovimientos = () => {
    const { intentar } = useContext(ContextoError);
    const [form, setForm] = useState<FormRegenerarMovimientos>(formRegenerarVacio);
    const [articuloNuevo, setArticuloNuevo] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [confirmando, setConfirmando] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [resumen, setResumen] = useState<ResumenRegeneracion | null>(null);

    const actualizar = (parcial: Partial<FormRegenerarMovimientos>) => {
        setForm((prev) => ({ ...prev, ...parcial }));
        setError(null);
        setResumen(null);
    };

    const solicitar = () => {
        const err = validarRegeneracion(form);
        if (err) {
            setError(err);
            return;
        }
        setConfirmando(true);
    };

    const ejecutar = useCallback(async () => {
        setProcesando(true);
        try {
            const res = await intentar(() => postRegenerarMovimientos(peticionDesdeForm(form)));
            setResumen(res);
        } finally {
            setProcesando(false);
            setConfirmando(false);
        }
    }, [form, intentar]);

    return (
        <div className="InformeContable RegenerarMovimientos">
            <header className="pagina-proceso__cabecera">
                <h2>Regenerar movimientos de stock</h2>
                <p className="pagina-proceso__intro">
                    Regenera los movimientos de stock de pedidos, albaranes y facturas de los
                    artículos que cumplan el filtro, y revisa sus stocks.
                </p>
            </header>

            <section className="pagina-proceso__panel">
                <quimera-formulario>
                    <Almacen
                        valor={form.almacenId}
                        nombre="almacen_id"
                        onChange={(opcion) => actualizar({ almacenId: opcion?.valor ?? "" })}
                    />
                    <Familia
                        valor={form.familiaId}
                        nombre="familia_id"
                        onChange={(opcion) => actualizar({ familiaId: opcion?.valor ?? "" })}
                    />
                    <ArticuloSelector
                        valor={articuloNuevo}
                        nombre="articulo_nuevo"
                        label="Añadir artículo al filtro"
                        opcional
                        onChange={(opcion) => {
                            if (opcion?.valor) {
                                actualizar({
                                    articulos: anadirArticulo(form.articulos, opcion.valor),
                                });
                            }
                            setArticuloNuevo("");
                        }}
                    />
                </quimera-formulario>

                {form.articulos.length > 0 && (
                    <ul className="RegenerarMovimientos__articulos">
                        {form.articulos.map((ref) => (
                            <li key={ref}>
                                {ref}
                                <QBoton
                                    variante="texto"
                                    tamaño="pequeño"
                                    onClick={() =>
                                        actualizar({
                                            articulos: form.articulos.filter((a) => a !== ref),
                                        })
                                    }
                                >
                                    Quitar
                                </QBoton>
                            </li>
                        ))}
                    </ul>
                )}

                {error && <QAviso variante="error">{error}</QAviso>}

                <div className="maestro-botones">
                    <QBoton onClick={solicitar} deshabilitado={procesando}>
                        {procesando ? "Regenerando movimientos..." : "Regenerar movimientos"}
                    </QBoton>
                </div>
            </section>

            {resumen && (
                <section className="pagina-proceso__resultado RegenerarMovimientos__resumen">
                    <h3>Resultado</h3>
                    <p>
                        Artículos: <strong>{resumen.articulos}</strong> — líneas regeneradas:{" "}
                        <strong>{resumen.lineas}</strong> — stocks revisados:{" "}
                        <strong>{resumen.stocksRevisados}</strong>
                    </p>
                    <ul>
                        {Object.entries(resumen.porDocumento).map(([doc, n]) => (
                            <li key={doc}>
                                {doc}: {n}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <QModalConfirmacion
                nombre="confirmarRegenerarMovimientos"
                abierto={confirmando}
                titulo="Regenerar movimientos"
                mensaje={MENSAJE_CONFIRMAR_REGENERACION}
                onCerrar={() => setConfirmando(false)}
                onAceptar={ejecutar}
            />
        </div>
    );
};
