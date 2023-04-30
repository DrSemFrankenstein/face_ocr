import React, { useContext, useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Paper from "@mui/material/Paper";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import FirstStep from "./FirstStep";
import SecondStep from "./SecondStep";
import TherthdStep from "./TherthdStep";
import ZeroStep from "./ZeroStep";
import * as faceapi from "face-api.js";
import { observe } from "mobx";
import { ObjectContext } from "../../Store/objectStore";

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const steps = ["Upload image", "Scanning", "Validation", "Confirmation"];

const theme = createTheme();

export default function StartComponent() {
  const [activeStep, setActiveStep] = React.useState(0);
  const objectStore = useContext(ObjectContext);
  const [currentObject, setCurrentObject] = React.useState("");

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + "/models";
      Promise.all([
        faceapi.nets.ssdMobilenetv1.load(MODEL_URL),
        faceapi.nets.faceRecognitionNet.load(MODEL_URL),
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then();
    };
    loadModels();
  }, []);

  function getStepContent(step) {
    switch (step) {
      case 0:
        return <ZeroStep />;
      case 1:
        return <FirstStep img={currentObject} />;
      case 2:
        return <SecondStep />;
      case 3:
        return <TherthdStep />;
      default:
        throw new Error("Unknown step");
    }
  }

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  //   const handleGetObject = () => {
  //     const object = objectStore.getObject();
  //     if (object.imgFile instanceof Blob) {
  //       const reader = new FileReader();
  //       reader.onload = () => {
  //         setCurrentObject(reader.result);
  //         console.log(reader.result);
  //       };
  //       reader.readAsDataURL(object.imgFile);
  //     }
  //   };

  //   useEffect(() => {
  //     // const object = objectStore.getObject().imgFile;
  //     const object = objectStore.getObjectProperty("imgFile");

  //     if (object instanceof Blob) {
  //       const reader = new FileReader();
  //       reader.onload = () => {
  //         setCurrentObject(reader.result);
  //       };
  //       reader.readAsDataURL(object);
  //     }
  //   }, [objectStore.getObject()]);

  useEffect(() => {
    const disposer = observe(objectStore, "object", (change) => {
      //   console.log("Component reporting Object changed:", change.newValue);
      const object = objectStore.getObjectProperty("imgFile");
      if (object instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          setCurrentObject(reader.result);
        };
        reader.readAsDataURL(object);
      }
    });
    return () => disposer();
  }, [objectStore]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar
        position="absolute"
        color="default"
        elevation={0}
        sx={{
          position: "relative",
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" color="inherit" noWrap>
            Validator
          </Typography>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length ? (
            <React.Fragment>
              <Typography variant="h5" gutterBottom>
                Thank you for your order.
              </Typography>
              <Typography variant="subtitle1">
                Your order number is #2001539. We have emailed your order
                confirmation, and will send you an update when your order has
                shipped.
              </Typography>
              <Button
                onClick={() => {
                  setActiveStep(0);
                }}
                sx={{ mt: 3, ml: 1 }}
              >
                RESTAR
              </Button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {getStepContent(activeStep)}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                    Back
                  </Button>
                )}

                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 3, ml: 1 }}
                  disabled={currentObject === ""}
                >
                  {activeStep === steps.length - 1 ? "Place order" : "Next"}
                </Button>
              </Box>
            </React.Fragment>
          )}
        </Paper>
        {/* <Copyright /> */}
      </Container>
    </ThemeProvider>
  );
}
