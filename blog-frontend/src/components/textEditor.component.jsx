import { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Embed from '@editorjs/embed';
import Paragraph from '@editorjs/paragraph';
import ImageTool from '@editorjs/image';
import CodeTool from '@editorjs/code';

export default function TextEditor({ setContent }) {
  const ejInstance = useRef(null);

  useEffect(() => {
    if (!ejInstance.current) {
      const editor = new EditorJS({
        holder: 'editorjs',
        autofocus: true,
        tools: {
          header: Header,
          paragraph: Paragraph,
          list: List,
          embed: Embed,
          code: CodeTool,
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile(file) {
                  return new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = () => {
                      resolve({
                        success: 1,
                        file: {
                          url: reader.result,
                        },
                      });
                    };
                    reader.readAsDataURL(file);
                  });
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

  return (
    <div
      id="editorjs"
      className="border rounded-md min-h-[400px] bg-white p-4"
    />
  );
}
