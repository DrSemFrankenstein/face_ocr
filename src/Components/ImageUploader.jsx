import React, { useState } from "react";
import objectStore from "../Store/objectStore";
import { Button, Input } from "@material-ui/core";

const ImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    setSelectedImage(selectedFile);

    objectStore.setObject({
      ...objectStore.getObject(),
      imgFile: selectedFile,
    });

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div>
      <div>
        <Input
          id="file-input"
          type="file"
          inputProps={{ accept: ".jpg,.png,.jpeg" }}
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
        <label htmlFor="file-input">
          <Button variant="contained" color="primary" component="span">
            {"Select file"}
          </Button>
        </label>
      </div>
      <br />
      {previewImage && (
        <img
          src={previewImage}
          alt="Preview"
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        />
      )}
    </div>
  );
};

export default ImageUploader;
