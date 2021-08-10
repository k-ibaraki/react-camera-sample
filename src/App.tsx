import React from 'react';
import './App.css';
import Webcam from "react-webcam";

const WebcamCapture = () => {
  const webcamRef = React.useRef<Webcam>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [imgSrc, setImgSrc] = React.useState<string | null>(null);

  const [text, setText] = React.useState<string>("日本")

  // useEffectの中でsetIntervalを使うとstateが更新されないので、useRefを使う
  const textRef = React.useRef<string>(text);
  React.useEffect(() => {
    textRef.current = text;
  }, [text]);
  

  const img = new Image();


  //可能なら背面カメラを使用
  const videoConstraints = {
    facingMode: "environment",
  };

  //Canvas描画
  function drawImg(){
    const video = webcamRef.current;
    const canvas = canvasRef.current;
    if(video && canvas && video.video){
      let ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      canvas.width = video.video.videoWidth;
      canvas.height = video.video.videoHeight;
      ctx.drawImage(video.video, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 50, 100);
      ctx.font = '28px "Hiragino Kaku Gothic ProN"'
      ctx.fillStyle = 'rgba(0, 0, 0)'
      ctx.fillText(textRef.current, 85, 175, 130)
    }
  }

  // 100ms単位でCanvasを更新する
  React.useEffect(() => {
    img.onload = () => {
      const interval = setInterval(() => {
          drawImg();
      }, 100);
      return () => clearInterval(interval)
    }
    //onloadの後に書かないと、取得が早すぎて発火しない時がある
    img.src = "img/placard_syuchusen.png"
  }, []);

  //キャプチャ
  const capture = React.useCallback(() => {
    const imageSrc2 = canvasRef.current?.toDataURL('png') ?? null
    setImgSrc(imageSrc2);
  }, [canvasRef, setImgSrc]);

  return (
    <>
      <div>
        - 元のカメラ画像<br/>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
        />
      </div>
      <div>
        - Canvas上にカメラ画像と画像ファイルとテキストを重ねる<br/>
        <input type="text" name="text" value={text} onChange={(event) => setText(event.target.value)} /><br/>
        <canvas ref={canvasRef} />
      </div>
      <div>
        - ボタンを押すとCanvasをキャプチャする<br/>
        <button onClick={capture}>Capture photo</button><br/>
        {imgSrc && (
          <img
            src={imgSrc} alt="non capture"
          />
        )}
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
