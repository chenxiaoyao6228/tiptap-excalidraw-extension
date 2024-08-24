import React, { useRef, useState } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { NodeViewWrapper } from '@tiptap/react';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';
import { getTotalVersion } from '../util';
import Modal from 'react-modal';
import './index.css';

const ExcalidrawComponent = (props: any) => {
  const { node, updateAttributes } = props;
  const [isEditing, setIsEditing] = useState(true);
  const [thumbnail, setThumbnail] = useState(node.attrs.thumbnail || '');
  const lastLocalVersionRef = useRef(0);

  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI>(null);

  const initialData = node?.attrs?.data;

  const handleExcalidrawChange = async (elements: any) => {
    const version = getTotalVersion(elements);
    if (version !== lastLocalVersionRef.current) {
      // update version
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
      console.log('excalidrawAPIRef.current', excalidrawAPIRef.current);

      const sceneData = excalidrawAPIRef.current.getSceneElements();
      const appState = excalidrawAPIRef.current.getAppState();

      // TODO: excalidraw does not export this function yet
      const canvas = await excalidrawAPIRef.current.exportToCanvas({
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
    <NodeViewWrapper>
      {isEditing ? (
        // http://reactcommunity.org/react-modal/
        <Modal ariaHideApp={false} onClose={closeModal} isOpen={true} className="tiptap-excalidraw-modal" overlayClassName="tiptap-excalidraw-modal-overlay">
          <div className="tiptap-excalidraw-modal-content">
            <div className="tiptap-excalidraw-modal-btn-group">
              <div>
                <button className="tiptap-excalidraw-modal-btn discard" onClick={closeModal}>
                  Discard
                </button>
                <button className="tiptap-excalidraw-modal-btn" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
            <Excalidraw initialData={initialData} onChange={handleExcalidrawChange} excalidrawAPI={(api) => (excalidrawAPIRef.current = api)} />
          </div>
        </Modal>
      ) : (
        <div>
          <img src={thumbnail} alt="Thumbnail" className="tiptap-excalidraw-thumbnail" />
          <button onClick={() => setIsEditing(true)}>Edit</button>
        </div>
      )}
    </NodeViewWrapper>
  );
};

export default React.memo(ExcalidrawComponent);
