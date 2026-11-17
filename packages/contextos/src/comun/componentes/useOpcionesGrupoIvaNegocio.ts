import { capitalizarDescripcion } from "#/ventas/comun/dominio.ts";
import { obtenerDatosSelector } from "@olula/lib/infraestructura.ts";
import { useCallback, useEffect, useState } from "react";

export type OpcionGrupoIvaNegocio = { valor: string; descripcion: string };

/** Grupos de IVA de negocio (caché del servidor) con la descripción ya capitalizada. */
export const useOpcionesGrupoIvaNegocio = (): OpcionGrupoIvaNegocio[] => {
  const [opciones, setOpciones] = useState<OpcionGrupoIvaNegocio[]>([]);

  useEffect(() => {
    const cargarOpciones = async () => {
      const datos = await obtenerDatosSelector("grupo_iva_negocio")();
      setOpciones(
        datos.map((grupo) => ({
          valor: String(grupo.id ?? ""),
          descripcion: capitalizarDescripcion(String(grupo.descripcion ?? "")),
        }))
      );
    };

    cargarOpciones();
  }, []);

  return opciones;
};

/**
 * Descripción de un grupo de IVA de negocio por su código (la misma lista que
 * el selector), para mostrarlo en la franja de datos clave de los documentos.
 */
export const useDescripcionGrupoIvaNegocio = (): ((id: string) => string | undefined) => {
  const opciones = useOpcionesGrupoIvaNegocio();

  return useCallback(
    (id: string) => opciones.find((grupo) => grupo.valor === id)?.descripcion,
    [opciones]
  );
};
