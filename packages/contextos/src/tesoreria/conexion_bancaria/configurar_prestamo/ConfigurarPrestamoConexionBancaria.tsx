import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useMemo } from "react";
import { PrestamoBancario } from "../diseño.js";
import { metaSubcuentasPrestamo } from "../dominio.js";
import { patchPrestamoBancario } from "../infraestructura.js";

/**
 * Subcuentas con las que se contabiliza cada cuota del préstamo: el capital
 * contra la deuda (52x/17x) y los intereses contra el gasto (6623x). Sin ellas
 * la conciliación propone la cuota pero no la casa sola.
 */
export const ConfigurarPrestamoConexionBancaria = ({
    prestamo,
    publicar,
}: {
    prestamo: PrestamoBancario;
    publicar: EmitirEvento;
}) => {
    const inicial = useMemo(() => ({
        codigoSubcuentaCapital: prestamo.codigoSubcuentaCapital ?? "",
        codigoSubcuentaIntereses: prestamo.codigoSubcuentaIntereses ?? "",
    }), [prestamo]);
    const { modelo, uiProps, valido } = useModelo(metaSubcuentasPrestamo, inicial);

    const guardar_ = async () => {
        await patchPrestamoBancario(prestamo.id, {
            codigoSubcuentaCapital: modelo.codigoSubcuentaCapital.trim(),
            codigoSubcuentaIntereses: modelo.codigoSubcuentaIntereses.trim(),
        });
        await publicar("prestamo_configurado");
    };
    const cancelar_ = () => publicar("configuracion_prestamo_cancelada");

    const [guardar, cancelar] = useForm(guardar_, cancelar_);

    return (
        <QModal abierto={true} nombre="configurarPrestamoConexionBancaria"
            titulo={`Préstamo ${prestamo.contrato ?? prestamo.nombre}`} onCerrar={cancelar}>
            <quimera-formulario>
                <QInput label="Subcuenta del capital" {...uiProps("codigoSubcuentaCapital")} />
                <QInput label="Subcuenta de los intereses" {...uiProps("codigoSubcuentaIntereses")} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={guardar} deshabilitado={!valido}>Guardar</QBoton>
            </div>
        </QModal>
    );
};
