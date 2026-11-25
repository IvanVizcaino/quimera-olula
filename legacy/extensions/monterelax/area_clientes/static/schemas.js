import { util } from "quimera";
import { Field, Schema } from "quimera/lib";

export default parent => ({
  ...parent,
  catalogo: Schema("modelos", "idmodelo")
    .fields({
      referencia: Field.Text("idmodelo", "Id. Modelo"),
      descripcion: Field.Text("descripcion", "Descripción"),
      total: Field.Int("total", "Total configuraciones"),
    })
    // .filter(() => ["publico", "eq", true])
    .filter(() => ["enportada", "eq", true])
    .order(() => ({ field: "descripcion", direction: "ASC" })),
  lineaCarrito: Schema("to_lineascarrito", "idlinea").fields({
    idCarrito: Field.Int("idcarrito", "Id. Carrito"),
    idLinea: Field.Int("idlinea", "Id. Linea"),
    idModelo: Field.Text("idmodelo", "Modelo"),
    idTela: Field.Text("idtela", "Tela"),
    referencia: Field.Text("referencia", "SKU"),
    descripcion: Field.Text("descripcion", "SKU"),
    cantidad: Field.Int("cantidad", "Cantidad"),
    pvpUnitario: Field.Currency("pvpunitario", "PVP"),
    pvpTotal: Field.Currency("pvptotal", "Total"),
    config: Field.Text("config", "Configuraciones"),
    configuracion: Field.Text("configuracion", "Configuracion formateada"),
  }),
  configSofa: Schema("to_lineascarrito", "idlinea").fields({
    idLinea: Field.Int("idlinea", "Id. Linea"),
    idModelo: Field.Text("idmodelo", "Modelo"),
    idTela: Field.Text("idtela", "Tela"),
    configuracion: Field.Text("config", "Configuración"),
  }),
  misPedidos: parent.misPedidos.fields({
    codClienteTienda: Field.Text("codclientetienda", "Código de Subcliente"),
    nombreClienteTienda: Field.Text("nombreclientetienda", "Nombre de Subcliente"),
    fechasalidareal: Field.Date("fechasalidareal", "Fecha Real"),
    referencia: Field.Text("referencia", "Referencia"),
    servido: Field.Options("servido", "Servido").options([
      { key: "Sí", value: "Servido" },
      { key: "No", value: "Pendiente" },
      { key: "Parcial", value: "Servido parcial" },
      { key: "Anulado", value: "Anulado" },
    ]),
    estado: Field.Text("estado", "Estado"),
  }),
  //.filter(() => ["publico", "eq", true])
  //.order(() => ({ field: "descripcion", direction: "ASC" })),
  preciosBase: Schema("preciosbase", "idpreciobase")
    .fields({
      idpreciobase: Field.Int("idpreciobase", "idpreciobase"),
      precio: Field.Float("precio", "precio"),
      confbase: Field.Text("confbase", "confbase"),
      idModelo: Field.Text("idmodelo", "idModelo"),
      descripcion: Field.Text("descripcion", "descripcion"),
      cubicaje: Field.Text("cubicaje", "cubicaje"),
    })
    .limit(1000),
  reparaciones: Schema("pr_reparacion", "idreparacion")
    .fields({
      idReparacion: Field.Text("idreparacion", "Id. Reparacion"),
      estado: Field.Options("estado", "Estado")
        // .default("pendiente")
        .options([
          { key: "PTE", value: "Pendiente" },
          { key: "PTE RECOGIDA", value: "Pendiente de recogida" },
          { key: "TERMINADO", value: "Terminado" },
          { key: "SERVIDO", value: "Servido" },
        ]),
      idCausa: Field.Text("idcausa", "Causas"),
      descripcionCausa: Field.Text("descripcioncausa", "Descripción causa"),
      fecha: Field.Date("fecha", "Fecha"),
      descripcion: Field.Text("descripcion", "Descripción"),
      codCliente: Field.Text("codcliente", "Codcliente"),
      referencia: Field.Text("referencia", "Referencia"),
      pedidoAsociado: Field.Text("pedidoasociado", "Pedido asociado"),
      idPedidoAsociado: Field.Text("idpedidoasociado", "Id pedido asociado"),
      costeTotal: Field.Float("costetotal", "Coste total"),
    })
    // .filter(() => ["publico", "eq", true])
    .filter(() => ["codcliente", "eq", util.getUser().codCliente])
    .order(() => ({ field: "fecha", direction: "DESC" })),
});
