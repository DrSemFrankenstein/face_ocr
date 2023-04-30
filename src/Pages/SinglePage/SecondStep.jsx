import * as React from "react";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FaceValidation from "../../Components/FaceValidation";

export default function SecondStep({cropedFaceDescriptor}) {
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Face Validation
      </Typography>
      <Grid
        container
        spacing={3}
        justifyContent="center"
        // alignItems="center"
        sx={{
          paddingY: 5,
          maxWidth: "100%",
          maxHeight: "100%",
          textAlign: "-webkit-center",
        }}
      >
        <Grid item xs={12} md={12}>
          <FaceValidation cropedFaceDescriptor={cropedFaceDescriptor}/>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
