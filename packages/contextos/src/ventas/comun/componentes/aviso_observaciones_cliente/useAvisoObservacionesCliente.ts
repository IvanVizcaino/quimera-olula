import { getCliente } from "#/ventas/cliente/infraestructura.ts";
import { ConfigVentas } from "#/ventas/config/diseño.ts";
import { getConfigVentas } from "#/ventas/config/infraestructura.ts";
import { useCallback, useRef, useState } from "react";
import {
  AvisoObservacionesCliente,
  DependenciasAvisoObservacionesCliente,
} from "./diseño.ts";
import { buscarAvisoObservacionesCliente } from "./dominio.ts";

const dependenciasPorDefecto: DependenciasAvisoObservacionesCliente = {
  getConfig: getConfigVentas,
  getObservaciones: async (clienteId) => (await getCliente(clienteId)).observaciones,
};

/**
 * Aviso no bloqueante con las observaciones del cliente al elegirlo en un
 * documento de venta. `avisar` se llama con el cliente elegido; repetir el
 * mismo cliente no vuelve a consultar. La configuración se lee una vez.
 */
export const useAvisoObservacionesCliente = (
  dependencias: DependenciasAvisoObservacionesCliente = dependenciasPorDefecto
) => {
  const [aviso, setAviso] = useState<AvisoObservacionesCliente | null>(null);
  const ultimoCliente = useRef<string | null>(null);
  const config = useRef<Promise<ConfigVentas> | null>(null);

  const avisar = useCallback(
    async (clienteId: string | null | undefined) => {
      const id = clienteId || null;
      if (id === ultimoCliente.current) return;
      ultimoCliente.current = id;
      setAviso(null);

      const getConfig = () => {
        config.current ??= dependencias.getConfig().catch((error) => {
          config.current = null;
          throw error;
        });
        return config.current;
      };

      const nuevoAviso = await buscarAvisoObservacionesCliente(id, {
        getConfig,
        getObservaciones: dependencias.getObservaciones,
      });
      if (ultimoCliente.current === id) setAviso(nuevoAviso);
    },
    [dependencias]
  );

  const cerrar = useCallback(() => setAviso(null), []);

  return { aviso, avisar, cerrar };
};
