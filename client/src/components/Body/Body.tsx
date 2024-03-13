import { useContext, useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Image, Transformer, Text } from "react-konva";
import Konva from "konva";
import { StateContext } from "../../StateProvider";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import RecordRTC from "recordrtc";
import { set } from "mongoose";

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

const Body = () => {
  const isDrawing = useRef(false);
  const [lines, setLines] = useState<lines[]>([]);
  const [redoLines, setRedoLines] = useState<lines[]>([]);
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

  useEffect(() => {
    if (stateContext?.clean) {
      setLines([]);
      setRedoLines([]);
      stateContext?.setClean(false);
    }
  }, [
    setLines,
    setRedoLines,
    stateContext?.clean,
    stateContext?.setClean,
    stateContext,
  ]);

  useEffect(() => {
    if (stateContext?.undo) {
      const handleUndo = () => {
        if (lines.length === 0) {
          return;
        }
        const lastLine = lines[lines.length - 1];
        setLines(lines.slice(0, lines.length - 1));
        setRedoLines((redoLines) => [...redoLines, lastLine]);
      };
      handleUndo();
      stateContext?.setUndo(false);
      console.log(stateContext?.undo, "undo");
    }
  }, [lines, setLines, setRedoLines, stateContext]);

  useEffect(() => {
    if (stateContext?.redo) {
      const handleRedo = () => {
        if (redoLines.length === 0) {
          return;
        }
        const lastRedoLine = redoLines[redoLines.length - 1];
        setRedoLines((redoLines) => redoLines.slice(0, -1));
        setLines((lines) => [...lines, lastRedoLine]);
      };
      handleRedo();
      stateContext?.setRedo(false);
    }
  }, [lines, setRedoLines, redoLines, stateContext]);

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) {
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
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y] }]);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  useEffect(() => {
    if (stateContext?.imageData) {
      const img = new window.Image();
      img.src = stateContext.imageData;
      img.onload = () => {
        console.log("Image loaded successfully");
        setImageData(img);
      };
      img.onerror = (error) => {
        console.error("Error loading image:", error);
      };
    }
  }, [stateContext?.imageData]);

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

  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Download Board Content as PDF>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
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

  //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Screen Recording>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

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

  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Image Drag and Drop>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  const handleSelect = (e) => {
    const clickedId = e.target.attrs.id;
    if (clickedId === "image") {
      transformerRef.current.nodes([e.target]);
    }
  };

  const handleDragEnd = (e) => {
    const newX = e.target.x();
    const newY = e.target.y();
    console.log("New image position:", { x: newX, y: newY });
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

  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Custom Pointer>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  const customPointer = {
    cursor:
      tool === "pen" || tool === "highlighter"
        ? "url('https://img.icons8.com/ios-filled/50/000000/pen.png'), auto"
        : "url('https://img.icons8.com/ios-filled/50/000000/eraser.png'), auto",
    transition: "0.5s",
  };

  return (
    <div
      className="container-fluid position-fixed overflow-hidden"
      style={customPointer}
    >
      {recording ? (
        <button onClick={stopRecording}>Stop</button>
      ) : (
        <button onClick={startRecording}>Strt</button>
      )}
      {videoURL ? (
        <button onClick={handleDownload}>Download Recorded Video</button>
      ) : (
        <button disabled>Download Recorded Video</button>
      )}

      <button onClick={handleDelete}>Delete Image</button>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        ref={stageRef}
      >
        <Layer>
          {imageData && (
            <Image
              id="image"
              draggable={true}
              image={imageData}
              width={window.innerWidth}
              height={window.innerHeight}
              scaleX={imageData.width / (3 * window.innerWidth)}
              scaleY={imageData.height / (3 * window.innerHeight)}
              onClick={(event) => {
                handleSelect(event);
                setShowImageOptions(true);
              }}
              onTap={handleSelect}
              onDragEnd={handleDragEnd}
              ref={imageRef}
            />
          )}
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
