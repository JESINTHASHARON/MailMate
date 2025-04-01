import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { GET_INITIAL_CONTACTS_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect } from "react";
import ChatListItem from "./ChatLIstItem";

function List() {

  const[{userInfo,userContacts,filteredContacts},dispatch]=useStateProvider();

  useEffect(()=>{
    try{
      const getContacts=async()=>{

        const {
          data:{
            users,
            onlineUsers,
          }
        }=await axios(`${GET_INITIAL_CONTACTS_ROUTE}/${userInfo.id}`);
        dispatch(
          {type:reducerCases.SET_ONLINE_USERS,onlineUsers}
        )
        dispatch({
          type:reducerCases.SET_USER_CONTACTS,userContacts:users
        })
      }
      if(userInfo?.id) getContacts();
    }
    catch(err)
    {
      console.log(err);
    }
  },[userInfo])

  return (
  <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full custom-scrollbar">
    {
      filteredContacts && filteredContacts.length>0 ?
      (filteredContacts.map((contact)=><ChatListItem data={contact} key={contact.id}/> ))
      :(userContacts.map((contact)=> <ChatListItem data={contact} key={contact.id}/> ))
    }
  </div>
)}

export default List;

