import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

import { BackendServiceContracts } from '../contracts';
import { createMockBackendServiceLocator } from './mockBackendServiceLocator';

const mockLocator = createMockBackendServiceLocator();

const ServiceLocatorContext = createContext<BackendServiceContracts>(mockLocator.services);

type ServiceLocatorProviderProps = PropsWithChildren<{
  isMockModeEnabled: boolean;
}>;

export function ServiceLocatorProvider({ children, isMockModeEnabled }: ServiceLocatorProviderProps) {
  const services = useMemo<BackendServiceContracts>(() => {
    if (!isMockModeEnabled) {
      throw new Error('Real service locator wiring is not available in Sprint-01. Enable phase1 mock mode.');
    }

    return mockLocator.services;
  }, [isMockModeEnabled]);

  return <ServiceLocatorContext.Provider value={services}>{children}</ServiceLocatorContext.Provider>;
}

export function useServiceLocator(): BackendServiceContracts {
  return useContext(ServiceLocatorContext);
}