export default parent => {
  return theme => {
    const _p = parent(theme);

    return {
      ..._p,
      backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: "#fff",
      },
      botonPrimario: theme.botonPrimario,
      botonSecundario: theme.botonSecundario,
      // container: {
      //   flexGrow: 1,
      //   minHeight: 500,
      //   paddingLeft: theme.spacing(7) + 1
      // }
    };
  };
};
