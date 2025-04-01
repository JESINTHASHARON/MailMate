import React, { useEffect } from "react";
import Image from "next/image";
import {FaCamera} from "react-icons/fa";
import { useState } from "react";
import ContextMenu from "./ContextMenu";
import { useStateProvider } from "@/context/StateContext";
import PhotoPicker from "./PhotoPicker";
import PhotoLibrary from "./PhotoLibrary";
import CapturePhoto from "./CapturePhoto";

function Avatar({type,image,setImage}) {
  const [hover,setHover] = useState(false);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuCordinates, setContextMenuCordinates] = useState({x:0,y:0});
  const [grabPhoto, setGrabPhoto] = useState(false);
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false);
  const [showCapturePhoto, setShowCapturePhoto] = useState(false);

  const showContextMenu = (e) =>{
    e.preventDefault();
    setIsContextMenuVisible(true);
    setContextMenuCordinates({x:e.pageX,y:e.pageY});
  }

  useEffect(()=>{
    if(grabPhoto){
      const data=document.getElementById("photo-picker");
      data.click();
      document.body.onfocus=(e)=>{
        setTimeout(()=>{
          setGrabPhoto(false);
        },1000)
       
      }
    }
  },[grabPhoto]);
  //[grabPhoto] is called dependecy array- It allows the useEffect to only rerun when grabPhoto changes

  //The things showed inside context menu
  const contextMenuOptions=[
    {name:"Take Photo",callback:()=>{
      setShowCapturePhoto(true);
    }},
    {name:"Choose From library",callback:()=>{
      setShowPhotoLibrary(true);
    }},
    {name:"Upload Photo",callback:()=>{
      setGrabPhoto(true);
    }},
    {name:"Remove Photo",callback:()=>{setImage("/default_avatar.png"); }}//setImage("default-avatar.png"); 
  ];

  //to upload the picture in place of avatar
  const photoPickerChange=async(e)=>{
    const file=e.target.files[0];//the first file selected by the user
    const reader=new FileReader();//FileReader API can read files as text, binary data, or data URLs.
    const data=document.createElement("img")
    reader.onload=function(event){
      data.src=event.target.result;//event.target.result will produce the base64 string 
      data.setAttribute("data-src",event.target.result);
    };
    reader.readAsDataURL(file);//starts reading the file as a data URL, triggering the onload function once it finishes.
    setTimeout(()=>{
      console.log(data.src);
      setImage(data.src);
    },100);
  };

  return(
    <>
      <div className="flex items-center justify-center">
        {type==="sm" && (
          <div className="relative h-10 w-10">
            <Image src={image} alt="Avatar" className="rounded-full" fill/>
          </div>
        )}
         {type==="lg" && (
          <div className="relative h-14 w-14">
            <Image src={image} alt="Avatar" className="rounded-full" fill/>
          </div>
        )}
        {type==="xl" && (
          <div className="relative cursor-pointer z-0"
          onMouseEnter={()=> setHover(true)}
          onMouseLeave={()=> setHover(false)}
          >
          <div className={`z-10 bg-photopicker-overlay-background h-60 w-60 absolute top-0 left-0 flex items-center rounded-full justify-center flex-col text-center gap-2
            ${hover?"visible":"hidden"}`}
            onClick={(e)=>showContextMenu(e)}
            >
            <FaCamera className="text-2xl" id="context-opener" onClick={(e)=>showContextMenu(e)}/>
            <span id="context-opener" onClick={(e)=>showContextMenu(e)}>Change Profile Photo</span>
          </div>
          <div className="flex items-center justify-center h-60 w-60 ">
            <Image src={image} alt="Avatar" className="rounded-full" fill/>
          </div>
          </div>
        )}
      </div>
      {
        showCapturePhoto && (<CapturePhoto
          setImage={setImage}
          hide={setShowCapturePhoto}
          />
        )
      }
      {
        isContextMenuVisible && (<ContextMenu
         options={contextMenuOptions}
         cordinates={contextMenuCordinates}
         contextMenu={isContextMenuVisible}
         setContextMenu={setIsContextMenuVisible}
        />
      )}
      {showPhotoLibrary &&<PhotoLibrary 
        setImage={setImage}
        hidePhotoLibrary={setShowPhotoLibrary}
      />}
      { 
        grabPhoto && (<PhotoPicker onChange={photoPickerChange}/>
      )} 
    </>
  );
}

export default Avatar;
