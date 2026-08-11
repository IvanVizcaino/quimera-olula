import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QFechaHora } from "@olula/componentes/atomos/qfechahora.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useCallback, useState } from "react";
import { ResultadoVerificacionJornada } from "../diseño.ts";
import { getVerificarFirma } from "../infraestructura.ts";

export const RevisarFirmaJornadas = ({ publicar }: { publicar: EmitirEvento }) => {
    const [desde, setDesde] = useState('');
    const [cargando, setCargando] = useState(false);
    const [resultado, setResultado] = useState<ResultadoVerificacionJornada | null>(null);

    const verificar = useCallback(async () => {
        setCargando(true);
        try {
            const res = await getVerificarFirma(desde || null);
            setResultado(res);
        } finally {
            setCargando(false);
        }
    }, [desde]);

    const cerrar = useCallback(() => publicar("jornadas_revisadas"), [publicar]);
    const cancelar = useCallback(() => publicar("revision_de_firma_cancelada"), [publicar]);

    return (
        <QModal nombre="revisarFirmaJornadas" titulo="Verificar firma de jornadas" abierto={true} onCerrar={cancelar}>
            {!resultado ? (
                <div>
                    <quimera-formulario>
                        <QFechaHora
                            label="Desde"
                            nombre="desde"
                            valor={desde}
                            onChange={(v) => setDesde(v)}
                            deshabilitado={cargando}
                            opcional={true}
                        />
                    </quimera-formulario>
                    <div className="botones maestro-botones">
                        <QBoton onClick={verificar} deshabilitado={cargando}>
                            {cargando ? 'Verificando...' : 'Verificar'}
                        </QBoton>
                        <QBoton onClick={cancelar} variante="texto" deshabilitado={cargando}>
                            Cancelar
                        </QBoton>
                    </div>
                </div>
            ) : (
                <div>
                    <p><strong>Resultado:</strong> {resultado.verificada ? '✓ Firma válida' : '✗ Firma inválida'}</p>
                    <p>Total eventos: {resultado.totalEventos}</p>
                    <p>Eventos pre-firma: {resultado.eventosPrefirma}</p>
                    {resultado.primerIdInvalido !== null && (
                        <p>Primer evento inválido ID: {resultado.primerIdInvalido}</p>
                    )}
                    <div className="botones maestro-botones">
                        <QBoton onClick={cerrar}>Cerrar</QBoton>
                    </div>
                </div>
            )}
        </QModal>
    );
};
