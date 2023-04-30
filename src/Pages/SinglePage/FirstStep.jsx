import React, { useEffect, useState, useRef } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Tesseract from "tesseract.js";
import * as faceapi from "face-api.js";
import objectStore from "../../Store/objectStore";
import LinearWithValueLabel from "../../Components/LinearProgressWithLabel";
import { createWorker } from "tesseract.js";

export default function FirstStep({ img }) {
  const [ocrData, setOcrData] = useState({
    extractedFaceScore: 0,
    extractedOcrTextScore: 0,
    extractedOcrText: "",
    croppedFacePhoto: "",
    screenshot: "",
  });
  const [faceDetections, setFaceDetections] = useState({
    detections: [],
    faceImages: [],
    descriptors: [],
  });
  const [intervalId, setIntervalId] = useState(null);

  const extractOcrText = async (screenshot) => {
    if (screenshot !== null) {
      console.log("Start extracting OCR Text");
      // const config = {
      //   tessedit_char_whitelist:
      //     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", //allowed characters
      // };
      // const {
      //   data: { text, confidence },
      // } = await Tesseract.recognize(screenshot, "eng", config);
      // updateExtractedData(text, confidence);

      const {
        data: { text, confidence },
      } = await Tesseract.recognize(screenshot, "eng");
      updateExtractedData(text, confidence);
    }
  };

  const updateExtractedData = (extractData, highestConfidence) => {
    if (ocrData.extractedOcrTextScore < highestConfidence) {
      setOcrData((prevState) => ({
        ...prevState,
        extractedOcrTextScore: highestConfidence,
        extractedOcrText: extractData,
      }));
    }
  };

  const detectFaces = async (dataUrl) => {
    // create an image element from the DataURL
    const img = new Image();
    img.src = dataUrl;

    // wait for the image to load
    await img.onload;
    const detections = await faceapi.detectAllFaces(img);
    const faceImages = await faceapi.extractFaces(img, detections);
    const descriptors = await faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withFaceDescriptors();

    return { detections, faceImages, descriptors };
  };

  const handleVideoOnPlay = () => {
    let detect = false;
    const id = setInterval(async () => {
      const detections = await detectFaces(img);
      if (detections.detections.length > 0) {
        if (detections.detections[0].score > 0.96) {
          setFaceDetections(detections);
          objectStore.setObject({
            ...objectStore.getObject(),
            detectedDescriptors: detections.descriptors,
          });
          if (detections.faceImages.length > 0 && img && !detect) {
            try {
              detect = true;
              setOcrData((prevState) => ({
                ...prevState,
                croppedFacePhoto: detections.faceImages[0].toDataURL(),
              }));
              extractOcrText(img);
              console.log(faceDetections);
              clearInterval(intervalId);
            } catch (error) {
              console.log("Error in handleVideoOnPlay function: ", error);
              clearInterval(intervalId);
            }
          }
        }
      }
    }, 1000);
    setIntervalId(id);
  };

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Extracting Data
      </Typography>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        sx={{ paddingY: 5 }}
      >
        <div
          className="ocrloader"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          <p>Scanning</p>
          <em></em>
          <span>
            <img
              src={img}
              alt="Screenshot"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
              }}
              // onLoad={() => extractOcrText(img)}
              onLoad={() => {
                handleVideoOnPlay();
              }}
            />
          </span>
        </div>
      </Grid>
      {!ocrData.croppedFacePhoto ? (
        <>
          <LinearWithValueLabel lable={"Photo scanning"} color={"secondary"} />
        </>
      ) : (
        <>
          <img
            src={ocrData.croppedFacePhoto}
            alt="User face"
            style={{
              width: "64px",
              height: "auto",
              borderRadius: "10%",
            }}
          />
          {ocrData.extractedOcrTextScore ? (
            <>
              <br />
              {ocrData.extractedOcrTextScore}
              <br />
              {/* {ocrData.extractedOcrText} */}
              <pre>{ocrData.extractedOcrText}</pre>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    id="firstName"
                    name="firstName"
                    label="First name"
                    fullWidth
                    autoComplete="given-name"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    id="lastName"
                    name="lastName"
                    label="Last name"
                    fullWidth
                    autoComplete="family-name"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    id="address1"
                    name="address1"
                    label="Address line 1"
                    fullWidth
                    autoComplete="shipping address-line1"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="address2"
                    name="address2"
                    label="Address line 2"
                    fullWidth
                    autoComplete="shipping address-line2"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    id="city"
                    name="city"
                    label="City"
                    fullWidth
                    autoComplete="shipping address-level2"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="state"
                    name="state"
                    label="State/Province/Region"
                    fullWidth
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    id="zip"
                    name="zip"
                    label="Zip / Postal code"
                    fullWidth
                    autoComplete="shipping postal-code"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    id="country"
                    name="country"
                    label="Country"
                    fullWidth
                    autoComplete="shipping country"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="secondary"
                        name="saveAddress"
                        value="yes"
                      />
                    }
                    label="Use this address for payment details"
                  />
                </Grid>
              </Grid>
            </>
          ) : (
            <>
              <LinearWithValueLabel
                lable={"Reading scanned text"}
                color={"primary"}
              />
            </>
          )}
        </>
      )}
    </React.Fragment>
  );
}
