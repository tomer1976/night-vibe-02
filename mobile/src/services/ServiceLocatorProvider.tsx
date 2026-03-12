import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

import { BackendServiceContracts } from '../contracts';
import { createMockBackendServiceLocator } from './mockBackendServiceLocator';

const mockLocator = createMockBackendServiceLocator();

const ServiceLocatorContext = createContext<BackendServiceContracts>(mockLocator.services);

type ServiceLocatorProviderProps = PropsWithChildren<{
  isMockModeEnabled: boolean;
  servicesOverride?: BackendServiceContracts;
}>;

export function ServiceLocatorProvider({ children, isMockModeEnabled, servicesOverride }: ServiceLocatorProviderProps) {
  const services = useMemo<BackendServiceContracts>(() => {
    if (servicesOverride) {
      return servicesOverride;
    }

    if (!isMockModeEnabled) {
      throw new Error('Real service locator wiring is not available in Phase 1. Enable phase1 mock mode.');
    }

    return mockLocator.services;
  }, [isMockModeEnabled, servicesOverride]);

  return <ServiceLocatorContext.Provider value={services}>{children}</ServiceLocatorContext.Provider>;
}

export function useServiceLocator(): BackendServiceContracts {
  return useContext(ServiceLocatorContext);
}