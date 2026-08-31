import { createContext, useContext } from "react";

export const ViewerDataContext = createContext(null);

export function useViewerData() {
  const value = useContext(ViewerDataContext);
  if (!value) throw new Error("Viewer components require canonical trip data.");
  return value;
}
