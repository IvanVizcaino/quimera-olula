import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Criteria, Filtro } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { Cuenta } from "#/contabilidad/cuenta/diseño.ts";
import { getCuenta, getCuentas } from "#/contabilidad/cuenta/infraestructura.ts";

/** El valor de la opción es el CÓDIGO de la cuenta, no su id: es lo que pide
 * el alta de subcuenta (`codigo_cuenta`). */
export type OpcionCuenta = {
    valor: string;
    descripcion: string;
    descripcionOpcion: string;
};

interface CuentaSelectorProps {
    ejercicioId: string;
    valor: string;
    descripcion?: string;
    nombre?: string;
    label?: string;
    opcional?: boolean;
    evaluarCambio?: () => void;
    onChange: (opcion: OpcionCuenta | null) => void;
}

const opcionDesdeCuenta = (c: Cuenta): OpcionCuenta => ({
    valor: c.codigo,
    descripcion: c.codigo,
    descripcionOpcion: c.nombre ? `${c.codigo} — ${c.nombre}` : c.codigo,
});

export const CuentaSelector = ({
    ejercicioId,
    valor,
    descripcion = "",
    nombre = "codigo_cuenta",
    label = "Cuenta del plan",
    onChange,
    evaluarCambio,
    ...props
}: CuentaSelectorProps) => {
    const obtenerOpciones = async (texto: string, id?: string) => {
        if (id) {
            try {
                const cuenta = await getCuenta(id);
                return [opcionDesdeCuenta(cuenta)];
            } catch {
                return [];
            }
        }

        if (!ejercicioId) {
            return [];
        }

        const filtro: Filtro = texto.trim().length
            ? {
                  and: [
                      ["ejercicio_id", ejercicioId],
                      {
                          or: [
                              ["codigo", "~", texto],
                              ["nombre", "~", texto],
                          ],
                      },
                  ],
              }
            : [["ejercicio_id", ejercicioId]];

        const criteria: Criteria = {
            ...criteriaDefecto,
            filtro,
            orden: ["codigo", "ASC"],
            paginacion: { pagina: 1, limite: 50 },
        };

        const { datos } = await getCuentas(criteria);
        return datos.map(opcionDesdeCuenta);
    };

    return (
        <QAutocompletar<OpcionCuenta>
            label={label}
            nombre={nombre}
            valor={valor}
            descripcion={descripcion || valor}
            onChange={onChange}
            obtenerOpciones={obtenerOpciones}
            longitudMinima={0}
            evaluarCambio={evaluarCambio}
            {...props}
        />
    );
};
