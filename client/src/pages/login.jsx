import React, { useEffect } from "react";
import Image from "next/image"
import {FcGoogle} from "react-icons/fc"
import { firebaseAuth } from "@/utils/FirebaseConfig.js";
import axios from "axios";
import {GoogleAuthProvider,signInWithPopup} from "firebase/auth";
import { CHECK_USER_ROUTE } from "@/utils/ApiRoutes.js";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";

function login() {
  const router=useRouter()

  const [{userInfo,newUser},dispatch]=useStateProvider();

  useEffect(()=>{
    if(userInfo?.id && !newUser){
      router.push("/");
    }
  },[userInfo,newUser])

  const handleLogin= async()=>{
    const provider= new GoogleAuthProvider();
    const {
      user:{displayName:name,email,photoURL:profileImage}
    } = await signInWithPopup(firebaseAuth,provider);
    try{
      if(email){
        const { data } = await axios.post(CHECK_USER_ROUTE, { email });
        
        if(!data.status){

          dispatch({
            type: reducerCases.SET_NEW_USER,
            newUser: true,
          });
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              name,email,profileImage,status:"",
            },
          })
          router.push("/onboarding");
        }
        else{
          const {id,name,email,profilePicture:profileImage,status}=data.data;
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo:{
              id,
              name,
              email,
              profileImage,
              status,
            },
          });
          router.push("/");
        }
      }
    }
    catch(err){
      console.error(err);
    }
  }
  return <div className="flex justify-center items-center bg-panel-header-background h-screen w-screen flex-col gap-6">
    <div className="flex justify-center items-center gap-2 text-white">
      <Image src="/ChatApp.gif" alt="ChatApp" height={300} width={300}></Image>
      <span className="text-7xl">ChatApp</span>
    </div>
    <button className="flex items-center justify-center gap-7 bg-search-input-container-background p-5 rounded-lg" onClick={handleLogin}>
      <FcGoogle className="text-4xl"></FcGoogle>
      <span className="text-white text-2xl ">Login with Google</span>
    </button>
  </div>;
}

export default login;
