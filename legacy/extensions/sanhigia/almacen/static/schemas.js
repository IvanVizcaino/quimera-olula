import { Field, Schema } from "quimera/lib";

export default parent => {
  console.log("PARENT", parent);

  return {
    ...parent,
    preparacionPedidos: Schema("sh_preparaciondepedidos", "codpreparaciondepedido")
      .fields({
        codPreparacionDePedido: Field.Int("codpreparaciondepedido", "Código"),
        descripcion: Field.Text("descripcion", "Descripción"),
        ubicacionini: Field.Int("ubicacionini", "Ubicacion Inicial"),
        ubicacionfin: Field.Int("ubicacionfin", "Ubicacion Final"),
        fecha: Field.Date("fecha", "Fecha"),
        tipo: Field.Text("tipo", "Estado"),
        tengoLineas: Field.Int("tengolineas", "Tengo lineas"),
        // codserie: Field.Text("codserie", "Serie"),
      })
      .filter(() => ["1", "eq", "1"])
      // .filter(data => (data?.codpreparaciondepedido ? ["codpreparaciondepedido", "eq", data?.codpreparaciondepedido] : null))
      .order(() => ({ field: "codpreparaciondepedido", direction: "DESC" })),
    lineasPedidoCliPreparacion: Schema("lineaspedidoscli", "idlinea")
      .fields({
        idLinea: Field.Int("idlinea", "idLinea").auto(),
        idPedido: Field.Int("idpedido", "idPedido"),
        codPreparacionDePedido: Field.Text("codpreparaciondepedido", "Preparacion"),
        referencia: Field.Text("referencia", "Referencia"),
        descripcion: Field.Text("descripcion", "Descripción"),
        cantidad: Field.Float("cantidad", "Cantidad"),
        pvpUnitario: Field.Currency("pvpunitario", "PVP Unitario"),
        pvpTotal: Field.Currency("pvptotal", "Total"),
        porComision: Field.Float("porcomision", "% Comisión"),
        totalEnAlbaran: Field.Float("totalenalbaran", "Total en albaran"),
        shCantAlbaran: Field.Float("shcantalbaran", "Cantidad en albaran"),
        cerradaPDA: Field.Bool("cerradapda", "Cerrado PDA"),
        estadoPDA: Field.Text("estadopda", "Estado PDA"),
        // codUbicacion: Field.Text("codubicacion", "Ubicación"),
        codUbicacionArticulo: Field.Bool("sh_codubicacionarticulo", "Ubicacion artículo"),
        dispLotesAlmacen: Field.Float("dispLotesAlmacen", "Stock disponible en almacen").decimals(
          2,
        ),
        porLotes: Field.Bool("porlotes", "Articulo por lotes"),
        codPedido: Field.Int("codpedido", "Código de pedido"),
        referenciaProv: Field.Bool("referenciaprov", "Referencia proveedor"),
        shPreparacion: Field.Text("sh_preparacion", "Estado Preparacion"),
      })
      .filter(({ preparacion }) => [
        "codpreparaciondepedido",
        "eq",
        preparacion.buffer.codPreparacionDePedido,
      ]),
    lineasPedidosCliVenta: Schema("lineaspedidoscli", "idlinea")
      .fields({
        idLinea: Field.Int("idlinea", "idLinea").auto(),
        idPedido: Field.Int("idpedido", "idPedido"),
        referencia: Field.Text("referencia", "Referencia"),
        descripcion: Field.Text("descripcion", "Descripción").required(),
        codImpuesto: Field.Text("codimpuesto", "I.V.A."),
        iva: Field.Float("iva", "% I.V.A.").default(0),
        recargo: Field.Float("recargo", "% Recargo").default(0),
        irpf: Field.Float("irpf", "% I.R.P.F."),
        pvpUnitario: Field.Currency("pvpunitario", "Precio unitario").required().default(0),
        pvpSinDto: Field.Currency("pvpsindto", "Importe").required().default(0),
        dtoLineal: Field.Currency("dtolineal", "Dto. Lineal").required().default(0),
        dtoPor: Field.Float("dtopor", "% Descuento").required().default(0),
        pvpTotal: Field.Currency("pvptotal", "Total").required().default(0),
        porComision: Field.Float("porcomision", "% Comisión"),
        multiplo: Field.Bool("sh_canmultiplovta", "Múltiplo").dump(false),
        cantidad: Field.Float("cantidad", "Cantidad")
          .required()
          .default(0)
          .validation(linea => {
            return (
              linea.multiplo &&
              linea.cantidad % linea.multiplo !== 0 && {
                error: true,
                message: `La cantidad debe ser múltiplo de ${linea.multiplo}`,
              }
            );
          }),
        canServida: Field.Float("totalenalbaran", "Servida").default(0),
        dtoManual: Field.Bool("dtomanual", "Dto.Manual").default(false),
        // codUbicacionArticulo: Field.Bool("sh_codubicacionarticulo", "Ubicacion artículo"),
        shCantAlbaran: Field.Float("shcantalbaran", "Cantidad en albaran"),
        dispLotesAlmacen: Field.Float("dispLotesAlmacen", "Stock disponible en almacen").decimals(
          2,
        ),
        porLotes: Field.Bool("porlotes", "Articulo por lotes"),
        estadoPDA: Field.Text("estadopda", "Estado PDA"),
        cerradaPDA: Field.Bool("cerradapda", "Cerrado PDA"),
        // codUbicacion: Field.Text("codubicacion", "Ubicación"),
        totalEnAlbaran: Field.Float("totalenalbaran", "Total en albaran"),
        referenciaProv: Field.Bool("referenciaprov", "Referencia proveedor"),
      })
      .filter(({ pedido }) => ["idpedido", "eq", pedido.buffer.idPedido]),
    lineasPedidosCliVentaUbi: Schema("lineaspedidoscli", "idlinea")
      .fields({
        idLinea: Field.Int("idlinea", "idLinea").auto(),
        idPedido: Field.Int("idpedido", "idPedido"),
        referencia: Field.Text("referencia", "Referencia"),
        descripcion: Field.Text("descripcion", "Descripción").required(),
        codImpuesto: Field.Text("codimpuesto", "I.V.A."),
        iva: Field.Float("iva", "% I.V.A.").default(0),
        recargo: Field.Float("recargo", "% Recargo").default(0),
        irpf: Field.Float("irpf", "% I.R.P.F."),
        pvpUnitario: Field.Currency("pvpunitario", "Precio unitario").required().default(0),
        pvpSinDto: Field.Currency("pvpsindto", "Importe").required().default(0),
        dtoLineal: Field.Currency("dtolineal", "Dto. Lineal").required().default(0),
        dtoPor: Field.Float("dtopor", "% Descuento").required().default(0),
        pvpTotal: Field.Currency("pvptotal", "Total").required().default(0),
        porComision: Field.Float("porcomision", "% Comisión"),
        multiplo: Field.Bool("sh_canmultiplovta", "Múltiplo").dump(false),
        cantidad: Field.Float("cantidad", "Cantidad")
          .required()
          .default(0)
          .validation(linea => {
            return (
              linea.multiplo &&
              linea.cantidad % linea.multiplo !== 0 && {
                error: true,
                message: `La cantidad debe ser múltiplo de ${linea.multiplo}`,
              }
            );
          }),
        canServida: Field.Float("totalenalbaran", "Servida").default(0),
        dtoManual: Field.Bool("dtomanual", "Dto.Manual").default(false),
        codUbicacionArticulo: Field.Bool("sh_codubicacionarticulo", "Ubicacion artículo"),
        shCantAlbaran: Field.Float("shcantalbaran", "Cantidad en albaran"),
        dispLotesAlmacen: Field.Float("dispLotesAlmacen", "Stock disponible en almacen").decimals(
          2,
        ),
        porLotes: Field.Bool("porlotes", "Articulo por lotes"),
        estadoPDA: Field.Text("estadopda", "Estado PDA"),
        cerradaPDA: Field.Bool("cerradapda", "Cerrado PDA"),
        // codUbicacion: Field.Text("codubicacion", "Ubicación"),
        totalEnAlbaran: Field.Float("totalenalbaran", "Total en albaran"),
        referenciaProv: Field.Bool("referenciaprov", "Referencia proveedor"),
      })
      .filter(({ pedido }) => ["idpedido", "eq", pedido.buffer.idPedido]),
    lotesPorAlmacen: Schema("v_lotesporalmacen", "referencia")
      .fields({
        enAlmacen: Field.Int("enalmacen", "En almacen"),
        codLote: Field.Int("codlote", "Codigo de lote"),
        idStock: Field.Text("idstock", "Id. Stock"),
        referencia: Field.Text("referencia", "Referencia"),
        descripcion: Field.Text("descripcion", "Descripción"),
        codigo: Field.Currency("codigo", "Código"),
        caducidad: Field.Date("caducidad", "Caducidad"),
        codAlmacen: Field.Text("codalmacen", "Almacen"),
      })
      .filter(() => ["1", "eq", "1"])
      .limit(10000),
    inventarios: parent.inventarios.fields({
      estado: Field.Text("sh_estado", "Estado"),
      observaciones: Field.Text("observaciones", "Observaciones").default(""),
    }),
    lineasInventario: parent.lineasInventario
      .fields({
        codigolote: Field.Text("sh_codigolote", "Código lote"),
        referencia: Field.Text("referencia", "Referencia artículo").required(),
        sh_estado: Field.Text("sh_estado", "Estado"),
        sh_codlote: Field.Text("sh_codlote", "sh_codlote"),
        cantidadIni: Field.Int("cantidadini", "Cantidad Inicial").required(),
        referenciaProv: Field.Text("referenciaprov", "Referencia proveedor"),
      })
      .filter(({ inventario }) => ["codinventario", "eq", inventario.data.codInventario])
      .limit(500)
      .order(() => ({ field: "id", direction: "DESC" })),
    generarpreparaciones: Schema("pedidoscli", "idpedido")
      .fields({
        idPedido: Field.Int("idpedido", "idPedido").auto(),
        codigo: Field.Text("codigo", "Código"),
        fecha: Field.Date("fecha", "Fecha"),
        nombreCliente: Field.Text("nombrecliente", "Nombre Cliente").required(),
        codCliente: Field.Text("codcliente", "Código de Cliente"),
        total: Field.Currency("total", "Total"),
        totalIva: Field.Currency("totaliva", "Total Iva"),
        neto: Field.Currency("neto", "Neto"),
        dirTipoVia: Field.Text("dirtipovia", "Tipo Vía"),
        direccion: Field.Text("direccion", "Direccion").required(),
        dirNum: Field.Text("dirnum", "Núm."),
        dirOtros: Field.Text("dirotros", "Otros"),
        codPostal: Field.Text("codpostal", "Cód. Postal"),
        ciudad: Field.Text("ciudad", "Ciudad"),
        provincia: Field.Text("provincia", "Provincia"),
        codDir: Field.Float("coddir", "Cód. Dir."),
        codAgente: Field.Text("codagente", "Agente"),
        cifNif: Field.Text("cifnif", "CIF/NIF").required(),
        editable: Field.Bool("editable", "Editable"),
        servido: Field.Text("servido", "Servido"),
        observaciones: Field.TextArea("observaciones", "Observaciones"),
        enBorrador: Field.Bool("sh_ctrlestadoborr", "En borrador").dump(false),
        estadoPda: Field.Float("pda", "Estado PDA"),
        email: Field.Float("email", "Email").dump(false),
        codTrabajador: Field.Text("codtrabajador", "Codigo trabajador"),
        nombreTrabajador: Field.Text("nombretrabajador", "Nombre trabajador").dump(false),
        canBultos: Field.Int("canbultos", "Cantidad bultos"),
        pesoBultos: Field.Float("pesobultos", "Peso bultos"),
        codAgencia: Field.Text("codagencia", "Código agencia de transporte"),
        codProductoAgt: Field.Text("codproductoagt", "Código tarifa de transporte"),
        // codProveedor: Field.Text("codproveedor","Proveedor"),
        descPreparaciones: Field.Text("descPreparaciones", "Descripcion preparaciones líneas").dump(
          false,
        ),
        shEstadopreparacion: Field.Text("sh_estadopreparacion", "Estado preparación"),
        codserie: Field.Text("codserie", "Serie"),
        codAlmacen: Field.Text("codalmacen", "Almacen"),
      })
      .filter(() => ["1", "eq", "1"])
      .order(() => ({ field: "fecha", direction: "DESC" }))
      .limit(100),
    moviLote: Schema("movilote", "id")
      .fields({
        id: Field.Int("id", "id").auto(),
        cantidad: Field.Float("cantidad", "cantidad"),
        idStock: Field.Int("idstock", "idstock"),
        tipo: Field.Text("tipo", "tipo"),
        codLote: Field.Text("codlote", "codlote"),
        codigo: Field.Text("codigo", "codigo"),
        docOrigen: Field.Text("docorigen", "docorigen"),
        fecha: Field.Date("fecha", "fecha"),
        caducidad: Field.Date("caducidad", "caducidad"),
        sh_cantbasura: Field.Float("sh_cantbasura", "sh_cantbasura"),
        idLineaPC: Field.Int("idlineapc", "idlineapc"),
        idLineaPP: Field.Int("idlineapp", "idlineapp"),
        dispLotesAlmacen: Field.Float("dispLotesAlmacen", "Stock disponible en almacen"),
      })
      .limit(100),
    lineasPedidoCliMoviloteCli: Schema("lineaspedidoscli", "idlinea")
      .fields({
        codPreparacionDePedido: Field.Text("codpreparaciondepedido", "Preparacion"),
        idLinea: Field.Int("idlinea", "idLinea").auto(),
        idPedido: Field.Int("idpedido", "idPedido"),
        referencia: Field.Text("referencia", "Referencia"),
        descripcion: Field.Text("descripcion", "Descripción"),
        cantidad: Field.Float("cantidad", "Cantidad"),
        totalEnAlbaran: Field.Float("totalenalbaran", "Total en albaran"),
        shCantAlbaran: Field.Float("shcantalbaran", "Cantidad en albaran"),
        dispLotesAlmacen: Field.Float("dispLotesAlmacen", "Stock disponible en almacen").decimals(
          2,
        ),
        porLotes: Field.Bool("porlotes", "Articulo por lotes"),
        estadoPDA: Field.Text("estadopda", "Estado PDA"),
        referenciaProv: Field.Bool("referenciaprov", "Referencia proveedor"),
      })
      .limit(1000),
    pedidosCompra: Schema("pedidosprov", "idpedido")
      .fields({
        idPedido: Field.Int("idpedido", "idPedido").auto(),
        codigo: Field.Text("codigo", "Código"),
        nombre: Field.Float("nombre", "Cant albaran"),
        fecha: Field.Date("fecha", "Fecha"),
        observaciones: Field.Text("observaciones", "Observaciones"),
        codTrabajador: Field.Text("codtrabajador", "Codigo trabajador"),
        nombreTrabajador: Field.Text("nombretrabajador", "Nombre trabajador").dump(false),
        estadoPda: Field.Float("pda", "Estado PDA"),
        codProveedor: Field.Text("codproveedor", "Proveedor"),
      })
      .filter(() => ["1", "eq", "1"])
      .order(() => ({ field: "codigo", direction: "DESC" })),
    lineasPedidoCompra: Schema("lineaspedidosprov", "idlinea")
      .fields({
        idLinea: Field.Int("idlinea", "idLinea").auto(),
        idPedido: Field.Int("idpedido", "idPedido"),
        referencia: Field.Text("referencia", "Referencia"),
        descripcion: Field.Text("descripcion", "Descripción").required(),
        cantidad: Field.Float("cantidad", "Cantidad").required().default(0),
        shCantAlbaran: Field.Float("shcantalbaran", "shcantalbaran"),
        cerradaPDA: Field.Bool("cerradapda", "cerradapda"),
        totalEnAlbaran: Field.Float("totalenalbaran", "Total en albaran"),
        codUbicacionArticulo: Field.Bool("sh_codubicacionarticulo", "Ubicacion artículo"),
        dispLotesAlmacen: Field.Float("dispLotesAlmacen", "Stock disponible en almacen").decimals(
          2,
        ),
        porLotes: Field.Bool("porlotes", "Articulo por lotes"),
        referenciaProv: Field.Bool("referenciaprov", "Referencia proveedor"),
      })
      .filter(({ pedido }) => ["idpedido", "eq", pedido.data.idPedido]),
    lineasPedidoCompraAgrupado: Schema("lineaspedidosprov", "idlinea")
      .fields({
        idLinea: Field.Int("idlinea", "idLinea").auto(),
        idPedido: Field.Int("idpedido", "idPedido"),
        referencia: Field.Text("referencia", "Referencia"),
        descripcion: Field.Text("descripcion", "Descripción").required(),
        cantidad: Field.Float("cantidad", "Cantidad").required().default(0),
        shCantAlbaran: Field.Float("shcantalbaran", "shcantalbaran"),
        cerradaPDA: Field.Bool("cerradapda", "cerradapda"),
        totalEnAlbaran: Field.Float("totalenalbaran", "Total en albaran"),
        codUbicacionArticulo: Field.Bool("sh_codubicacionarticulo", "Ubicacion artículo"),
        dispLotesAlmacen: Field.Float("dispLotesAlmacen", "Stock disponible en almacen").decimals(
          2,
        ),
        porLotes: Field.Bool("porlotes", "Articulo por lotes"),
        referenciaProv: Field.Bool("referenciaprov", "Referencia proveedor"),
      })
      .limit(1000),
    lineasPedidoCliMoviloteProv: Schema("lineaspedidosprov", "idlinea")
      .fields({
        idLinea: Field.Int("idlinea", "idLinea").auto(),
        idPedido: Field.Int("idpedido", "idPedido"),
        referencia: Field.Text("referencia", "Referencia"),
        descripcion: Field.Text("descripcion", "Descripción"),
        cantidad: Field.Float("cantidad", "Cantidad"),
        totalEnAlbaran: Field.Float("totalenalbaran", "Total en albaran"),
        shCantAlbaran: Field.Float("shcantalbaran", "Cantidad en albaran"),
        cerradaPDA: Field.Bool("cerradapda", "cerradapda"),
        dispLotesAlmacen: Field.Float("dispLotesAlmacen", "Stock disponible en almacen").decimals(
          2,
        ),
        porLotes: Field.Bool("porlotes", "Articulo por lotes"),
      })
      .limit(1000),
    ubicacion: Schema("sh_ubicaciones", "codubicacion")
      .fields({
        codUbicacion: Field.Text("codubicacion", "Cód. Ubicación"),
      })
      .extract(),
  };
};
