import React, { createContext, useState } from "react";

interface StateContextProps {
  state: string;
  setState: (state: string) => void;
  undo: boolean;
  setUndo: (undo: boolean) => void;
  redo: boolean;
  setRedo: (redo: boolean) => void;
  penWidth: number;
  setPenWidth: (strokeWidth: number) => void;
  eraserWidth: number;
  setEraserWidth: (eraseWidth: number) => void;
  clean: boolean;
  setClean: (clean: boolean) => void;
  penColor: string;
  setPenColor: (penColor: string) => void;
  imageData: string | null;
  setImageData: (data: string | null) => void;
  download: boolean;
  setDownload: (download: boolean) => void;
  downloadAsPDF: boolean;
  setDownloadAsPDF: (downloadAsPDF: boolean) => void;
}

export const StateContext = createContext<StateContextProps | undefined>(
  undefined
);

export const StateProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState("pen");
  const [undo, setUndo] = useState(false);
  const [redo, setRedo] = useState(false);
  const [penWidth, setPenWidth] = useState(5);
  const [eraserWidth, setEraserWidth] = useState(5);
  const [clean, setClean] = useState(false);
  const [penColor, setPenColor] = useState("red");
  const [imageData, setImageData] = useState<string | null>(null);
  const [download, setDownload] = useState(false);
  const [downloadAsPDF, setDownloadAsPDF] = useState(false);

  return (
    <StateContext.Provider
      value={{
        state,
        setState,
        undo,
        setUndo,
        redo,
        setRedo,
        penWidth,
        setEraserWidth,
        eraserWidth,
        setPenWidth,
        clean,
        setClean,
        penColor,
        setPenColor,
        imageData,
        setImageData,
        download,
        setDownload,
        downloadAsPDF,
        setDownloadAsPDF,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export default StateProvider;
