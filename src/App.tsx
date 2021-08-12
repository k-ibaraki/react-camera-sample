import React from 'react';
import Konva from "konva";
import './App.css';
import Webcam from "react-webcam";
import {Stage, Layer, Group, Image as KonvaImage, Text as KonvaText} from "react-konva";
import { Layer as LayerC } from 'konva/lib/Layer';
import { Stage as StageC } from 'konva/lib/Stage';
import { Group as GroupC } from 'konva/lib/Group';

// さんぷるなので、コンポーネント分割とか考えずに全部ここに書く

const WebcamCapture = () => {
  // 強制的にレンダリングさせる関数。使いたくなかったが、、、
  // Webカメラの再生開始後にCanvasを再生成するのに使う
  const [, forceUpdate] = React.useReducer(x => x+1, 0)

  //** Webカメラの元画像用の処理 **//
  //WebCamからCanvasにvideoを渡すのに使う
  const webcamRef = React.useRef<Webcam>(null);
  //背面カメラを使用する設定
  const videoConstraints = {
    facingMode: "environment",
  };

  //** カメラ画像に画像とテキストをCanvas上に重ねる処理 **//
  // react-konvaを使う

  // 画面キャプチャを撮るときに使う
  const konvaStageRef = React.useRef<StageC>(null)

  // オブジェクト位置の保持に使う（再描画時にリセットされない為）
  const konvaGroupRef = React.useRef<GroupC>(null)

  // videoの再生開始に使う。useRefは状態の変化を検知しないのでuseCallback
  const konvaLayerRef = React.useCallback( (konvaLayer : LayerC | null) =>{
    const anim = new Konva.Animation(
      () => {},
      konvaLayer
    )
    anim.start();
  }, []);

  // カメラ画像に重ねる画像ファイル。どこかでonloadを待つべき？
  const img = new Image();
  img.src = "img/placard_syuchusen.png"

  // 画像に重ねるtext
  const [text, setText] = React.useState<string>("日本")

  // Canvas描画
  const DrawCanvas = () => {
    const video = webcamRef.current?.video;
    const videoW = video?.videoWidth ?? 0
    const videoH = video?.videoHeight ?? 0
    const groupPos = konvaGroupRef.current?.getPosition();

    return (
      <Stage width={videoW} height={videoH} ref={konvaStageRef}>
        <Layer ref={konvaLayerRef}>
          <KonvaImage
            image={video ?? undefined}
            x={0}
            y={0}
            width={videoW}
            height={videoH}
          />
          <Group
            ref={konvaGroupRef}
            draggable={true}
            x={groupPos?.x ?? 50}
            y={groupPos?.y ?? 100}
          >
            <KonvaImage image={img} />
            <KonvaText 
              fontFamily={`Hiragino Kaku Gothic ProN`}
              fontSize={16}
              text={text}
              x={35}
              y={40}
              width={130}
              height={50}
            />
          </Group>
        </Layer>
      </Stage>
    )
  }

  //** 画像としてキャプチャする処理 **//
  const [imgSrc, setImgSrc] = React.useState<string>("")
  const capture = React.useCallback(() => {
    const imageSrc = konvaStageRef?.current?.toDataURL() ?? "";
    setImgSrc(imageSrc);
  }, [konvaStageRef, setImgSrc]);

  const DrawCapture = () => {
    return(
      <>
        <button onClick={capture}>Capture photo</button><br/>
        {imgSrc && (
          <img
            src={imgSrc} alt="non capture"
          />
        )}
      </>
    )
  }
  

  return (
    <>
      <div>
        - 元のカメラ画像<br/>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          onPlaying={() => forceUpdate()}
        />
      </div>
      <div>
        - Canvas上にカメラ画像と画像ファイルとテキストを重ねる<br/>
        <input type="text" name="text" value={text} onChange={(event) => setText(event.target.value)} /><br/>
        <DrawCanvas />
      </div>
      <div>
        - ボタンを押すとCanvasをキャプチャする<br/>
        <DrawCapture />
      </div>
    </>
  );
};

function App() {
  return (
    <WebcamCapture />
 );
}

export default App;
