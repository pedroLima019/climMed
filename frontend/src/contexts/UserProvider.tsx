import { useState, type ReactNode } from "react";
import { UserContext } from "./UserContext";

type User = {
  name: string;
  role: string;
} | null;

type UserProviderProps = {
  children: ReactNode;
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
