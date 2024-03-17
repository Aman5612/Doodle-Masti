import React, { createContext, useState } from "react";

interface ShapesProp {
  x: number;
  y: number;
  width: number;
  height: number;
  stroke: string;
  id: string;
}

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
  location: string;
  setLocation: (location: string) => void;
  rectangles: ShapesProp[];
  setRectangles: (rectangles: ShapesProp[]) => void;
  circles: ShapesProp[];
  setCircles: (circles: ShapesProp[]) => void;
  strLine: string;
  setStrLine: (strLine: string) => void;
}

export const StateContext = createContext<StateContextProps | undefined>(
  undefined
);


export const StateProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState("cursor");
  const [undo, setUndo] = useState(false);
  const [redo, setRedo] = useState(false);
  const [penWidth, setPenWidth] = useState(5);
  const [eraserWidth, setEraserWidth] = useState(5);
  const [clean, setClean] = useState(false);
  const [penColor, setPenColor] = useState("red");
  const [imageData, setImageData] = useState<string | null>(null);
  const [download, setDownload] = useState(false);
  const [downloadAsPDF, setDownloadAsPDF] = useState(false);
  const [location, setLocation] = useState("/");
  const [rectangles, setRectangles] = useState<ShapesProp[]>([]);
  const [circles, setCircles] = useState<ShapesProp[]>([]);
  const [strLine, setStrLine] = useState("line");
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
        location,
        setLocation,
        rectangles,
        setRectangles,
        circles,
        setCircles,
        strLine,
        setStrLine,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export default StateProvider;
