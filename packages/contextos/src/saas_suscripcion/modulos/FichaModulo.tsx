import { iconoModulo } from "#/saas_comun/iconos.ts";
import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useMemo, useState } from "react";
import { PresupuestoCambio } from "../cambiar_plan/PresupuestoCambio.tsx";
import { usePresupuesto } from "../cambiar_plan/presupuesto.ts";
import { tieneDemo } from "../demo/registro.ts";
import { Catalogo, FichaModuloEmpresa, MiSuscripcion } from "../diseño.ts";
import {
    etiquetaEstadoModulo, objetivoDeSuscripcion, objetivoParaModulo, puedeConfirmarCambio, textoPrecioFicha,
} from "../dominio.ts";
import { DemoEmbebida } from "./DemoEmbebida.tsx";
import "./FichaModulo.css";

type Vista = "ficha" | "demo" | "contratar";

/**
 * Ficha de un módulo: qué hace, qué trae, cuánto cuesta. Desde aquí se prueba (demo con datos
 * de ejemplo en un iframe aislado) y se contrata (presupuesto del servidor y confirmación,
 * con el mismo flujo que «Cambiar de plan»).
 */
export const FichaModulo = ({
    ficha, mi, catalogo, deshabilitado, publicar, onCerrar,
}: {
    ficha: FichaModuloEmpresa;
    mi: MiSuscripcion;
    catalogo: Catalogo;
    deshabilitado: boolean;
    publicar: EmitirEvento;
    onCerrar: () => void;
}) => {
    const [vista, setVista] = useState<Vista>("ficha");
    const [enviando, setEnviando] = useState(false);
    const { modulo, estado } = ficha;
    const periodicidad = mi.suscripcion?.periodicidad ?? "mensual";

    const objetivo = useMemo(() => objetivoParaModulo(mi, catalogo, ficha), [mi, catalogo, ficha]);
    const actual = mi.suscripcion ? objetivoDeSuscripcion(mi.suscripcion) : null;
    const planDestino = ficha.estado === "otro_plan" ? ficha.planAlternativo : mi.plan;
    const presupuesto = usePresupuesto(objetivo ?? actual!, vista === "contratar" && objetivo !== null && !deshabilitado);
    const necesita = modulo.dependeDe.map((id) => catalogo.modulos.find((m) => m.id === id)?.nombre ?? id);
    const conDemo = tieneDemo(modulo.id);

    const confirmar = async () => {
        if (!objetivo) return;
        setEnviando(true);
        try {
            await publicar("cambio_confirmado", objetivo);
            onCerrar();
        } finally {
            setEnviando(false);
        }
    };

    const textoContratar = estado === "otro_plan" && ficha.planAlternativo
        ? `Cambiar al plan ${ficha.planAlternativo.nombre}`
        : "Añadir a mi suscripción";

    return (
        <QModal nombre="fichaModulo" abierto titulo={modulo.nombre} onCerrar={onCerrar}
            pantallaCompleta={vista === "demo"} anchoEstable>
            <div className={`FichaModulo vista-${vista}`}>
                <header className="ficha-modulo-cabecera">
                    <span className={`ficha-modulo-icono estado-${estado}`}>
                        <QIcono nombre={iconoModulo(modulo)} tamaño="sm" />
                    </span>
                    <span className="ficha-modulo-resumen" title={modulo.descripcion}>{modulo.descripcion}</span>
                    <span className={`ficha-modulo-estado estado-${estado}`}>{etiquetaEstadoModulo[estado]}</span>
                    <span className="ficha-modulo-precio">{textoPrecioFicha(ficha, periodicidad)}</span>
                </header>

                {vista === "demo" && (
                    <DemoEmbebida moduloId={modulo.id} nombre={modulo.nombre} />
                )}

                {vista !== "demo" && (
                    <>
                        {modulo.descripcionLarga && <p className="ficha-modulo-descripcion">{modulo.descripcionLarga}</p>}
                        {modulo.caracteristicas.length > 0 && (
                            <ul className="ficha-modulo-caracteristicas">
                                {modulo.caracteristicas.map((c) => (
                                    <li key={c}><QIcono nombre="check" tamaño="sm" /> {c}</li>
                                ))}
                            </ul>
                        )}
                        {necesita.length > 0 && (
                            <p className="ficha-modulo-detalle">Funciona junto con {necesita.join(" y ")}.</p>
                        )}
                        {ficha.faltan.length > 0 && (
                            <QAviso variante="advertencia">
                                Tu plan no permite añadir {ficha.faltan.join(" ni ")}, que este módulo necesita.
                                Escríbenos y lo vemos contigo.
                            </QAviso>
                        )}
                        {estado === "no_disponible" && (
                            <p className="ficha-modulo-detalle">Ahora mismo no se ofrece en ningún plan. Si te interesa, escríbenos.</p>
                        )}
                    </>
                )}

                {vista === "contratar" && objetivo && planDestino && actual && (
                    <PresupuestoCambio
                        estado={presupuesto}
                        plan={planDestino}
                        limites={mi.derechos.limites}
                        puedeConfirmar={!deshabilitado && puedeConfirmarCambio(presupuesto.presupuesto, objetivo, actual)}
                        enviando={enviando}
                        onConfirmar={confirmar}
                    />
                )}

                <div className="botones maestro-botones ficha-modulo-botones">
                    {vista === "demo" ? (
                        <QBoton variante="borde" onClick={() => setVista("ficha")}>Volver a la ficha</QBoton>
                    ) : conDemo && (
                        <QBoton variante="borde" onClick={() => setVista("demo")}>Probar con datos de ejemplo</QBoton>
                    )}
                    {objetivo && vista === "ficha" && (
                        <QBoton onClick={() => setVista("contratar")} deshabilitado={deshabilitado}>{textoContratar}</QBoton>
                    )}
                    {vista === "contratar" && (
                        <QBoton variante="texto" onClick={() => setVista("ficha")}>Ahora no</QBoton>
                    )}
                </div>
            </div>
        </QModal>
    );
};
