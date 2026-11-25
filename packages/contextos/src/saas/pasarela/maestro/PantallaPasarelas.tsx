import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useEffect } from "react";
import { resumenCicloATexto } from "../dominio.js";
import { TarjetaPasarela } from "../tarjeta/TarjetaPasarela.js";
import { contextoMaestroPasarelaInicial } from "./maestro.js";
import { getMaquina } from "./maquina.js";

export const PantallaPasarelas = () => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoMaestroPasarelaInicial);
    const { estado, pasarelas, credenciales, mensajes, resumenCiclo } = ctx;

    useEffect(() => {
        emitir("recarga_de_pasarelas_solicitada");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Pasarela">
            <h2>Pasarelas de cobro</h2>

            <div className="maestro-botones">
                <QBoton variante="borde" onClick={() => emitir("ciclo_solicitado")}>
                    Pasar el ciclo de cobro ahora
                </QBoton>
            </div>
            {resumenCiclo && <QAviso variante="info">{resumenCicloATexto(resumenCiclo)}</QAviso>}

            {pasarelas.map((p) => (
                <TarjetaPasarela key={p.id} pasarela={p} credenciales={credenciales} mensaje={mensajes[p.id] ?? ""} publicar={emitir} />
            ))}
            {pasarelas.length === 0 && <p>No hay pasarelas.</p>}

            {estado === "CONFIRMANDO_CICLO" && (
                <QModalConfirmacion
                    nombre="pasarCicloDeCobro"
                    abierto={true}
                    titulo="Pasar el ciclo de cobro"
                    mensaje={"Ejecuta ahora lo mismo que el proceso diario: renovaciones, cobros y cambios de estado de todas las suscripciones.\n¿Continuar?"}
                    labelAceptar="Pasar ciclo"
                    onCerrar={() => emitir("ciclo_cancelado")}
                    onAceptar={() => emitir("ciclo_confirmado")}
                />
            )}
        </div>
    );
};
