import { pitidoError } from "#/almacen/comun/audio.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.js";
import { useContext, useState } from "react";
import { LineaOrdenAlmacen, OrdenAlmacen } from "../../diseño.ts";
import { sobranteLinea } from "../../dominio.ts";
import { devolverSobrante } from "../../infraestructura.ts";
import { CodigoResuelto } from "../../pasos/diseño.ts";
import { resolverCodigo } from "../../pasos/resolver.ts";

type Destino = Extract<CodigoResuelto, { tipo: "caja" | "ubicacion" }>;

const CampoDestino = ({ onLeido }: { onLeido: (texto: string) => void }) => {
    const focus = useFocus();
    return (
        <QInput
            label="Ubicación o caja de destino"
            nombre="destino_devolucion"
            valor=""
            onEnterKeyUp={onLeido}
            ref={focus}
        />
    );
};

/**
 * Devuelve el material recogido de más en una línea de salida, p. ej. porque
 * el pedido se redujo en ventas después de recogerlo.
 */
export const DevolverSobrante = ({
    orden,
    linea,
    publicar,
}: {
    orden: OrdenAlmacen;
    linea: LineaOrdenAlmacen;
    publicar: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const sobrante = sobranteLinea(linea);
    const lotes = [...new Set(linea.lecturas.map((l) => l.loteId).filter((l): l is string => !!l))];

    const [cantidad, setCantidad] = useState(String(sobrante));
    const [lote, setLote] = useState<string | null>(lotes.length === 1 ? lotes[0] : null);
    const [destino, setDestino] = useState<Destino | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [clave, setClave] = useState(0);

    const num = parseFloat(cantidad);
    const cantidadValida = !isNaN(num) && num > 0 && num <= sobrante;
    const loteValido = lotes.length === 0 || !!lote;
    const puedeDevolver = cantidadValida && loteValido && !!destino;

    const cancelar = () => publicar("devolucion_sobrante_cancelada");

    const onDestinoLeido = async (texto: string) => {
        const codigo = await resolverCodigo(texto, ["ubicacion", "caja"]);
        if (!codigo || codigo.tipo === "articulo") {
            pitidoError();
            setError(`Código ${texto} no reconocido como ubicación o caja`);
            setClave((k) => k + 1);
            return;
        }
        setError(null);
        setDestino(codigo);
    };

    const devolver = async () => {
        if (!puedeDevolver || !destino) return;
        let hecho = false;
        await intentar(async () => {
            await devolverSobrante(orden.id, {
                lineaId: linea.id,
                cantidad: num,
                loteId: lote,
                idUbicacionDestino: destino.tipo === "ubicacion" ? destino.id : destino.idUbicacion,
                idCajaDestino: destino.tipo === "caja" ? destino.id : null,
            });
            hecho = true;
        });
        if (hecho) await publicar("sobrante_devuelto");
    };

    return (
        <QModal abierto={true} nombre="devolverSobrante" titulo="Devolver sobrante" onCerrar={cancelar}>
            <div className="DevolverSobrante">
                <p>
                    {linea.sku} — {linea.articulo}: se han recogido{" "}
                    <strong>{sobrante}</strong> de más tras un cambio en el pedido.
                    Déjalas en una ubicación o caja y léela.
                </p>
                <quimera-formulario>
                    <QInput
                        label="Cantidad a devolver"
                        nombre="cantidad_devolucion"
                        tipo="numero"
                        valor={cantidad}
                        onChange={setCantidad}
                    />
                    {lotes.length > 1 && (
                        <div>
                            <label>Lote</label>
                            <select value={lote ?? ""} onChange={(e) => setLote(e.target.value || null)}>
                                <option value="">Elige el lote</option>
                                {lotes.map((l) => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    )}
                    {destino ? (
                        <p>
                            <QEtiqueta variante="exito">
                                {destino.tipo === "caja" ? `Caja ${destino.lpn}` : `Ubicación ${destino.codigo}`}
                            </QEtiqueta>{" "}
                            <QBoton variante="borde" onClick={() => setDestino(null)}>Cambiar</QBoton>
                        </p>
                    ) : (
                        <CampoDestino key={clave} onLeido={onDestinoLeido} />
                    )}
                </quimera-formulario>
                {!cantidadValida && <p className="q-texto-error">La cantidad debe estar entre 0 y {sobrante}</p>}
                {error && <p className="q-texto-error">{error}</p>}
                <div className="botones maestro-botones">
                    <QBoton onClick={devolver} deshabilitado={!puedeDevolver}>Devolver</QBoton>
                    <QBoton variante="borde" onClick={cancelar}>Cancelar</QBoton>
                </div>
            </div>
        </QModal>
    );
};
