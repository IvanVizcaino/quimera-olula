import { ElementoMenu } from "@olula/lib/menu.ts";
import { DefinicionWidget } from "@olula/lib/widgets.ts";
import { createContext, PropsWithChildren, useState } from "react";

type APP = Record<string, Record<string, unknown>>;
type Menu = ElementoMenu[];
type Widgets = DefinicionWidget[];

// eslint-disable-next-line react-refresh/only-export-components
export const FactoryObj = {
  app: {} as APP,
  setApp: (_app: APP) => {},
  menu: [] as Menu,
  setMenu: (_menu: Menu) => {},
  widgets: [] as Widgets,
  setWidgets: (_widgets: Widgets) => {},
};
FactoryObj.setApp = (app: APP) => {
  FactoryObj.app = app;
};
FactoryObj.setMenu = (menu: Menu) => {
  FactoryObj.menu = menu;
};
FactoryObj.setWidgets = (widgets: Widgets) => {
  FactoryObj.widgets = widgets;
};

// eslint-disable-next-line react-refresh/only-export-components
export const FactoryCtx = createContext(FactoryObj);

export const FactoryProvider = ({ children }: PropsWithChildren) => {
  const [app, setApp] = useState<APP>({});
  const [menu, setMenu] = useState<Menu>([]);
  const [widgets, setWidgets] = useState<Widgets>([]);

  FactoryObj.app = app;
  FactoryObj.setApp = setApp;
  FactoryObj.menu = menu;
  FactoryObj.setMenu = setMenu;
  FactoryObj.widgets = widgets;
  FactoryObj.setWidgets = setWidgets;

  return (
    <FactoryCtx.Provider
      value={{ app, menu, widgets, setApp, setMenu, setWidgets }}
    >
      {children}
    </FactoryCtx.Provider>
  );
};
