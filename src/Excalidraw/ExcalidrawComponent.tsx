import React, { useRef, useState } from 'react';
import { Excalidraw, exportToCanvas } from '@excalidraw/excalidraw';
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
            <div className="tiptap-excalidraw-container">
              <Excalidraw initialData={initialData} onChange={handleExcalidrawChange} excalidrawAPI={(api) => (excalidrawAPIRef.current = api)} />
            </div>
          </div>
        </Modal>
      ) : (
        <div className="tiptap-excalidraw-static">
          <button className="tiptap-excalidraw-edit-btn" onClick={() => setIsEditing(true)}>
            <img src={iconEditBase64} alt="Edit" />
          </button>
          <div className="tiptap-excalidraw-thumbnail-wrapper">
            <img src={thumbnail} alt="Thumbnail" className="tiptap-excalidraw-thumbnail" />
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
};

const iconEditBase64 =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8cGF0aCBkPSJNMy42IDIwLjRoMTYuOCIgc3Ryb2tlPSIjNTI1QzZGIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+CiAgICA8cGF0aCBkPSJNNS40NjcgMTMuMjd2My4zOTdIOC44bDkuNjUyLTkuNjU2LTMuNDA5LTMuNDEtOS42NTcgOS42Njh6IiBzdHJva2U9IiM1MjVDNkYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+Cjwvc3ZnPg==';

export default React.memo(ExcalidrawComponent);
