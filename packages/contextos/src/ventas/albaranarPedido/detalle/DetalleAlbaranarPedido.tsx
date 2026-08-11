import { QBoton, QModal } from "@olula/componentes/index.ts";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import { useContext, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import "./DetalleAlbaranarPedido.css";
import { contextoVacio } from "./dominio.ts";
import { Lineas } from "./Lineas/Lineas.tsx";
import { getMaquina } from "./maquina.ts";

type UrlPorId = (id: string) => string;

export const DetalleAlbaranarPedido = () => {
  const params = useParams();
  const navigate = useNavigate();
  const pedidoId = params.id;
  const pedidoIdCargadoRef = useRef<string | null>(null);

  // Las rutas de retorno dependen de la app: olula usa rutas propias
  // (singular), mientras que las apps con legacy (p.ej. cabrera) navegan a las
  // vistas legacy (plural). Se resuelven por factory con fallback a olula.
  const { app } = useContext(FactoryCtx);
  const urlPedido =
    (app.Ventas?.albaranar_url_pedido as UrlPorId | undefined) ??
    ((id: string) => `/ventas/pedido/${id}`);
  const urlAlbaran =
    (app.Ventas?.albaranar_url_albaran as UrlPorId | undefined) ??
    ((id: string) => `/ventas/albaran/${id}`);

  const { ctx, emitir } = useMaquina(getMaquina, contextoVacio, async () => {});

  const { pedido, lineas, albaranCreado } = ctx;

  useEffect(() => {
    if (pedidoId && pedidoId !== pedidoIdCargadoRef.current) {
      pedidoIdCargadoRef.current = pedidoId;
      emitir("cargar", pedidoId, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoId]);

  if (
    ctx.estado === "INICIAL" ||
    ctx.estado === "VACIO" ||
    ctx.estado === "CARGANDO"
  ) {
    return <div className="AlbaranarPedido">Cargando...</div>;
  }

  return (
    <div className="AlbaranarPedido">
      <div className="DetalleAlbaranarPedido">
        <h2>
          Albaranar Pedido: {pedido.cliente.nombre_cliente} - {pedido.codigo}
        </h2>
        <Lineas
          pedido={pedido}
          lineas={lineas}
          estado={ctx.estado}
          publicar={emitir}
        />
      </div>

      <QModal
        nombre="albaranCreado"
        abierto={ctx.estado === "ALBARAN_CREADO" && Boolean(albaranCreado)}
        titulo="Albarán generado"
        onCerrar={() => emitir("albaranado_completado_cerrado")}
      >
        <div className="mensaje" style={{ whiteSpace: "pre-line" }}>
          El albarán se ha generado correctamente.
        </div>
        <div className="botones">
          <QBoton
            variante="texto"
            onClick={() => pedidoId && navigate(urlPedido(pedidoId))}
          >
            Volver al pedido
          </QBoton>
          <QBoton
            onClick={() =>
              albaranCreado && navigate(urlAlbaran(albaranCreado.id))
            }
          >
            Ir al albarán creado
          </QBoton>
        </div>
      </QModal>
    </div>
  );
};
