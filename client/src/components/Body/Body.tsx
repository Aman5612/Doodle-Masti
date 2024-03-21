import {
  ReactEventHandler,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Stage,
  Layer,
  Line,
  Image,
  Transformer,
  Text,
  Group,
  Rect,
  Circle,
} from "react-konva";
import Konva from "konva";
import { StateContext } from "../../StateProvider";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import RecordRTC from "recordrtc";
import socketIOClient from "socket.io-client";
import {
  initialRectangles,
  InitialCircles,
} from "../../constant/InitialShapes";

interface lines {
  tool: string | undefined;
  points: number[];
  penWidth?: number;
  eraserWidth?: number;
  strokeWidth?: number;
  stroke?: string;
  opacity?: number | undefined;
  strokeColor?: string;
}
interface ShapesProp {
  x: number;
  y: number;
  width: number;
  height: number;
  stroke: string;
  id: string;
}

const Body = () => {
  // lines,strLine.imageData.rectangles,circles,redoLines,redoShapes
  const isDrawing = useRef(false);
  const [lines, setLines] = useState<lines[]>([]);
  const [redoLines, setRedoLines] = useState<lines[]>([]);
  const [strLine, setStrLine] = useState<lines[]>([]);
  const [redoShapes, setRedoShapes] = useState<ShapesProp[]>([]);
  const stateContext = useContext(StateContext);
  const [imageData, setImageData] = useState<HTMLImageElement | null>(null);
  const tool = stateContext?.state;
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const stageRef = useRef<Stage>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Array<Blob>>([]);
  const imageRef = useRef(null);
  const transformerRef = useRef(null);
  const [imageOptions, setShowImageOptions] = useState(false);
  const [deleteTextPosition, setDeleteTextPosition] = useState({ x: 0, y: 0 });
  const [rectangles, setRectangles] = useState<ShapesProp[]>([]);
  const [circles, setCircles] = useState<ShapesProp[]>([]);
  // const [ellipse, setEllipse] = useState([]);
  const [selectedId, selectShape] = useState(null);
  const [imageSize, setImageSize] = useState({
    width: 0,
    height: 0,
    scaleX: 1,
    scaleY: 1,
  });
  useEffect(() => {
    stateContext?.setLocation("board");
  }, [stateContext]);

  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Handle Shapes>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  const Rectangle = ({ shapeProps, isSelected, onSelect, onChange }: any) => {
    const shapeRef = useRef();
    const trRef = useRef();

    useEffect(() => {
      if (isSelected) {
        trRef.current.nodes([shapeRef.current]);
        trRef.current.getLayer().batchDraw();
      }
    }, [isSelected]);

    return (
      <>
        <Rect
          onClick={onSelect}
          onTap={onSelect}
          ref={shapeRef}
          {...shapeProps}
          draggable
          onDragEnd={(e) => {
            onChange({
              ...shapeProps,
              x: e.target.x(),
              y: e.target.y(),
            });
          }}
          onTransformEnd={(e) => {
            const node = shapeRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);
            onChange({
              ...shapeProps,
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(node.height() * scaleY),
            });
          }}
        />
        {isSelected && (
          <Transformer
            ref={trRef}
            flipEnabled={false}
            boundBoxFunc={(oldBox, newBox) => {
              if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        )}
      </>
    );
  };
  const CircleComponent = ({
    shapeProps,
    isSelected,
    onSelect,
    onChange,
  }: any) => {
    const shapeRef = useRef();
    const trRef = useRef();

    useEffect(() => {
      if (isSelected) {
        trRef.current.nodes([shapeRef.current]);
        trRef.current.getLayer().batchDraw();
      }
    }, [isSelected]);

    return (
      <>
        <Circle
          onClick={onSelect}
          onTap={onSelect}
          ref={shapeRef}
          {...shapeProps}
          draggable
          onDragEnd={(e) => {
            onChange({
              ...shapeProps,
              x: e.target.x(),
              y: e.target.y(),
            });
          }}
          onTransformEnd={(e) => {
            const node = shapeRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);
            onChange({
              ...shapeProps,
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(node.height() * scaleY),
            });
          }}
        />
        {isSelected && (
          <Transformer
            ref={trRef}
            flipEnabled={false}
            boundBoxFunc={(oldBox, newBox) => {
              if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        )}
      </>
    );
  };

  //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Clean Board>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  useEffect(() => {
    if (stateContext?.clean) {
      setLines([]);
      setRedoLines([]);
      stateContext?.setClean(false);
      socketRef.current.emit("clean");
      setCircles([]);
      setRectangles([]);
      setRedoShapes([]);
      setImageData(null);
    }
  }, [
    setLines,
    setRedoLines,
    stateContext?.clean,
    stateContext?.setClean,
    stateContext,
  ]);
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Undo and Redo>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  useEffect(() => {
    if (stateContext?.undo && tool === "rectangle") {
      if (redoShapes.length === 0) {
        return;
      }
      const lastRect = rectangles[rectangles.length - 1];
      setRectangles(rectangles.slice(0, rectangles.length - 1));
      setRedoShapes((redoShapes) => [...redoShapes, lastRect]);
      stateContext?.setUndo(false);
    }
    if (stateContext?.undo && tool === "circle") {
      if (redoShapes.length === 0) {
        return;
      }
      const lastRect = circles[circles.length - 1];
      setCircles(circles.slice(0, circles.length - 1));
      setRedoShapes((redoShapes) => [...redoShapes, lastRect]);
      stateContext?.setUndo(false);
    }

    if (stateContext?.undo) {
      const handleUndo = () => {
        if (lines.length === 0) {
          return;
        }
        const lastLine = lines[lines.length - 1];
        setLines(lines.slice(0, lines.length - 1));
        setRedoLines((redoLines) => [...redoLines, lastLine]);
        socketRef.current.emit(
          "undo",
          lastLine,
          lines.slice(0, lines.length - 1)
        );
        //Implemtent undo for shapes usign socket as well
      };

      handleUndo();
      stateContext?.setUndo(false);
    }
  }, [
    lines,
    setLines,
    setRedoLines,
    stateContext,
    rectangles,
    redoShapes,
    tool,
    circles,
  ]);

  useEffect(() => {
    if (stateContext?.redo && tool === "rectangle") {
      if (redoShapes.length === 0) {
        return;
      }
      const lastRect = redoShapes[redoShapes.length - 1];
      setRedoShapes((redoShapes) => redoShapes.slice(0, -1));
      setRectangles((rectangles) => [...rectangles, lastRect]);
      stateContext?.setRedo(false);
    }
    if (stateContext?.redo && tool === "circle") {
      if (redoShapes.length === 0) {
        return;
      }
      const lastRect = circles[circles.length - 1];
      setRedoShapes((redoShapes) => redoShapes.slice(0, -1));
      setRectangles((rectangles) => [...rectangles, lastRect]);
      stateContext?.setRedo(false);
    }
    if (stateContext?.redo) {
      const handleRedo = () => {
        if (redoLines.length === 0) {
          return;
        }
        const lastRedoLine = redoLines[redoLines.length - 1];
        setRedoLines((redoLines) => redoLines.slice(0, -1));
        setLines((lines) => [...lines, lastRedoLine]);
        socketRef.current.emit("redo", lastRedoLine, redoLines);
        // Implement redo for shapes using socket as well using sockets as well
      };
      handleRedo();
      stateContext?.setRedo(false);
    }
  }, [
    lines,
    setRedoLines,
    redoLines,
    stateContext,
    rectangles,
    redoShapes,
    tool,
    circles,
  ]);

  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Handling Mouse Events>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  const handleMouseMove = (e: any) => {
    if (tool === "cursor") {
      return;
    }
    if (!isDrawing.current) {
      return;
    }
    if (tool === "rectangle") {
      const pos = e.target.getStage().getPointerPosition();
      const lastRect = rectangles[rectangles.length - 1];
      lastRect.width = pos.x - lastRect.x;
      lastRect.height = pos.y - lastRect.y;
      rectangles.splice(rectangles.length - 1, 1, lastRect);
      setRectangles(rectangles.concat());
      return;
    }
    if (tool === "circle") {
      const pos = e.target.getStage().getPointerPosition();
      const lastCir = circles[circles.length - 1];
      lastCir.width = pos.x - lastCir.x;
      lastCir.height = pos.y - lastCir.y;
      circles.splice(circles.length - 1, 1, lastCir);
      setCircles(circles.concat());
      return;
    }
    if (tool === "line") {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      const initialPoint = strLine[strLine.length - 1].points.slice(0, 2);
      const straightLine = {
        tool: tool,
        points: [...initialPoint, point.x, point.y],
      };
      setLines([...lines.slice(0, -1), straightLine]);
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];

    lastLine.points = lastLine.points.concat([point.x, point.y]);
    if (tool === "pen" || tool === "highlighter")
      lastLine.strokeWidth = stateContext?.penWidth;
    if (tool === "eraser") lastLine.strokeWidth = stateContext?.eraserWidth;
    if (tool === "highlighter") lastLine.opacity = 0.3;
    lastLine.strokeColor = stateContext?.penColor;
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    if (tool === "cursor") {
      return;
    }

    if (tool === "rectangle") {
      const id = `rect${rectangles.length + 1}`;
      const rect = {
        x: e.target.getStage().getPointerPosition().x,
        y: e.target.getStage().getPointerPosition().y,
        width: 5,
        height: 5,
        stroke: "black",
        id,
      };
      setRectangles([...rectangles, rect]);
      return;
    }
    if (tool === "circle") {
      const id = `circle${rectangles.length + 1}`;
      const cir = {
        x: e.target.getStage().getPointerPosition().x,
        y: e.target.getStage().getPointerPosition().y,
        width: 5,
        height: 5,
        stroke: "black",
        id,
      };
      setCircles([...circles, cir]);
      return;
    }
    if (tool === "line") {
      const stage = e.target.getStage();
      const pos = stage.getPointerPosition();
      const startPoint = { x: pos.x, y: pos.y };
      setStrLine([
        ...lines,
        { tool, ...startPoint, points: [startPoint.x, startPoint.y] },
      ]);
      return;
    }
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y] }]);
  };

  const handleMouseUp = (e) => {
    isDrawing.current = false;
    socketRef.current.emit("drawing", lines);
    if (tool === "line") {
      const stage = e.target.getStage();
      const pos = stage.getPointerPosition();
      const endPoint = { x: pos.x, y: pos.y };
      const lastLine = strLine[strLine.length - 1];
      lastLine.points = [lastLine.x, lastLine.y, endPoint.x, endPoint.y];
      setStrLine([...strLine.slice(0, -1), lastLine]);
    }
  };
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Getting Image Data>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  useEffect(() => {
    if (stateContext?.imageData) {
      const img = new window.Image();
      img.src = stateContext.imageData;
      img.onload = () => {
        setImageData(img);
        socketRef.current.emit("image", img.src);
      };
      img.onerror = (error) => {
        console.error("Error loading image:", error);
      };
    }
  }, [stateContext?.imageData]);
  //  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Download Board Content>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  useEffect(() => {
    if (stateContext?.download) {
      downloadScreenContent();
      stateContext?.setDownload(false);
    } else if (stateContext?.downloadAsPDF) {
      downloadAsPDF();
      stateContext?.setDownloadAsPDF(false);
    }
  }, [stateContext, stateContext?.download, stateContext?.downloadAsPDF]);

  const downloadScreenContent = () => {
    const dataURL = stageRef.current.getStage().toDataURL();
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "screen_content.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Download Board Content as PDF>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  const downloadAsPDF = () => {
    const stage = stageRef.current.getStage();
    html2canvas(stage.container(), { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("screen_content.pdf");
    });
  };

  //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Screen Recording>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  const startRecording = () => {
    if (stageRef.current) {
      const canvas = stageRef.current?.toCanvas();
      const canvasStream = canvas.captureStream();
      mediaRecorderRef.current = new MediaRecorder(canvasStream);
      mediaRecorderRef.current.ondataavailable = handleDataAvailable;
      mediaRecorderRef.current.onstop = handleStopRecording;
      mediaRecorderRef.current.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleDataAvailable = (event: BlobEvent) => {
    chunksRef.current.push(event.data);
  };

  const handleStopRecording = () => {
    const recordedBlob = new Blob(chunksRef.current, { type: "video/webm" });
    const videoURL = URL.createObjectURL(recordedBlob);
    console.log("Recorded video URL:", videoURL);
    setRecording(false);
    setVideoURL(videoURL);
    chunksRef.current = [];
  };

  const handleDownload = () => {
    if (videoURL) {
      const link = document.createElement("a");
      link.href = videoURL;
      link.download = "recorded_video.webm";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Image Drag and Drop>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  const handleImageSizeChange = () => {
    const imageNode = transformerRef.current.nodes()[0];

    const width = imageNode.width() * imageNode.scaleX();
    const height = imageNode.height() * imageNode.scaleY();
    const scaleX = imageNode.scaleX();
    const scaleY = imageNode.scaleY();

    setImageSize({ width, height, scaleX, scaleY });
    socketRef.current.emit("transform", { width, height, scaleX, scaleY });
  };

  const handleSelect = (e) => {
    const clickedId = e.target.attrs.id;
    if (clickedId === "image") {
      transformerRef.current.nodes([e.target]);
      transformerRef.current.on("transform", handleImageSizeChange);
    }
    // setShowImageOptions(true);
    // const imageNode = e.target;
    // const imagePosition = {
    //   x: imageNode.x(),
    //   y: imageNode.y(),
    //   width: imageNode.width() * imageNode.scaleX(),
    //   height: imageNode.height() * imageNode.scaleY(),
    // };

    // const deleteTextX = imagePosition.x + imagePosition.width - 100;
    // const deleteTextY = imagePosition.y + imagePosition.height - 100;
    // setDeleteTextPosition({ x: deleteTextX, y: deleteTextY });
  };

  const handleDragEnd = (e) => {
    socketRef.current.emit("drag", e.target.x(), e.target.y());
    setDeleteTextPosition({
      x: e.target.x() + 60,
      y: e.target.y() - 20,
    });
  };

  const handleDelete = () => {
    if (
      transformerRef.current &&
      (transformerRef.current as Konva.Transformer).nodes().length
    ) {
      const imageRefCurrent = imageRef.current;
      if (imageRefCurrent) {
        const imageRefCurrentTyped = imageRefCurrent as Konva.Image;
        imageRefCurrentTyped.destroy();
        setImageData(null);
      }
      (transformerRef.current as Konva.Transformer).detach();
    }
    setShowImageOptions(false);
  };
  //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Setup Socket>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  const socketRef = useRef<SocketIOClient.Socket | null>(null);

  useEffect(() => {
    socketRef.current = socketIOClient("http://localhost:3000");
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    socketRef.current.on("drawing", (data: lines[]) => {
      setLines([...lines, data[data.length - 1]]);
    });

    socketRef.current.on("redo", (lastRedoLine: lines) => {
      setRedoLines((redoLines) => redoLines.slice(0, -1));
      setLines((lines) => [...lines, lastRedoLine]);
    });

    socketRef.current.on("undo", (lastLine: lines, lines: lines[]) => {
      setLines(lines);
      setRedoLines((redoLines) => [...redoLines, lastLine]);
    });
    socketRef.current.on("image", (imageData: string | null) => {
      if (imageData) {
        const img = new window.Image();
        img.src = imageData ?? "";
        img.onload = () => {
          setImageData(img);
          setShowImageOptions(true);
        };
        img.onerror = (error) => {
          console.error("Error loading image:", error);
        };
      }
    });
    socketRef.current.on("drag", (x: number, y: number) => {
      const imageRefCurrent = imageRef.current;
      if (imageRefCurrent) {
        const imageRefCurrentTyped = imageRefCurrent as Konva.Image;
        imageRefCurrentTyped.x(x);
        imageRefCurrentTyped.y(y);
      }
    });

    socketRef.current.on("clean", () => {
      setLines([]);
      setRedoLines([]);
    });
    socketRef.current.on(
      "transform",
      ({ width, height, scaleX, scaleY }: any) => {
        setImageSize({ width, height, scaleX, scaleY });
      }
    );

    return () => {
      socketRef.current.off("drawing");
      socketRef.current.off("redo");
      socketRef.current.off("undo");
      socketRef.current.off("image");
      socketRef.current.off("drag");
      socketRef.current.off("clean");
      socketRef.current.off("transform");
    };
  }, [lines, setLines, redoLines]);

  useEffect(() => {
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Custom Pointer>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  const customPointer = {
    cursor:
      tool === "pen" ||
      tool === "highlighter" ||
      tool === "rectangle" ||
      tool === "circle" ||
      tool === "line"
        ? "crosshair"
        : tool === "cursor"
        ? "default"
        : "grab",
    transition: "0.5s",
  };

  return (
    <div className=" position-fixed overflow-hidden" style={customPointer}>
      {/* {recording ? (
        <button onClick={stopRecording}>Stop</button>
      ) : (
        <button onClick={startRecording}>Strt</button>
      )}
      {videoURL ? (
        <button onClick={handleDownload}>Download Recorded Video</button>
      ) : (
        <button disabled>Download Recorded Video</button>
      )} */}
      <Stage
        width={window.visualViewport?.width}
        height={window.visualViewport?.height}
        onMouseDown={(e) => {
          handleMouseDown(e);
          checkDeselect(e);
        }}
        onMouseMove={handleMouseMove}
        onMouseup={handleMouseUp}
        onTouchStart={checkDeselect}
        ref={stageRef}
      >
        <Layer>
          {rectangles.map((rect, i) => {
            return (
              <Rectangle
                key={i}
                shapeProps={rect}
                isSelected={rect.id === selectedId}
                onSelect={() => {
                  selectShape(rect.id);
                }}
                onChange={(newAttrs) => {
                  const rects = rectangles.slice();
                  rects[i] = newAttrs;
                  setRectangles(rects);
                }}
              />
            );
          })}
          {circles.map((rect, i) => {
            return (
              <CircleComponent
                key={i}
                shapeProps={rect}
                isSelected={rect.id === selectedId}
                onSelect={() => {
                  selectShape(rect.id);
                }}
                onChange={(newAttrs) => {
                  const rects = circles.slice();
                  rects[i] = newAttrs;
                  setCircles(rects);
                }}
              />
            );
          })}
          {strLine.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.strokeColor}
              strokeWidth={line.strokeWidth}
              opacity={line.opacity ? line.opacity : 1}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          ))}
          <Group>
            {imageData && (
              <Image
                id="image"
                draggable={true}
                image={imageData}
                width={window.innerWidth}
                height={window.innerHeight}
                scaleX={
                  imageSize
                    ? imageSize.scaleX
                    : imageData.width / (3 * window.innerWidth)
                }
                scaleY={
                  imageSize
                    ? imageSize.scaleY
                    : imageData.height / (3 * window.innerHeight)
                }
                onClick={(event) => {
                  handleSelect(event);
                  setShowImageOptions(true);
                }}
                onTap={handleSelect}
                onDragEnd={handleDragEnd}
                ref={imageRef}
              />
            )}
            {imageOptions && (
              <Text
                x={deleteTextPosition.x}
                y={deleteTextPosition.y}
                cornerRadius={5}
                text="Delete Image"
                fontSize={20}
                onClick={handleDelete}
                onTap={handleDelete}
                draggable={true}
                shadowColor="black"
                shadowBlur={5}
                shadowOffsetX={2}
                shadowOffsetY={2}
              />
            )}
          </Group>

          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.strokeColor}
              strokeWidth={line.strokeWidth}
              opacity={line.opacity ? line.opacity : 1}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          ))}
          <Transformer ref={transformerRef} />
        </Layer>
      </Stage>
    </div>
  );
};

export default Body;
