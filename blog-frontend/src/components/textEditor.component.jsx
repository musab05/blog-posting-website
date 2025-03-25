import { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Embed from '@editorjs/embed';
import Paragraph from '@editorjs/paragraph';
import ImageTool from '@editorjs/image';
import CodeTool from '@editorjs/code';
import Quote from '@editorjs/quote';
import Marker from '@editorjs/marker';
import Table from '@editorjs/table';
import Delimiter from '@editorjs/delimiter';
import CustomVideoTool from './CustomVideoTool';
import axios from 'axios';

export default function TextEditor({ setContent }) {
  const ejInstance = useRef(null);

  useEffect(() => {
    if (!ejInstance.current) {
      const editor = new EditorJS({
        holder: 'editorjs',
        autofocus: true,
        inlineToolbar: ['bold', 'italic', 'marker', 'link'],
        tools: {
          header: Header,
          paragraph: Paragraph,
          list: List,
          embed: Embed,
          code: CodeTool,
          quote: Quote,
          marker: Marker,
          delimiter: Delimiter,
          table: Table,
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file) {
                  const res = await uploadFileToServer(file);
                  if (res.success) {
                    return {
                      success: 1,
                      file: { url: res.path },
                    };
                  }
                  return { success: 0 };
                },
              },
            },
          },
          video: {
            class: CustomVideoTool,
            config: {
              uploader: {
                async uploadByFile(file) {
                  const res = await uploadFileToServer(file);
                  if (res.success) {
                    return {
                      success: 1,
                      file: { url: res.path },
                    };
                  }
                  return { success: 0 };
                },
              },
            },
          },
        },
        onReady: () => {
          ejInstance.current = editor;
        },
        onChange: async () => {
          const data = await ejInstance.current.save();
          setContent(data);
        },
        placeholder: 'Start writing your blog content...',
      });
    }

    return () => {
      if (ejInstance.current && ejInstance.current.destroy) {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, [setContent]);

  const uploadFileToServer = async file => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + '/api/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );
      const fullPath = data.url;
      return { ...data, path: fullPath };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { success: 0 };
    }
  };

  return (
    <div
      id="editorjs"
      className="border rounded-md min-h-[400px] bg-white p-4"
    />
  );
}
