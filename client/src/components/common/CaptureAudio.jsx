import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { ADD_AUDIO_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaPause, FaPauseCircle, FaPlay, FaStop, FaTrash } from "react-icons/fa";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";

function CaptureAudio({hide}) {

  const[{userInfo,currentChatUser,socket},dispatch]=useStateProvider();

  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState(null)
  const [waveForm, setWaveForm] = useState(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false);
  const [renderedAudio, setRenderedAudio] = useState(null)


  const audioRef=useRef(null);
  const mediaRecordedRef=useRef(null);
  const waveFormRef=useRef(null);

  //Increments recordingDuration every second while recording.
  useEffect(()=>{
    let interval;
    if(isRecording){
      interval=setInterval(()=>{
        setRecordingDuration((prevDuration)=>{
          setTotalDuration(prevDuration+1);
          return prevDuration+1;
        });
      },1000);
    }
    return ()=>{
      clearInterval(interval);
    };
  },[isRecording]);

  //Initializes a WaveSurfer instance with custom styles.
  useEffect(()=>{
    const wavesurfer=WaveSurfer.create({
      container: waveFormRef.current,
      waveColor:"#ccc",
      progressColor: "#7ae3c3",
      barWidth: 2,
      height: 30,
      responsive: true,
    })
    setWaveForm(wavesurfer)

    wavesurfer.on("finish",()=>{
      setIsPlaying(false)
    })

    return ()=>{
      wavesurfer.destroy
    }
  },[])


  useEffect(()=>{
    if(waveForm) handleStartRecording();
  },[waveForm]);

  const handleStartRecording=()=>{
    setRecordingDuration(0);
    setCurrentPlaybackTime(0);
    setTotalDuration(0);
    setIsRecording(true);
    setRecordedAudio(null);
    navigator.mediaDevices.getUserMedia({audio:true}).then((stream)=>{
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecordedRef.current=mediaRecorder;
      audioRef.current.srcObject=stream;

      const chunks=[];
      mediaRecorder.ondataavailable=(e)=>chunks.push(e.data);
      mediaRecorder.onstop=()=>{
        const blob = new Blob(chunks,{type:"audio/ogg;codecs=opus"});
        const audioURL=URL.createObjectURL(blob);
        const audio = new Audio(audioURL);
        setRecordedAudio(audio);

        waveForm.load(audioURL);
      }
      mediaRecorder.start();
    }).catch(error=>{
      console.error("Error accessing Microphone: ",error);
    })
  }
  const handleStopRecording=()=>{
    if(mediaRecordedRef.current && isRecording){
      mediaRecordedRef.current.stop();
      setIsRecording(false);
      waveForm.stop();

      const audioChunks=[];
      mediaRecordedRef.current.addEventListener("dataavailable",(event)=>{
        audioChunks.push(event.data);
      });
      mediaRecordedRef.current.addEventListener("stop",()=>{
        const audioBlob=new Blob(audioChunks,{type: "audio/mp3"});
        const audioFile=new File([audioBlob],"recording.mp3");
        setRenderedAudio(audioFile);
      })
    }
  }

  useEffect(()=>{
    if(recordedAudio){
      const updatePlaybackTime=()=>{
        setCurrentPlaybackTime(recordedAudio.currentTime);
      };
      recordedAudio.addEventListener("timeupdate",updatePlaybackTime);
      return()=>{
        recordedAudio.removeEventListener("timeupdate",updatePlaybackTime);
      };
    }
  },[recordedAudio]);

  const handlePlayRecording=()=>{
    if(recordedAudio){
      waveForm.stop();
      waveForm.play();
      recordedAudio.play();
      setIsPlaying(true);
    }
  };
  const handlePauseRecording=()=>{
    waveForm.stop();
    recordedAudio.pause();
    setIsPlaying(false);
  }

  const sendRecording=async()=>{
    try{
      //const file=e.target.files[0];
      const formData=new FormData();
      formData.append("audio",renderedAudio);
      const response= await axios.post(ADD_AUDIO_MESSAGE_ROUTE,formData,{
        headers:{
          "Content-Type":"multipart/form-data",
        },
        params:{
          from:userInfo.id,
          to: currentChatUser.id,
        }
     })
     if(response.status===201){
      socket.current.emit("send-msg",{
        to: currentChatUser?.id,
        from: userInfo?.id,
        message: response.data.message,
      })
      //display the message in chat container after sent
      dispatch({
        type: reducerCases.ADD_MESSAGE,
        newMessage:{
          ...response.data.message,
        },
        fromSelf:true,
      })
     }
    }
    catch(err){
      console.log(err);
    }
  };

  const formatTime=(time)=>{
    if (isNaN(time)) return "00:00";
    const minutes=Math.floor(time/60);
    const seconds=Math.floor(time%60);
    return `${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`;
  }

  return( 
  <div className="flex text-2xl w-full justify-end items-center">
    <div className="pt-1">
      <FaTrash
        className="text-panel-header-icon cursor-pointer"
        onClick={()=>hide()}
        title="Delete"
      />
    </div>
    <div className="mx-4 py-2 px-4 text-white text-lg flex gap-3 justify-center items-center bg-search-input-container-background rounded-fill drop-shadow-lg">
      {isRecording ?
      (<div className="text-red-500 animate-pulse 2-60 text-center">
        Recording...<span>{recordingDuration}s</span>
      </div>):
      (
        <div>
        {recordedAudio &&(
          <>
          {!isPlaying?<FaPlay onClick={handlePlayRecording} title="Play"/>:<FaPause onClick={handlePauseRecording} title="Pause"/>}
          </>
        )}
        </div>
      )}
      
      <div className="w-60" ref={waveFormRef} hidden={isRecording}/>
        {
          recordedAudio && isPlaying && (
            <span>{formatTime(currentPlaybackTime)}</span>
        )}
        {
          recordedAudio && !isPlaying && (
            <span>{formatTime(totalDuration)}</span>
        )}
        <audio ref={audioRef} hidden/>
        </div>
        <div className="mr-4">
          {
            !isRecording ? (<FaMicrophone className="text-red-500 cursor-pointer" onClick={handleStartRecording} title="Record"/>)
            :(<FaPauseCircle className="text-red-500 cursor-pointer" title="Pause" onClick={handleStopRecording}/>)
          }
        </div>
      <div>
      <MdSend className="text-panel-header-icon cursor-pointer mr-4" title="Send" onClick={sendRecording}/>
      </div>
  </div>
)}

export default CaptureAudio;
