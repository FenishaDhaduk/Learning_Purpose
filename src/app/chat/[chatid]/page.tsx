import ChatSideBar from "@/components/ChatSideBar";
import Chatcomponet from "@/components/Chatcomponet";
import PDFViewer from "@/components/PDFViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    chatid: string;
  };
};

export default async function page({ params: { chatid } }: Props) {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) {
    return redirect("/");
  }

  if (!_chats.find((chat) => chat.id === parseInt(chatid))) {
    return redirect("/");
  }

  const currentChat = _chats.find((chat)=>chat.id === parseInt(chatid))
  return (
    <div className="flex">
      <div className="flex w-full max-h-screen">
        {/* chat siderbar */}
        <div className="flex-[1] max-w-xs">

            <ChatSideBar chats={_chats} chatId={parseInt(chatid)} />
        </div>
        {/* pdf viewer */}
        <div className="max-h-screen p-4 overflow-scroll flex-[5]">
          <PDFViewer pdf_url={currentChat?.pdfUrl || ""}/>
        </div>
        {/* chat component */}
        <div className="flex-[3] border-1-4 border-1-slate-200">
          <Chatcomponet chatId={parseInt(chatid)}/>
        </div>
      </div>
    </div>
  );
}
