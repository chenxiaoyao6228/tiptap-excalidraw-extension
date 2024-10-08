import React, { useRef, useState, useImperativeHandle, forwardRef, ForwardedRef } from 'react';
import { Excalidraw, exportToCanvas } from '@excalidraw/excalidraw';
import { ExcalidrawImperativeAPI, AppState } from '@excalidraw/excalidraw/types/types';
import { getTotalVersion } from './util';
import Modal from 'react-modal';
import './app.css';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import { IExcalidrawOptions } from './type';

// Define the type for the props passed to ExcalidrawApp
interface IExcalidrawAppProps {
  config: IExcalidrawOptions;
  onSave: (params: any) => void;
}

// Define the type for the parameters passed to openModal
interface IOpenModalParams {
  elements: ExcalidrawElement[];
  appState: AppState;
}

// Define the type for the methods exposed by ExcalidrawApp
export interface IExcalidrawAppHandle {
  openModal: (params: IOpenModalParams) => void;
  closeModal: () => void;
  // Also expose all methods from ExcalidrawImperativeAPI
  [key: string]: any;
}

const ExcalidrawApp = (props: IExcalidrawAppProps, ref: ForwardedRef<IExcalidrawAppHandle>) => {
  const {
    onSave,
    config: {
      extension: { uploadFn, inline }
    }
  } = props;

  // State to track whether the modal is open
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Refs to store the last version and the Excalidraw API instance
  const lastLocalVersionRef = useRef(0);
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);

  // Handle changes in the Excalidraw elements
  const handleExcalidrawChange = async (elements: ExcalidrawElement[]) => {
    const version = getTotalVersion(elements);
    if (version !== lastLocalVersionRef.current) {
      lastLocalVersionRef.current = version;
    }
  };

  // Open the modal and initialize the Excalidraw scene with elements and appState
  const openModal = (params: IOpenModalParams) => {
    const { elements = [], appState = {} } = params;
    setIsEditing(true);

    // Delay to ensure elements are rendered on the canvas
    setTimeout(() => {
      if (excalidrawAPIRef.current) {
        excalidrawAPIRef.current.updateScene({ elements, appState });
      }
    });
  };

  // Close the modal
  const closeModal = () => {
    setIsEditing(false);
  };

  // Handle saving the Excalidraw scene
  const handleSave = async () => {
    setLoading(true); // Start loading
    if (excalidrawAPIRef.current) {
      const elements = excalidrawAPIRef.current.getSceneElements();
      const appState = excalidrawAPIRef.current.getAppState();

      const canvas = await exportToCanvas({
        elements,
        appState: {
          ...appState,
          exportBackground: true
        },
        files: excalidrawAPIRef.current.getFiles()
      });

      const thumbnailUrl = canvas.toDataURL();

      const data = {
        appState: {}, // TODO: figure out what to preserve
        elements: elements,
        fileIds: [],
        thumbnailUrl
      };

      if (!inline) {
        const { dataUrl: remoteDataUrl } = await uploadFn(
          {
            type: 'excalidraw',
            data
          },
          'json'
        );
        onSave({
          data,
          remoteDataUrl
        });
      } else {
        onSave({
          data
        });
      }
    }

    setLoading(false); // Stop loading after save is complete
    closeModal();
  };

  // Expose the API methods using useImperativeHandle
  useImperativeHandle(ref, () => ({
    openModal,
    closeModal,
    ...excalidrawAPIRef.current // Proxy all methods from ExcalidrawImperativeAPI
  }));

  return (
    <>
      <Modal
        ariaHideApp={false}
        onRequestClose={closeModal}
        isOpen={isEditing}
        className="tiptap-excalidraw-modal"
        overlayClassName="tiptap-excalidraw-modal-overlay"
      >
        <div className="tiptap-excalidraw-modal-content">
          <div className="tiptap-excalidraw-modal-btn-group">
            <button className="tiptap-excalidraw-modal-btn discard" onClick={closeModal}>
              Discard
            </button>
            <button className="tiptap-excalidraw-modal-btn save" onClick={handleSave}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
          <div className="tiptap-excalidraw-container">
            <Excalidraw
              onChange={handleExcalidrawChange}
              excalidrawAPI={(api) => (excalidrawAPIRef.current = api)}
              UIOptions={{
                tools: { image: false }
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

// Use forwardRef to expose the ExcalidrawAppHandle methods to the parent component
export default forwardRef<IExcalidrawAppHandle, IExcalidrawAppProps>(ExcalidrawApp);
