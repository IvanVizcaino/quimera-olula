export default parent => ({
  ...parent,
  pedidos: {
    title: "Pedidos",
    items: {
      // ...parent?.pedidos?.items,
      presupuestos: {
        title: "Presupuestos",
        icons: ["receipt", "outlined_flag"],
        color: "warning",
        variant: "main",
        url: "/ventas/presupuestos",
        rule: "ventas.presupuesto",
      },
      pedidos: {
        title: "Pedidos",
        icons: ["receipt", "outlined_flag"],
        color: "warning",
        variant: "main",
        url: "/ventas/pedidos",
        rule: "ventas.pedido",
      },
    },
  },
});
