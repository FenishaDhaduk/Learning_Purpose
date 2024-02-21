"use client"
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import React from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const [uploading, setUploading] = React.useState(false);
  const router = useRouter();
  const { mutate} = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const responce = await axios.post("api/create-chat", {
        file_key,
        file_name,
      });
      return responce.data;
    },
  });
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        // bigger than 10mb
        toast.error("file too large");
        alert("please upload smaller file");
        return;
      }
      try {
        setUploading(true);
        const data = await uploadToS3(file);
        if (!data?.file_key || !data.file_name) {
          toast.error("filekey and filename not get");
          return;
        }
        mutate(data, {
          onSuccess: (chat_id) => {
            router.push(`/chat/${chat_id?.chat_id}`);
            toast.success("Chat Created!");
        setUploading(false);
            
          },
          onError: (error) => {
            toast.error("error createing in chat");
            setUploading(false);
            console.log(error);
          },
        });
      } catch (error) {
        setUploading(false);
        console.log(error);
      }
    },
  });
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8  flex justify-center items-center flex-col",
        })}
      >
        {uploading ? (
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Spilling Tea to GPT...
            </p>
          </>
        ) : (
          <>
            <input {...getInputProps()} />
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
