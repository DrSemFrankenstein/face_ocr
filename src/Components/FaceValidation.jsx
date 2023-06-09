import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { Button, IconButton } from "@material-ui/core";
import { FlipCameraIos } from "@material-ui/icons";
import objectStore from "../Store/objectStore";

const FaceValidation = ({ cropedFaceDescriptor, cropedFaceImages, score }) => {
  const webcamRef = React.useRef(null);
  const [isWebcamOn, setIsWebcamOn] = useState(true);
  const [cameraPreview, setCameraPreview] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [quality, setQuality] = useState(1);
  const [facingMode, setFacingMode] = useState("user");
  let mediaStream = null;

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + "/models";
      Promise.all([
        faceapi.nets.ssdMobilenetv1.load(MODEL_URL),
        faceapi.nets.faceRecognitionNet.load(MODEL_URL),
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(startWebcam());
    };
    loadModels();
  }, []);

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: facingMode } },
      });
      if (webcamRef.current) {
        webcamRef.current.video.srcObject = mediaStream;
        webcamRef.current.video.play();
        setIsWebcamOn(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const stopWebcam = () => {
    if (webcamRef.current) {
      webcamRef.current.video.pause();
      webcamRef.current.video.srcObject.getTracks()[0].stop();
      setIsWebcamOn(false);
    }
  };

  const handleFacingModeChange = () => {
    setFacingMode(facingMode === "user" ? "environment" : "user");
  };

  const detectFaces = async (image) => {
    const detections = await faceapi
      .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withFaceDescriptors();
    return detections;
  };

  const handleVideoOnPlay = () => {
    const id = setInterval(async () => {
      // Detect faces in the captured photo
      if (webcamRef.current == null) {
        clearInterval(intervalId);
        return;
      }
      const image = webcamRef.current.video;
      const detection = await detectFaces(image);
      setCameraPreview(true);
      if (detection.length > 0 && detection && cropedFaceDescriptor) {
        const distance = faceapi.euclideanDistance(
          detection[0].descriptor,
          cropedFaceDescriptor[0].descriptor
        );
        setQuality(distance);
        if (distance < 0.6) {
          console.log("The two faces belong to the same person: " + distance);
          objectStore.setObject({
            ...objectStore.getObject(),
            validPerson: true,
          });
          stopWebcam();
          clearInterval(intervalId);
        } else {
          console.log("The two faces belong to different people: " + distance);
          objectStore.setObject({
            ...objectStore.getObject(),
            validPerson: false,
          });
        }
        clearInterval(intervalId);
      }
    }, 1000);
    setIntervalId(id);
  };

  return (
    <>
      {!cameraPreview && "Loading..."}
      <div
        className="webcam-ring2"
        style={{
          display: cameraPreview ? "" : "none",
          borderColor: quality < 0.6 ? "#1976d2" : "#f50057",
        }}
      >
        <Webcam
          audio={false}
          ref={webcamRef}
          onPlay={handleVideoOnPlay}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: facingMode }}
          style={{
            width: "100%",
            border: "solid 6px",
            transform: "scaleX(-1)",
            //   borderColor: quality < 0.6 ? "green" : "red",
            // filter: "grayscale(100%)",
          }}
        />
      </div>
      <br />
      <Button
        variant="contained"
        startIcon={<FlipCameraIos />}
        onClick={handleFacingModeChange}
        color="secondary"
        style={{ display: cameraPreview ? "" : "none" }}
      >
        {facingMode === "user" ? "FRONT" : "REAR"}
      </Button>
    </>
  );
};

export default FaceValidation;
