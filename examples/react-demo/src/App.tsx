import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { ExcalidrawExtension } from 'tiptap-excalidraw-extension';

const DOC_LOCAL_STORATE_KEY = 'tiptapDocDataUrl';

const uploadFn = async (file: Blob | object, ext: 'png' | 'jpg' | 'webp' | 'json') => {
  const formData = new FormData();

  if (ext === 'json') {
    // 将 JSON 对象转换为 Blob，并添加到 FormData
    const jsonBlob = new Blob([JSON.stringify(file)], { type: 'application/json' });
    formData.append('file', jsonBlob, `data.${ext}`);
  } else if (['png', 'jpg', 'webp'].includes(ext)) {
    formData.append('file', file as Blob, `image.${ext}`);
  } else {
    throw new Error('Unsupported file type');
  }

  try {
    const response = await axios.post(`http://localhost:3000/upload?ext=${ext}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return { dataUrl: response.data.url };
  } catch (error) {
    console.error('File upload failed:', error);
    throw new Error('File upload failed');
  }
};

const downloadFn = async (url: string) => {
  try {
    const response = await axios.get(url, { responseType: 'blob' });
    const ext = url.split('.').pop();

    if (ext === 'json') {
      const text = await response.data.text();
      return JSON.parse(text);
    } else if (['png', 'jpg', 'webp'].includes(ext)) {
      return URL.createObjectURL(response.data); // 返回 Blob 对象 URL 以便在前端显示图片
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('File download failed:', error);
    throw new Error('File download failed');
  }
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const editor = useEditor({
    extensions: [
      ExcalidrawExtension.configure({
        extension: {
          // wrapperClass: 'my-excalidraw-static',
          inline: true,
          uploadFn,
          downloadFn
        },
        excalidraw: {}
      }),
      StarterKit
    ],
    autofocus: true
  });

  // @ts-ignore
  window._editor = editor;

  // 保存文档，并将 dataUrl 存储到 LocalStorage
  const saveDocument = useCallback(async () => {
    if (editor) {
      const jsonContent = editor.getJSON();
      try {
        setLoading(true);
        // 使用 uploadFn 上传 JSON 文件
        const result = await uploadFn(jsonContent, 'json');
        const dataUrl = result.dataUrl;
        console.log('Document saved with file ID:', dataUrl);
        // 存储 dataUrl 到 LocalStorage
        localStorage.setItem(DOC_LOCAL_STORATE_KEY, dataUrl);
      } catch (error) {
        console.error('Failed to save document:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [editor]);

  // 从服务器获取文档内容并加载到编辑器中
  const loadDocument = useCallback(
    async (dataUrl: string) => {
      try {
        // 使用 downloadFn 下载并解析 JSON 文件
        const jsonContent = await downloadFn(dataUrl);
        editor?.commands.setContent(jsonContent);
      } catch (error) {
        console.error('Failed to load document:', error);
      }
    },
    [editor]
  );

  // 页面加载时从 LocalStorage 获取 dataUrl 并加载文档
  useEffect(() => {
    const storedDataUrl = localStorage.getItem(DOC_LOCAL_STORATE_KEY);
    if (storedDataUrl) {
      loadDocument(storedDataUrl);
    }
  }, [loadDocument]);

  const insertExcalidraw = useCallback(() => {
    if (editor) {
      editor.chain().focus().addExcalidraw().run();
    }
  }, [editor]);

  return (
    <div className="container w-[80vw] h-screen mx-auto flex flex-col">
      <h1 className="text-3xl text-center py-2">Tiptap Excalidraw Extension Demo</h1>
      <div className=" absolute top-0 left-0">
        <button className="block mb-1 border-2" onClick={insertExcalidraw}>
          Insert Excalidraw
        </button>
        <button className="border-2 " onClick={saveDocument}>
          {loading ? 'Saving Document...' : 'Save Document'}
        </button>
      </div>
      <EditorContent className="rounded-lg flex-1 p-4 border border-rose-100" editor={editor} />
    </div>
  );
}
