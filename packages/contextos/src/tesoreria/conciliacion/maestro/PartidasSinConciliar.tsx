import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { useEffect, useState } from "react";
import { PartidaHuerfana } from "../diseño.js";
import { getPartidasHuerfanas } from "../infraestructura.js";

type FilaPartida = {
    id: string;
    fecha: Date;
    descripcion: string;
    numeroAsiento: string;
    importe: number;
};

const metaTablaPartidas: MetaTabla<FilaPartida> = [
    { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
    { id: "descripcion", cabecera: "Concepto", esTitulo: true },
    { id: "numeroAsiento", cabecera: "Asiento", estilo: "secundario" },
    { id: "importe", cabecera: "Importe", tipo: "moneda", divisa: "EUR" },
];

const filaDesdePartida = (partida: PartidaHuerfana): FilaPartida => ({
    id: String(partida.idasiento),
    fecha: partida.fecha,
    descripcion: partida.descripcion ?? "",
    numeroAsiento: partida.numeroAsiento ?? "",
    importe: partida.importe,
});

/**
 * Listado de las partidas contables de la subcuenta del banco sin movimiento
 * bancario conciliado que las cubra (las que cuenta la alerta del cuadre).
 */
export const PartidasSinConciliar = ({
    cuentaId,
    onCerrar,
}: {
    cuentaId: string;
    onCerrar: () => void;
}) => {

    const [partidas, setPartidas] = useState<FilaPartida[] | null>(null);

    useEffect(() => {
        getPartidasHuerfanas(cuentaId)
            .then((lista) => setPartidas(lista.map(filaDesdePartida)))
            .catch(console.error);
    }, [cuentaId]);

    return (
        <QModal
            nombre="partidasSinConciliar"
            titulo="Partidas contables sin conciliar"
            abierto={true}
            onCerrar={onCerrar}
        >
            <div className="PartidasSinConciliar">
                <QTabla
                    metaTabla={metaTablaPartidas}
                    datos={partidas ?? []}
                    cargando={partidas === null}
                    orden={["fecha", "DESC"]}
                />
                <div className="botones maestro-botones">
                    <QBoton onClick={onCerrar}>Cerrar</QBoton>
                </div>
            </div>
        </QModal>
    );
};
