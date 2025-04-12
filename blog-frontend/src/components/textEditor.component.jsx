import { useEffect, useRef, useState } from 'react';
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

export default function TextEditor({ setContent, initialContent }) {
  const ejInstance = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [shouldInitialize, setShouldInitialize] = useState(true);

  // Initialize editor only once
  useEffect(() => {
    if (shouldInitialize && !ejInstance.current) {
      initEditor();
      setShouldInitialize(false);
    }

    return () => {
      if (ejInstance.current && ejInstance.current.destroy) {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, [shouldInitialize]);

  useEffect(() => {
    console.log('Initial content:', initialContent);
    if (isReady && initialContent?.blocks?.length > 0 && ejInstance.current) {
      ejInstance.current.render(initialContent).catch(console.error);
    }
  }, [isReady]);

  const initEditor = () => {
    const editor = new EditorJS({
      holder: 'editorjs',
      autofocus: true,
      data: initialContent || { blocks: [] },
      minHeight: 100,
      inlineToolbar: ['bold', 'italic', 'marker', 'link'],
      tools: {
        header: {
          class: Header,
          config: {
            placeholder: 'Enter a header',
            levels: [2, 3, 4],
            defaultLevel: 2,
          },
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
        list: {
          class: List,
          inlineToolbar: true,
        },
        embed: Embed,
        code: CodeTool,
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: 'Quote author',
          },
        },
        marker: Marker,
        delimiter: Delimiter,
        table: {
          class: Table,
          inlineToolbar: true,
        },
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
        setIsReady(true);
      },
      onChange: async (api, event) => {
        if (event?.type !== 'block-added' && ejInstance.current) {
          try {
            const data = await ejInstance.current.save();
            setContent(data);
          } catch (error) {
            console.error('Error saving editor content:', error);
          }
        }
      },
      placeholder: 'Start writing your blog content...',
    });
  };

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
      return { success: 1, path: data.url };
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
