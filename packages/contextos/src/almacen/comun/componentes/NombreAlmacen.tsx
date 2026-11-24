import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { useEffect, useState } from "react";
import { obtenerAlmacenes } from "../../almacen/infraestructura.ts";

// Los almacenes son pocos y cambian poco: se piden una vez por sesión de la página.
let nombres: Promise<Map<string, string>> | null = null;

const nombresAlmacenes = (): Promise<Map<string, string>> => {
    nombres ??= obtenerAlmacenes(undefined as unknown as Filtro, undefined as unknown as Orden)
        .then((almacenes) => new Map(almacenes.map((a) => [a.id, a.nombre])))
        .catch(() => { nombres = null; return new Map(); });
    return nombres;
};

/** El nombre de un almacén por su código (el código mientras carga o si no lo encuentra). */
export const NombreAlmacen = ({ id }: { id: string }) => {
    const [nombre, setNombre] = useState<string | null>(null);
    useEffect(() => {
        let vigente = true;
        nombresAlmacenes().then((m) => vigente && setNombre(m.get(id) ?? null));
        return () => { vigente = false; };
    }, [id]);
    return <>{nombre ?? id}</>;
};
