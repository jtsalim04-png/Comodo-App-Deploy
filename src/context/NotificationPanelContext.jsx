import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const NotificationPanelContext = createContext(null);

export function NotificationPanelProvider({ children }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [filter, setFilter] = useState('all');

  const openPanel = useCallback(() => {
    setMinimized(false);
    setPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setMinimized(false);
  }, []);

  const minimizePanel = useCallback(() => {
    setPanelOpen(false);
    setMinimized(true);
  }, []);

  const restorePanel = useCallback(() => {
    setMinimized(false);
    setPanelOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      panelOpen,
      minimized,
      filter,
      setFilter,
      openPanel,
      closePanel,
      minimizePanel,
      restorePanel,
    }),
    [
      panelOpen,
      minimized,
      filter,
      openPanel,
      closePanel,
      minimizePanel,
      restorePanel,
    ],
  );

  return (
    <NotificationPanelContext.Provider value={value}>
      {children}
    </NotificationPanelContext.Provider>
  );
}

export function useNotificationPanel() {
  const ctx = useContext(NotificationPanelContext);
  return (
    ctx || {
      panelOpen: false,
      minimized: false,
      filter: 'all',
      setFilter: () => {},
      openPanel: () => {},
      closePanel: () => {},
      minimizePanel: () => {},
      restorePanel: () => {},
    }
  );
}
