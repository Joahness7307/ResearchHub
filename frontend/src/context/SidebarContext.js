import React, { createContext, useContext, useState, useCallback } from "react";

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
  // keys: "admin", "head_admin", "research_adviser" etc.
  const [state, setState] = useState({});

  const setOpen = useCallback((role, value) => {
    setState(prev => ({ ...prev, [role]: !!value }));
  }, []);

  const toggle = useCallback((role) => {
    setState(prev => ({ ...prev, [role]: !prev[role] }));
  }, []);

  const isOpen = useCallback((role) => !!state[role], [state]);

  return (
    <SidebarContext.Provider value={{ setOpen, toggle, isOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (role) => {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    return { isOpen: false, toggle: () => {}, setOpen: () => {} };
  }
  return {
    isOpen: ctx.isOpen(role),
    toggle: () => ctx.toggle(role),
    setOpen: (v) => ctx.setOpen(role, v)
  };
};

export default SidebarContext;