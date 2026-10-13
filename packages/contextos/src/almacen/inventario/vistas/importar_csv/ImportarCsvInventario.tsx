import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.ts";
import { QCargando } from "@olula/componentes/atomos/qcargando.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback, useRef, useState } from "react";
import { Inventario, ResultadoImportarCsvInventario } from "../../diseño.ts";
import { postImportarCsvInventario } from "../../infraestructura.ts";

export const ImportarCsvInventario = ({
    inventario,
    publicar,
}: {
    inventario: Inventario;
    publicar: EmitirEvento;
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [separador, setSeparador] = useState("|");
    const [ignorarCabecera, setIgnorarCabecera] = useState(true);
    const [cargando, setCargando] = useState(false);
    const [resultado, setResultado] = useState<ResultadoImportarCsvInventario | null>(null);

    const cancelar_ = useCallback(() => publicar("importacion_csv_cancelada"), [publicar]);

    const leerFichero = (fichero: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const lector = new FileReader();
            lector.onload = () => resolve(String(lector.result ?? ""));
            lector.onerror = () => reject(lector.error);
            lector.readAsText(fichero);
        });

    const importar_ = useCallback(async () => {
        inputRef.current?.click();
    }, []);

    const onFichero = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const fichero = e.target.files?.[0];
            e.target.value = "";
            if (!fichero) return;
            setCargando(true);
            try {
                const contenido = await leerFichero(fichero);
                const res = await postImportarCsvInventario(inventario.id, contenido, {
                    separador,
                    ignorarPrimeraLinea: ignorarCabecera,
                });
                setResultado(res);
            } finally {
                setCargando(false);
            }
        },
        [ignorarCabecera, inventario.id, separador]
    );

    const cerrarResultado_ = useCallback(() => {
        if (resultado) {
            publicar("importacion_csv_completada", resultado);
        }
    }, [publicar, resultado]);

    const [importar, cancelar] = useForm(importar_, cancelar_);
    const [cerrarResultado] = useForm(cerrarResultado_, cerrarResultado_);

    if (resultado) {
        return (
            <QModal
                abierto={true}
                nombre="resultadoImportarCsvInventario"
                titulo="Importación CSV"
                onCerrar={cerrarResultado}
            >
                <p>
                    Lecturas en fichero: <strong>{resultado.lecturasImportadas}</strong>
                </p>
                <p>
                    Líneas actualizadas: <strong>{resultado.lineasActualizadas}</strong>
                </p>
                <div className="botones maestro-botones">
                    <QBoton onClick={cerrarResultado}>Cerrar</QBoton>
                </div>
            </QModal>
        );
    }

    return (
        <QModal
            abierto={true}
            nombre="importarCsvInventario"
            titulo="Importar recuento desde CSV"
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <p>Formato esperado: referencia y cantidad separadas (por defecto con «|»).</p>
                <QInput
                    nombre="separador_csv"
                    label="Separador"
                    valor={separador}
                    onChange={(v) => setSeparador(v.slice(0, 1) || "|")}
                />
                <label>
                    <input
                        type="checkbox"
                        checked={ignorarCabecera}
                        onChange={(e) => setIgnorarCabecera(e.target.checked)}
                    />{" "}
                    Ignorar primera línea (cabecera)
                </label>
            </quimera-formulario>
            <input
                ref={inputRef}
                type="file"
                accept=".csv,.txt,text/csv"
                style={{ display: "none" }}
                onChange={onFichero}
            />
            <div className="botones maestro-botones">
                <QBoton onClick={importar}>Elegir fichero e importar</QBoton>
            </div>
            <QCargando visible={cargando} mensaje="Importando CSV…" />
        </QModal>
    );
};
