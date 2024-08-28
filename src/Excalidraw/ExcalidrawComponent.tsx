import { createRoot } from 'react-dom/client';
import React, { useRef, useState } from 'react';
import { Excalidraw, exportToCanvas } from '@excalidraw/excalidraw';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';
import { getTotalVersion } from './util';
import Modal from 'react-modal';
import './index.css';

const ExcalidrawComponent = (props: any) => {
  const { node, updateAttributes } = props;
  console.log('props', props);

  const [isEditing, setIsEditing] = useState(true);

  const [thumbnail, setThumbnail] = useState(node.attrs.thumbnail || '');
  const lastLocalVersionRef = useRef(0);

  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI>(null);

  const initialData = node?.attrs?.data;

  const handleExcalidrawChange = async (elements: any) => {
    const version = getTotalVersion(elements);
    if (version !== lastLocalVersionRef.current) {
      lastLocalVersionRef.current = version;
      updateAttributes({
        data: {
          elements
        }
      });
    }
  };

  const closeModal = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (excalidrawAPIRef.current) {
      const sceneData = excalidrawAPIRef.current.getSceneElements();
      const appState = excalidrawAPIRef.current.getAppState();

      const canvas = await exportToCanvas({
        elements: sceneData,
        appState: {
          ...appState,
          exportBackground: true
        },
        files: excalidrawAPIRef.current.getFiles()
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const thumbnailUrl = URL.createObjectURL(blob);
          setThumbnail(thumbnailUrl);
        }
      });
    }

    setIsEditing(false);
  };

  return (
    <Modal ariaHideApp={false} onClose={closeModal} isOpen={true} className="tiptap-excalidraw-modal" overlayClassName="tiptap-excalidraw-modal-overlay">
      <div className="tiptap-excalidraw-modal-content">
        <div className="tiptap-excalidraw-modal-btn-group">
          <button className="tiptap-excalidraw-modal-btn discard" onClick={closeModal}>
            Discard
          </button>
          <button className="tiptap-excalidraw-modal-btn" onClick={handleSave}>
            Save
          </button>
        </div>
        <div className="tiptap-excalidraw-container">
          <Excalidraw
            initialData={initialData}
            onChange={handleExcalidrawChange}
            excalidrawAPI={(api) => (excalidrawAPIRef.current = api)}
            UIOptions={{
              tools: { image: false }
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

interface IExcalidrawOptions {
  // extension: {
  //   inlineImage?: boolean;
  //   uploader?: (file: File) => Promise<string>;
  // };
  // excalidraw: {
  //   initialData?: any;
  // };
}

class ExcalidrawRenderer {
  constructor(config: any) {
    this.initConfig(config);
    createRoot(config.container).render(<ExcalidrawComponent {...config} />);
  }

  initConfig(config: any) {
    // Custom initialization logic if needed
  }
}

export default ExcalidrawRenderer;
