import * as React from "react";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import ImageUploader from "../../Components/ImageUploader";

export default function ZeroStep() {
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Upload Image
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ImageUploader/>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
