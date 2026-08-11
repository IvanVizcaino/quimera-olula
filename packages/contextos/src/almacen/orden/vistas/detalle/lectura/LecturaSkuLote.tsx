import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useFocus } from "@olula/lib/useFocus.js";
import { getSkuLote } from "../../../infraestructura.ts";

interface SkuLoteResultado {
    sku: string;
    descripcion: string;
    loteId: string | null;
}

export const LecturaSkuLote = ({
    onLectura,
    nombre,
}: {
    onLectura: (resultado: SkuLoteResultado) => void;
    nombre?: string;
}) => {
    const focus = useFocus();

    const leerCodigo = async (codigo: string) => {
        if (!codigo) return;
        const resultado = await getSkuLote(codigo);
        onLectura(resultado);
    };

    return (
        <QInput
            label="Código de barras"
            nombre={nombre || "codigo_barras"}
            valor=""
            onEnterKeyUp={leerCodigo}
            ref={focus}
        />
    );
};
