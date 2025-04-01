import React, { useState } from "react";
import Avatar from "../common/Avatar";
import { useStateProvider } from "@/context/StateContext";
import {BsFillChatLeftTextFill,BsThreeDotsVertical} from "react-icons/bs"
import { reducerCases } from "@/context/constants";
import ContextMenu from "../common/ContextMenu";
import { useRouter } from "next/router";

function ChatListHeader() {
  const router=useRouter();
  const [{userInfo},dispatch]=useStateProvider();

  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
    const [contextMenuCordinates, setContextMenuCordinates] = useState({x:0,y:0});
      
    const showContextMenu = (e) =>{
      e.preventDefault();
      setIsContextMenuVisible(true);
      setContextMenuCordinates({x:e.pageX,y:e.pageY});
    }
    const contextMenuOptions=[
      {
        name:"Logout",
        callback: async()=>{ 
          setIsContextMenuVisible(false);
          router.push("/logout");
        }
      }
    ];
  

  const handleAllContactPage=()=>{
    dispatch({
      type:reducerCases.SET_ALL_CONTACTS_PAGE
    });
  };

  return (
  <div className="h-16 px-4 py-3 flex justify-between items-center">
    <div className="cursor-pointer">
      <Avatar type="sm" image={userInfo?.profileImage}/>
    </div>
    <div className="flex gap-6">
      <BsFillChatLeftTextFill 
      className="text-panel-header-icon cursor-pointer text-xl "
      title="New Chat"
      onClick={handleAllContactPage}
      />
      <>
        <BsThreeDotsVertical 
        className="text-panel-header-icon cursor-pointer text-xl "
        title="Menu"
        onClick={(e)=>showContextMenu(e)}
        id="context-opener"
        />
        {
        isContextMenuVisible &&(
          <ContextMenu
            options={contextMenuOptions}
            cordinates={contextMenuCordinates}
            contextMenu={isContextMenuVisible}
            setContextMenu={setIsContextMenuVisible}
          />
        )
      }
      </>
    </div>
  </div>
)}

export default ChatListHeader;
