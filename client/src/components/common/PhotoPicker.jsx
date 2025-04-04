import React from "react";
import ReactDOM from "react-dom";
//DOM-Document Object Model

function PhotoPicker({onChange}) {
  const component=(<input type="file" hidden id="photo-picker" onChange={onChange} />);
 
  return ReactDOM.createPortal(component,document.getElementById("photo-picker-element"));
}

export default PhotoPicker;
