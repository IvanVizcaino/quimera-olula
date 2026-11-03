export default parent => {
  return theme => {
    const _p = parent(theme);

    return {
      ..._p,
      fecha: {
        maxWidth: 190,
        flexGrow: 0,
        marginLeft: theme.spacing(0.5),
        marginRight: theme.spacing(0.5),
      },
      fechasMobile: {
        display: "flex",
        alignItems: "center",
        marginLeft: theme.spacing(0.5),
        marginRight: theme.spacing(0.5),
      },
      select: {
        flexGrow: 1,
        marginLeft: theme.spacing(0.5),
        marginRight: theme.spacing(0.5),
      },
      selectMobile: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
      },
      iconoCabecera: {
        marginLeft: theme.spacing(0.5),
        marginRight: theme.spacing(0.5),
      },
      filtro: {
        flexGrow: 1,
        maxWidth: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
      },
    };
  };
};
