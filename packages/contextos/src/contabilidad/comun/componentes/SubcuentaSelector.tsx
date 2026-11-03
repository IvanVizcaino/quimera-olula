import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Criteria, Filtro } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { Subcuenta } from "#/contabilidad/subcuenta/diseño.ts";
import { getSubcuenta, getSubcuentas } from "#/contabilidad/subcuenta/infraestructura.ts";

/** La opción lleva el `esIva` de la subcuenta: quien la elige necesita saber
 * si es de IVA sin volver a consultarla (ver EditorPartidasManual). */
export type OpcionSubcuenta = {
    valor: string;
    descripcion: string;
    descripcionOpcion: string;
    esIva: boolean;
};

interface SubcuentaSelectorProps {
    ejercicioId: string;
    valor: string;
    descripcion?: string;
    nombre?: string;
    label?: string;
    opcional?: boolean;
    onChange: (opcion: OpcionSubcuenta | null) => void;
}

const opcionDesdeSubcuenta = (sc: Subcuenta): OpcionSubcuenta => ({
    valor: sc.id,
    descripcion: sc.codigo,
    descripcionOpcion: `${sc.codigo} — ${sc.nombre}`,
    esIva: sc.esIva,
});

export const SubcuentaSelector = ({
    ejercicioId,
    valor,
    descripcion = "",
    nombre = "subcuenta_id",
    label = "Subcuenta",
    onChange,
    ...props
}: SubcuentaSelectorProps) => {
    const obtenerOpciones = async (texto: string, id?: string) => {
        if (id) {
            try {
                const sc = await getSubcuenta(id);
                return [opcionDesdeSubcuenta(sc)];
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
            paginacion: { pagina: 1, limite: 20 },
        };

        const { datos } = await getSubcuentas(criteria);
        return datos.map(opcionDesdeSubcuenta);
    };

    return (
        <QAutocompletar<OpcionSubcuenta>
            label={label}
            nombre={nombre}
            valor={valor}
            descripcion={descripcion}
            onChange={onChange}
            obtenerOpciones={obtenerOpciones}
            longitudMinima={1}
            {...props}
        />
    );
};
