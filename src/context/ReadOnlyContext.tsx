import { createContext, useContext } from 'react';

type ReadOnlyContextType = {
  isReadOnly: boolean;
  sessionKey?: string;
};

const ReadOnlyContext = createContext<ReadOnlyContextType>({ isReadOnly: false });

export const useReadOnly = () => {
  return useContext(ReadOnlyContext);
};

export const ReadOnlyProvider: React.FC<{
  children: React.ReactNode;
  isReadOnly: boolean;
  sessionKey?: string;
}> = ({ children, isReadOnly, sessionKey }) => {
  return (
    <ReadOnlyContext.Provider value={{ isReadOnly, sessionKey }}>
      {children}
    </ReadOnlyContext.Provider>
  );
};
