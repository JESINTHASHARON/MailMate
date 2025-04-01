import React from "react";
import Image from "next/image";
function Empty() {
  return (<div className="border-conversation-border border-l w-full bg-panel-header-background flex flex-col h-[100vh] border-b-icon-green items-center justify-center">
    <Image src="/ChatApp.gif" alt="chatapp" height={300} width={300} />
  </div>)
}

export default Empty;
