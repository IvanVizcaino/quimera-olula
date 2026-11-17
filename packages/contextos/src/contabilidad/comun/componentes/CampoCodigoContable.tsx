import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { useEffect, useRef, useState } from "react";
import {
    buscarCuentas,
    buscarSubcuentas,
    codigoYNombre,
    cuentaPorCodigo,
    subcuentaPorCodigo,
} from "../busqueda_plan_contable.ts";

/** Opción del campo: el valor es el CÓDIGO (lo que guardan series, impuestos...). */
export type OpcionCodigoContable = {
    valor: string;
    descripcion: string;
    descripcionOpcion: string;
};

type Registro = { codigo: string; nombre: string };

/** Props que da `uiProps(campo)` y que el campo usa. */
export interface CampoCodigoContableProps {
    ejercicioId: string;
    label: string;
    nombre: string;
    valor?: unknown;
    onChange?: (opcion: OpcionCodigoContable) => void;
    evaluarCambio?: () => void;
    deshabilitado?: boolean;
    soloLectura?: boolean;
    erroneo?: boolean;
    textoValidacion?: string;
    opcional?: boolean;
}

const opcion = ({ codigo, nombre }: Registro): OpcionCodigoContable => ({
    valor: codigo,
    descripcion: codigoYNombre(codigo, nombre),
    descripcionOpcion: codigoYNombre(codigo, nombre),
});

const VACIA: OpcionCodigoContable = { valor: "", descripcion: "", descripcionOpcion: "" };

/**
 * Campo de código contable con desplegable, como el de subcuenta de las
 * partidas de Asientos manuales: se escribe parte del código o de la
 * descripción, se filtra dentro del ejercicio y al elegir queda
 * «código — descripción». El valor del modelo es el código; al vaciarlo
 * queda "" (no null) para que el formulario lo envíe como quitado.
 */
const CampoCodigoContable = ({
    ejercicioId,
    valor,
    onChange,
    buscar,
    porCodigo,
    deshabilitado,
    soloLectura,
    opcional = true,
    ...props
}: CampoCodigoContableProps & {
    buscar: (ejercicioId: string, texto: string) => Promise<Registro[]>;
    porCodigo: (ejercicioId: string, codigo: string) => Promise<Registro | null>;
}) => {
    const codigo = valor === null || valor === undefined ? "" : String(valor);
    const [descripcion, setDescripcion] = useState(codigo);
    // Código cuya descripción ya se conoce (la de la opción elegida).
    const conocido = useRef<string | null>(null);

    useEffect(() => {
        if (!codigo) {
            setDescripcion("");
            return;
        }
        if (conocido.current === codigo) return;
        let vigente = true;
        setDescripcion(codigo);
        porCodigo(ejercicioId, codigo)
            .then((r) => {
                if (vigente && r) setDescripcion(codigoYNombre(r.codigo, r.nombre));
            })
            .catch(() => undefined);
        return () => {
            vigente = false;
        };
    }, [codigo, ejercicioId, porCodigo]);

    const obtenerOpciones = async (texto: string, id?: string) => {
        if (id) {
            const r = await porCodigo(ejercicioId, id).catch(() => null);
            return r ? [opcion(r)] : [];
        }
        return (await buscar(ejercicioId, texto)).map(opcion);
    };

    const cambiar = (elegida: OpcionCodigoContable | null) => {
        const nueva = elegida ?? VACIA;
        conocido.current = nueva.valor;
        setDescripcion(nueva.descripcion);
        onChange?.({ valor: nueva.valor, descripcion: nueva.descripcion, descripcionOpcion: nueva.descripcionOpcion });
    };

    return (
        <QAutocompletar<OpcionCodigoContable>
            {...props}
            valor={codigo}
            descripcion={descripcion}
            onChange={cambiar}
            obtenerOpciones={obtenerOpciones}
            longitudMinima={1}
            opcional={opcional}
            deshabilitado={deshabilitado}
            soloLectura={soloLectura}
        />
    );
};

/** Subcuenta (`co_subcuentas`) del ejercicio, guardada por código. */
export const CampoSubcuenta = (props: CampoCodigoContableProps) => (
    <CampoCodigoContable {...props} buscar={buscarSubcuentas} porCodigo={subcuentaPorCodigo} />
);

/** Cuenta (`co_cuentas`) del ejercicio, guardada por código. */
export const CampoCuenta = (props: CampoCodigoContableProps) => (
    <CampoCodigoContable {...props} buscar={buscarCuentas} porCodigo={cuentaPorCodigo} />
);
