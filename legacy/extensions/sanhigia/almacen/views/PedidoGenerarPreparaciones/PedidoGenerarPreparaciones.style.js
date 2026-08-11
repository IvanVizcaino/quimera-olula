export default parent => {
  return theme => {
    const _p = parent(theme);

    return {
      ..._p,
      referencia: {
        flexGrow: 1,
        marginRight: theme.spacing(1),
      },
      cantidad: {
        maxWidth: 80,
        marginRight: theme.spacing(1),
      },
      iconoIzquierda: {
        marginRight: theme.spacing(1),
      },
      paper38auto: { minWidth: "38.5%", minHeight: "auto" },
      preparacionBOX: {
        overflow: "hidden",
      },
      iconoCabecera: { color: 'black' },
      iconoBloqueado: { color: 'lightgrey' },
      TablaLineasPedidoCli: {
        width: '1590px'
      }
    };
  };
};
