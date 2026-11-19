import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCargando } from "@olula/componentes/atomos/qcargando.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CambiarPlan } from "../cambiar_plan/CambiarPlan.tsx";
import { CancelarSuscripcion } from "../cancelar/CancelarSuscripcion.tsx";
import { resultadoPagoDeUrl } from "../dominio.ts";
import { FacturasSuscripcion } from "../facturas/FacturasSuscripcion.tsx";
import { PagoSuscripcion } from "../pago/PagoSuscripcion.tsx";
import { ResumenSuscripcion } from "../resumen/ResumenSuscripcion.tsx";
import { getMaquina } from "./maquina.ts";
import { contextoPaginaInicial } from "./pagina.ts";
import "./PaginaSuscripcion.css";

/**
 * Ajustes > Suscripción. Los emails del backend enlazan aquí; la pasarela de pago vuelve
 * con `?pago=ok` o `?pago=cancelado`.
 */
export const PaginaSuscripcion = () => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoPaginaInicial);
    const [busqueda] = useSearchParams();
    const navigate = useNavigate();
    const [reintentando, setReintentando] = useState(false);
    const cargado = useRef(false);

    useEffect(() => {
        if (cargado.current) return;
        cargado.current = true;
        const pago = resultadoPagoDeUrl(busqueda.toString());
        void emitir("carga_solicitada", pago ?? undefined, true).catch(() => undefined);
        // Se limpia el parámetro para que recargar la página no repita el aviso.
        if (pago) navigate({ search: "" }, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const reintentar = async () => {
        setReintentando(true);
        try {
            await emitir("carga_solicitada");
        } finally {
            setReintentando(false);
        }
    };

    const { estado, mi, catalogo } = ctx;

    return (
        <div className="PaginaSuscripcion">
            <h2>Suscripción</h2>

            {estado === "CARGANDO" && <QCargando visible mensaje="Cargando tu suscripción…" />}

            {estado === "ERROR" && (
                <QAviso variante="error">
                    <div>
                        <p><strong>No hemos podido cargar tu suscripción.</strong></p>
                        <p>{ctx.error}</p>
                        <QBoton variante="borde" onClick={reintentar} deshabilitado={reintentando}>
                            {reintentando ? "Reintentando…" : "Reintentar"}
                        </QBoton>
                    </div>
                </QAviso>
            )}

            {estado === "SIN_SUSCRIPCION" && (
                <QAviso variante="info">
                    <div>
                        <p><strong>Tu empresa todavía no tiene un plan contratado.</strong></p>
                        <p>Ponte en contacto con nosotros para activar uno y poder gestionarlo desde aquí.</p>
                    </div>
                </QAviso>
            )}

            {mi?.suscripcion && catalogo && estado !== "CARGANDO" && estado !== "ERROR" && estado !== "SIN_SUSCRIPCION" && (
                <>
                    {ctx.aviso && (
                        <QAviso variante="info">
                            <span>{ctx.aviso}</span>
                            {estado === "ABIERTA" && (
                                <QBoton variante="texto" tamaño="pequeño" onClick={() => emitir("aviso_cerrado")}>
                                    Cerrar
                                </QBoton>
                            )}
                        </QAviso>
                    )}

                    <ResumenSuscripcion mi={mi} catalogo={catalogo} />
                    <PagoSuscripcion mi={mi} estado={estado} publicar={emitir} />
                    <CambiarPlan mi={mi} catalogo={catalogo} deshabilitado={estado !== "ABIERTA"} publicar={emitir} />
                    <FacturasSuscripcion facturas={mi.facturas} />
                    <CancelarSuscripcion suscripcion={mi.suscripcion} estado={estado} publicar={emitir} />
                </>
            )}
        </div>
    );
};
