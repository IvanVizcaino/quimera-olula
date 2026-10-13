import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import {
    ejercicioAperturaSugerido,
    fechaCierrePorDefecto,
    formCierreEjercicioVacio,
    payloadCerrarDesdeForm,
    validarEjercicioId,
    validarFormCierre,
} from "../dominio.ts";
import { FormCierreEjercicio, ResultadoCierreEjercicio } from "../diseño.ts";
import "#/comun/estilos/pagina_proceso.css";
import {
    patchBorrarAsientoAperturaEjercicio,
    patchCerrarEjercicio,
    patchCrearAsientoAperturaEjercicio,
    patchReabrirEjercicio,
} from "../infraestructura.ts";

type AccionConfirmada = "cerrar" | "reabrir" | "borrar_apertura" | null;

const ResultadoOperacion = ({ resultado }: { resultado: ResultadoCierreEjercicio | null }) => {
    if (!resultado) return null;

    const fila = (etiqueta: string, valor: number | null) =>
        valor != null ? (
            <p>
                {etiqueta}: <strong>{valor}</strong>
            </p>
        ) : null;

    return (
        <section className="resultado-cierre-ejercicio">
            <h3>Último resultado</h3>
            <p>
                Ejercicio <strong>{resultado.ejercicioId}</strong> — estado <strong>{resultado.estado}</strong>
            </p>
            {fila("Asiento PyG", resultado.idAsientoPyg)}
            {fila("Asiento de cierre", resultado.idAsientoCierre)}
            {fila("Asiento de apertura (referencia)", resultado.idAsientoApertura)}
        </section>
    );
};

export const CierreEjercicio = () => {
    const { intentar } = useContext(ContextoError);
    const [searchParams, setSearchParams] = useSearchParams();
    const ejercicioParam = searchParams.get("ejercicio") ?? "";

    const [form, setForm] = useState<FormCierreEjercicio>(() => ({
        ...formCierreEjercicioVacio(),
        ejercicioId: ejercicioParam,
        fecha: fechaCierrePorDefecto(ejercicioParam),
    }));
    const [resultado, setResultado] = useState<ResultadoCierreEjercicio | null>(null);
    const [errorForm, setErrorForm] = useState<string | null>(null);
    const [accionConfirmada, setAccionConfirmada] = useState<AccionConfirmada>(null);
    const [procesando, setProcesando] = useState(false);

    const [ejercicioReabrir, setEjercicioReabrir] = useState("");
    const [ejercicioDestinoApertura, setEjercicioDestinoApertura] = useState("");
    const [idAsientoCierreTexto, setIdAsientoCierreTexto] = useState("");
    const [ejercicioBorrarApertura, setEjercicioBorrarApertura] = useState("");

    useEffect(() => {
        if (ejercicioParam && ejercicioParam !== form.ejercicioId) {
            setForm((f) => ({
                ...f,
                ejercicioId: ejercicioParam,
                fecha: f.fecha || fechaCierrePorDefecto(ejercicioParam),
            }));
        }
    }, [ejercicioParam, form.ejercicioId, form.fecha]);

    const sincronizarUrl = useCallback(
        (ejercicioId: string) => {
            if (ejercicioId.trim()) {
                setSearchParams({ ejercicio: ejercicioId.trim() }, { replace: true });
            }
        },
        [setSearchParams]
    );

    const actualizarForm = useCallback(
        (parcial: Partial<FormCierreEjercicio>) => {
            setForm((prev) => {
                const next = { ...prev, ...parcial };
                if (parcial.ejercicioId !== undefined) {
                    sincronizarUrl(parcial.ejercicioId);
                    if (!prev.fecha || prev.fecha === fechaCierrePorDefecto(prev.ejercicioId)) {
                        next.fecha = fechaCierrePorDefecto(parcial.ejercicioId);
                    }
                    if (!prev.ejercicioAperturaId || prev.ejercicioAperturaId === ejercicioAperturaSugerido(prev.ejercicioId)) {
                        next.ejercicioAperturaId = ejercicioAperturaSugerido(parcial.ejercicioId);
                    }
                }
                if (parcial.asientoApertura === true && !next.ejercicioAperturaId.trim()) {
                    next.ejercicioAperturaId = ejercicioAperturaSugerido(next.ejercicioId);
                }
                return next;
            });
            setErrorForm(null);
        },
        [sincronizarUrl]
    );

    const ejecutarCerrar = useCallback(async () => {
        const err = validarFormCierre(form);
        if (err) {
            setErrorForm(err);
            return;
        }
        setProcesando(true);
        try {
            const res = await intentar(() => patchCerrarEjercicio(form.ejercicioId.trim(), payloadCerrarDesdeForm(form)));
            setResultado(res);
            setEjercicioReabrir(form.ejercicioId.trim());
            if (res.idAsientoCierre != null) {
                setIdAsientoCierreTexto(String(res.idAsientoCierre));
            }
            if (form.asientoApertura && form.ejercicioAperturaId.trim()) {
                setEjercicioDestinoApertura(form.ejercicioAperturaId.trim());
                setEjercicioBorrarApertura(form.ejercicioAperturaId.trim());
            }
        } finally {
            setProcesando(false);
            setAccionConfirmada(null);
        }
    }, [form, intentar]);

    const ejecutarReabrir = useCallback(async () => {
        const err = validarEjercicioId(ejercicioReabrir);
        if (err) {
            setErrorForm(err);
            setAccionConfirmada(null);
            return;
        }
        setProcesando(true);
        try {
            const res = await intentar(() => patchReabrirEjercicio(ejercicioReabrir.trim()));
            setResultado(res);
        } finally {
            setProcesando(false);
            setAccionConfirmada(null);
        }
    }, [ejercicioReabrir, intentar]);

    const ejecutarCrearApertura = useCallback(async () => {
        const errDest = validarEjercicioId(ejercicioDestinoApertura);
        const idCierre = Number(idAsientoCierreTexto.trim());
        if (errDest) {
            setErrorForm(errDest);
            return;
        }
        if (!Number.isFinite(idCierre) || idCierre <= 0) {
            setErrorForm("Indique un id de asiento de cierre válido.");
            return;
        }
        setProcesando(true);
        try {
            const res = await intentar(() =>
                patchCrearAsientoAperturaEjercicio(ejercicioDestinoApertura.trim(), idCierre)
            );
            setResultado(res);
            setEjercicioBorrarApertura(ejercicioDestinoApertura.trim());
        } finally {
            setProcesando(false);
        }
    }, [ejercicioDestinoApertura, idAsientoCierreTexto, intentar]);

    const ejecutarBorrarApertura = useCallback(async () => {
        const err = validarEjercicioId(ejercicioBorrarApertura);
        if (err) {
            setErrorForm(err);
            setAccionConfirmada(null);
            return;
        }
        setProcesando(true);
        try {
            const res = await intentar(() => patchBorrarAsientoAperturaEjercicio(ejercicioBorrarApertura.trim()));
            setResultado(res);
        } finally {
            setProcesando(false);
            setAccionConfirmada(null);
        }
    }, [ejercicioBorrarApertura, intentar]);

    const mensajeConfirmacion = (): string => {
        switch (accionConfirmada) {
            case "cerrar":
                return `¿Cerrar el ejercicio ${form.ejercicioId.trim()} con las opciones seleccionadas?`;
            case "reabrir":
                return `¿Reabrir el ejercicio ${ejercicioReabrir.trim()}? Se eliminarán los asientos de PyG y cierre (y puede borrarse la apertura del ejercicio siguiente según configuración).`;
            case "borrar_apertura":
                return `¿Borrar el asiento de apertura del ejercicio ${ejercicioBorrarApertura.trim()}?`;
            default:
                return "";
        }
    };

    const onAceptarConfirmacion = () => {
        if (accionConfirmada === "cerrar") void ejecutarCerrar();
        else if (accionConfirmada === "reabrir") void ejecutarReabrir();
        else if (accionConfirmada === "borrar_apertura") void ejecutarBorrarApertura();
    };

    return (
        <div className="InformeContable CierreEjercicio">
            <h2>Cierre y apertura de ejercicio</h2>
            <p>
                Paridad Eneboo <em>co_cerrarejer</em>: generación de asientos PyG, cierre y apertura al cerrar un
                ejercicio contable.
            </p>

            {errorForm ? (
                <p className="aviso aviso-error" role="alert">
                    {errorForm}
                </p>
            ) : null}

            <section>
                <h2>Cerrar ejercicio</h2>
                <quimera-formulario className="form-cierre-ejercicio">
                    <QInput
                        label="Ejercicio a cerrar"
                        nombre="ejercicio_id"
                        valor={form.ejercicioId}
                        onChange={(v) => actualizarForm({ ejercicioId: v })}
                    />
                    <QInput
                        label="Fecha asientos PyG / cierre"
                        nombre="fecha"
                        tipo="fecha"
                        valor={form.fecha}
                        onChange={(v) => actualizarForm({ fecha: v })}
                    />
                    <QCheckbox
                        label="Generar asiento de PyG"
                        nombre="asiento_pyg"
                        valor={form.asientoPyg}
                        onChange={(v) => actualizarForm({ asientoPyg: v === "true" })}
                    />
                    <QCheckbox
                        label="Generar asiento de cierre"
                        nombre="asiento_cierre"
                        valor={form.asientoCierre}
                        onChange={(v) => actualizarForm({ asientoCierre: v === "true" })}
                    />
                    <QCheckbox
                        label="Generar asiento de apertura en ejercicio destino"
                        nombre="asiento_apertura"
                        valor={form.asientoApertura}
                        onChange={(v) => actualizarForm({ asientoApertura: v === "true" })}
                    />
                    <QInput
                        label="Ejercicio de apertura (destino)"
                        nombre="ejercicio_apertura_id"
                        valor={form.ejercicioAperturaId}
                        onChange={(v) => actualizarForm({ ejercicioAperturaId: v })}
                        deshabilitado={!form.asientoApertura}
                        opcional={!form.asientoApertura}
                    />
                    <QBoton
                        deshabilitado={procesando}
                        onClick={() => {
                            const err = validarFormCierre(form);
                            if (err) {
                                setErrorForm(err);
                                return;
                            }
                            setAccionConfirmada("cerrar");
                        }}
                    >
                        Cerrar ejercicio…
                    </QBoton>
                </quimera-formulario>
            </section>

            <section>
                <h2>Reabrir ejercicio</h2>
                <quimera-formulario>
                    <QInput
                        label="Ejercicio"
                        nombre="ejercicio_reabrir"
                        valor={ejercicioReabrir}
                        onChange={setEjercicioReabrir}
                    />
                    <QBoton
                        variante="borde"
                        destructivo
                        deshabilitado={procesando}
                        onClick={() => setAccionConfirmada("reabrir")}
                    >
                        Reabrir…
                    </QBoton>
                </quimera-formulario>
            </section>

            <section>
                <h2>Asiento de apertura (aparte)</h2>
                <p>Crea la apertura en un ejercicio destino abierto a partir del asiento de cierre indicado.</p>
                <quimera-formulario>
                    <QInput
                        label="Ejercicio destino"
                        nombre="ejercicio_destino_apertura"
                        valor={ejercicioDestinoApertura}
                        onChange={setEjercicioDestinoApertura}
                    />
                    <QInput
                        label="Id asiento de cierre"
                        nombre="id_asiento_cierre"
                        valor={idAsientoCierreTexto}
                        onChange={setIdAsientoCierreTexto}
                    />
                    <QBoton variante="borde" deshabilitado={procesando} onClick={() => void ejecutarCrearApertura()}>
                        Crear asiento de apertura
                    </QBoton>
                </quimera-formulario>
            </section>

            <section>
                <h2>Borrar asiento de apertura</h2>
                <quimera-formulario>
                    <QInput
                        label="Ejercicio (con apertura)"
                        nombre="ejercicio_borrar_apertura"
                        valor={ejercicioBorrarApertura}
                        onChange={setEjercicioBorrarApertura}
                    />
                    <QBoton
                        variante="borde"
                        destructivo
                        deshabilitado={procesando}
                        onClick={() => setAccionConfirmada("borrar_apertura")}
                    >
                        Borrar apertura…
                    </QBoton>
                </quimera-formulario>
            </section>

            <ResultadoOperacion resultado={resultado} />

            {accionConfirmada ? (
                <QModalConfirmacion
                    nombre="confirmarCierreEjercicio"
                    abierto={true}
                    titulo="Confirmar"
                    mensaje={mensajeConfirmacion()}
                    onCerrar={() => setAccionConfirmada(null)}
                    onAceptar={onAceptarConfirmacion}
                />
            ) : null}
        </div>
    );
};
