import { useContext, useState } from "react";
import "./styles.css";
import { StateContext } from "../../StateProvider";
import { SketchPicker } from "react-color";

const FloatingBar = () => {
  const [showContent, setShowContent] = useState(false);
  const [showEraser, setShowEraser] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPen, setShowPen] = useState(false);
  const [showShapes, setShowShapes] = useState(false);
  const handleContentSave = () => {
    setShowContent(!showContent);
  };
  const stateContext = useContext(StateContext);

  const handleEraser = () => {
    if (!showContent && !showPen) {
      setShowEraser(!showEraser);
    }
  };

  const handleChangeComplete = (color: any) => {
    stateContext?.setPenColor(color.hex);
  };

  const handleImageLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        stateContext?.setImageData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div
        className="d-flex gap-3 border p-2 rounded-4 position-absolute bottom-0 start-50 translate-middle-x  mb-3 bg-light position-relative shadow"
        style={{ zIndex: "5" }}
      >
        <span
          className="hover icon "
          onClick={() => {
            setShowColorPicker(!showColorPicker);
          }}
        >
          <img src="color-circle.png" alt="color" height={28} width={28} />
        </span>
        <span className="hover icon">
          <img
            src="cursor.png"
            alt="cursor"
            height={28}
            width={28}
            onClick={() => {
              stateContext?.setState("cursor");
            }}
          />
        </span>
        {showColorPicker && (
          <span className="position-absolute bottom-50 m-2 end-100 rounded-2 shadow ">
            <SketchPicker
              color={stateContext?.penColor}
              onChangeComplete={handleChangeComplete}
            />
          </span>
        )}
        <span
          className="hover icon position-relative"
          onClick={() => {
            stateContext?.setState("pen");
            if (!showContent && !showEraser) {
              setShowPen(!showPen);
            }
          }}
        >
          <img src="color-pencils.png" alt="color" height={28} width={28} />
        </span>
        {showPen && (
          <div className="position-absolute bottom-100 border start-0 bg-light p-2 m-2 rounded-2 shadow d-flex gap-3 move-pen">
            <input
              type="range"
              min="3"
              max="10"
              value={stateContext?.penWidth}
              onChange={(e) => {
                stateContext?.setPenWidth(parseInt(e.target.value));
              }}
            />
            <span className="hover icon">
              <img
                src="pencil.png"
                alt="pencil"
                height={28}
                width={28}
                onClick={() => {
                  stateContext?.setState("pen");
                }}
              />
            </span>
            <span className="hover icon">
              <img
                src="paint.png"
                alt="paint"
                height={28}
                width={28}
                onClick={() => {
                  // stateContext?.setClean(true);
                }}
              />
            </span>
            <span className="hover icon">
              <img
                src="highlighter.png"
                alt="highlighter"
                height={28}
                width={28}
                onClick={() => {
                  stateContext?.setState("highlighter");
                }}
              />
            </span>
            <span className="hover icon">
              <img
                src="clean.png"
                alt="clean"
                height={28}
                width={28}
                onClick={() => {
                  stateContext?.setClean(true);
                }}
              />
            </span>
          </div>
        )}
        <span
          className="hover icon"
          onClick={() => stateContext?.setState("eraser")}
        >
          <img
            src="eraser.png"
            alt="color"
            height={28}
            width={28}
            onClick={() => {
              stateContext?.setState("eraser");
              handleEraser();
            }}
          />
        </span>
        {showEraser && (
          <div className="position-absolute bottom-100 start-10 border move-eraser bg-light p-2 rounded-2 shadow d-flex gap-2 m-2">
            <input
              type="range"
              min="1"
              max="100"
              value={stateContext?.eraserWidth}
              className="hover icon"
              onChange={(e) => {
                stateContext?.setEraserWidth(parseInt(e.target.value));
              }}
            />
            <span className="hover icon ">
              <img
                src="clean.png"
                alt="clean"
                height={28}
                width={28}
                className="hover icon"
                onClick={() => {
                  stateContext?.setClean(true);
                }}
              />
            </span>
          </div>
        )}
        <span className="hover icon">
          <img
            src="size.png"
            alt="text"
            height={28}
            width={28}
            onClick={() => {
              // stateContext?.setState();
            }}
          />
        </span>
        <span className="hover icon">
          <img
            src="undo.png"
            alt="color"
            height={28}
            width={28}
            onClick={() => {
              stateContext?.setUndo(true);
            }}
          />
        </span>
        <span className="hover icon">
          <img
            src="redo.png"
            alt="color"
            height={28}
            width={28}
            onClick={() => {
              stateContext?.setRedo(true);
            }}
          />
        </span>
        <span className="hover icon">
          <img
            src="shape.png"
            alt="shapes"
            height={28}
            width={28}
            onClick={() => {
              setShowShapes(!showShapes);
            }}
          />
        </span>
        {showShapes && (
          <div className="position-absolute bottom-100 start-50 bg-light p-2 m-2 rounded-2 border shadow d-flex gap-3 move-pen">
            <span className="hover icon">
              <img
                src="rectangle.png"
                alt="rectangle"
                height={28}
                width={28}
                onClick={() => {
                  stateContext?.setState("rectangle");
                }}
              />
            </span>
            <span className="hover icon">
              <img
                src="oval.png"
                alt="circle"
                height={28}
                width={28}
                onClick={() => {
                  stateContext?.setState("circle");
                }}
              />
            </span>
            <span className="hover icon">
              <img
                src="diagonal-line.png"
                alt="line"
                height={28}
                width={28}
                onClick={() => {
                  stateContext?.setState("line");
                }}
              />
            </span>
            <span className="hover icon">
              <img
                src="nodes.png"
                alt="join_nodes"
                height={28}
                width={28}
                onClick={() => {
                  // stateContext?.setClean(true);
                }}
              />
            </span>
            <span className="hover icon">
              <img
                src="next.png"
                alt="arrow_line"
                height={28}
                width={28}
                onClick={() => {
                  // stateContext?.setClean(true);
                }}
              />
            </span>
          </div>
        )}
        <span className="hover icon ">
          <img src="magic-wand.png" alt="color" height={28} width={28} />
        </span>
        <span className="hover icon">
          <label htmlFor="add-image" style={{ cursor: "pointer" }}>
            <input
              type="file"
              accept="image/*"
              id="add-image"
              className="d-none"
              onChange={handleImageLoad}
            />

            <img src="add-photo.png" alt="color" height={28} width={28} />
          </label>
        </span>
        <span className="hover icon">
          <img src="video-call.png" alt="color" height={28} width={28} />
        </span>
        <div className="hover icon" onClick={handleContentSave}>
          <img src="application.png" alt="color" height={28} width={28} />
        </div>
        {showContent && (
          <div className="d-inline-flex gap-3 border-1 rounded-4 p-3 mb-3 bg-light flex-column position-absolute bottom-100 end-0 shadow">
            <span
              className="icon hover"
              onClick={() => {
                stateContext?.setDownload(true);
              }}
            >
              <img
                src="image-download.png"
                alt="color"
                height={28}
                width={28}
              />
            </span>
            <span
              className="icon hover"
              onClick={() => {
                stateContext?.setDownloadAsPDF(true);
              }}
            >
              <img src="pdf.png" alt="color" height={28} width={28} />
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingBar;
