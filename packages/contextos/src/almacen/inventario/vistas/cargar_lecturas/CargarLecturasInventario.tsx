import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback, useState } from "react";
import { Inventario } from "../../diseño.ts";
import { postLecturasInventario } from "../../infraestructura.ts";

/**
 * Carga de un fichero de lecturas como en Eneboo: una lectura por línea con
 * referencia, cantidad y (opcional) localización, separadas por un carácter.
 * Las lecturas de un mismo artículo se suman en su línea.
 */
export const CargarLecturasInventario = ({
    inventario,
    publicar,
}: {
    inventario: Inventario;
    publicar: EmitirEvento;
}) => {
    const [contenido, setContenido] = useState("");
    const [nombreFichero, setNombreFichero] = useState("");
    const [separador, setSeparador] = useState("|");
    const [ignorarPrimeraLinea, setIgnorarPrimeraLinea] = useState(false);

    const onFichero = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fichero = e.target.files?.[0];
        if (!fichero) return;
        setNombreFichero(fichero.name);
        setContenido(await fichero.text());
    }, []);

    const cargar_ = useCallback(async () => {
        const resultado = await postLecturasInventario(inventario.id, {
            contenido,
            separador,
            ignorarPrimeraLinea,
        });
        publicar("lecturas_cargadas", resultado);
    }, [inventario.id, contenido, separador, ignorarPrimeraLinea, publicar]);

    const cancelar_ = useCallback(
        () => publicar("carga_de_lecturas_cancelada"),
        [publicar]
    );

    const [cargar, cancelar] = useForm(cargar_, cancelar_);

    const valido = contenido.trim() !== "" && separador.length === 1;

    return (
        <QModal
            abierto={true}
            nombre="cargarLecturasInventario"
            titulo={`Cargar fichero en el inventario ${inventario.id}`}
            onCerrar={cancelar}
        >
            <div className="CargarLecturasInventario">
                <p>Formato por línea: referencia{separador}cantidad{separador}localización (opcional).</p>
                <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={onFichero}
                />
                {nombreFichero && <p>{nombreFichero}: {contenido.split(/\r?\n/).filter((l) => l.trim()).length} líneas</p>}
                <quimera-formulario>
                    <QInput
                        label="Carácter separador"
                        nombre="separador"
                        valor={separador}
                        onChange={(valor) => setSeparador(valor)}
                    />
                    <QCheckbox
                        label="Ignorar primera línea"
                        nombre="ignorarPrimeraLinea"
                        valor={ignorarPrimeraLinea}
                        onChange={(valor) => setIgnorarPrimeraLinea(valor === "true")}
                    />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={cargar} deshabilitado={!valido}>
                        Cargar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
