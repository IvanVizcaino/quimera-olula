import { Field, Schema } from "quimera/lib";
import { schemasPartesCarros } from "./schemasPartesCarros";

export default parent => ({
  ...parent,
  ...schemasPartesCarros,
  articulos: parent.articulos.fields({
    precioRef: Field.Float("precioRef", "Precio referencia"),
    precioBnp: Field.Float("precioBnp", "Precio BNP"),
    fechaMod: Field.Date("fechamod", "Fecha modificacion"),
    nombre1: Field.Text("nombre1", "Nombre1"),
    nombre2: Field.Text("nombre2", "Nombre2"),
    nombre3: Field.Text("nombre3", "Nombre3"),
    nombre4: Field.Text("nombre4", "Nombre4"),
    litraje: Field.Text("litraje", "litraje"),
    forma: Field.Text("forma", "forma"),
    altura: Field.Text("altura", "altura"),
    perimetro: Field.Text("perimetro", "perimetro"),
    familia: Field.Text("codfamilia", "familia"),
    codBarras: Field.Text("codbarras", "Código de barras"),
    codBarrasInterno: Field.Text("codbarrasinterno", "Código de barras interno"),
    tieneFoto: Field.Bool("tienefoto", "tienefoto"),
    publicadoWeb: Field.Bool("vb_publicadoweb", "Publicado Web"),
    idPlanta: Field.Int("idplanta", "Id planta"),
  }),
  stocks: parent.stocks
    .fields({
      idstock: Field.Int("idstock", "Id"),
      tieneFoto: Field.Bool("tienefoto", "tienefoto"),
      detalleubicacion: Field.Bool("detalleubicacion", "detalleubicacion"),
      publicadoWeb: Field.Bool("vb_publicadoweb", "Publicado Web"),
    })
    .limit(100),
  articulosprov: parent.articulosprov.fields({
    referencia: Field.Text("referencia", "Referencia"),
    descripcion: Field.Text("descripcion", "Descripción"),
    idarticuloprov: Field.Int("idarticuloprov", "idarticuloprov"),
  }),
  condiciones_compra: Schema("articulos", "referencia")
    .fields({
      id: Field.Int("id", "Id"),
      referencia: Field.Text("referencia", "Referencia"),
      descripcion: Field.Text("descripcion", "Descripción"),
      codBarras: Field.Text("codbarras", "Código de barras"),
      codproveedor: Field.Text("codproveedor", "codproveedor").required(),
      // descuento: Field.Float("dto", "Descuento"),
      descuento: Field.Float("dto", "Descuento")
        .default(0.0)
        .validation(
          ({ descuento }) =>
            descuento < 0 ||
            (descuento > 100 && {
              error: true,
              message: "El descuento debe ser un valor entre 0 y 100",
            }),
        ),
      costeReal: Field.Float("costereal", "Coste real"),
      // precioRef: Field.Float("pvp", "Precio referencia"),
      precioRef: Field.Float("pvp", "Precio referencia"),
      coste: Field.Float("coste", "Coste").default(0.0),
      nombre: Field.Text("nombre", "Nombre"),
      disponible: Field.Bool("disponible", "disponible"),
      porDefecto: Field.Bool("pordefecto", "Por defecto"),
    })
    .order(() => ({ field: "costereal", direction: "ASC" })),
  articuloimages: Schema("articulos", "referencia").fields({
    referencia: Field.Text("referencia", "Referencia"),
  }),
  fincas: Schema("vb_fincas", "codfinca").fields({
    codfinca: Field.Text("codfinca", "codfinca"),
    descripcion: Field.Text("descripcion", "descripcion"),
    codproveedor: Field.Text("codproveedor", "codproveedor"),
    codalmacendefecto: Field.Text("codalmacendefecto", "codalmacendefecto"),
    nombreproveedor: Field.Text("nombreproveedor", "nombreproveedor"),
  }),
  misFincas: Schema("vb_fincas", "codfinca").fields({
    key: Field.Text("codfinca", "codfinca"),
    value: Field.Text("descripcion", "descripcion"),
    // codproveedor: Field.Text("codproveedor", "codproveedor"),
    // nombreproveedor: Field.Text("nombreproveedor", "nombreproveedor"),
  }),
});
