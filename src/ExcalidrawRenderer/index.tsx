import React, { createRef } from 'react';
import ExcalidrawApp from './App';
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom';
import { EventEmitter } from './eventEmitter';

interface IEvent {
  save: {
    id: string;
    imageUrl: string;
    elements: any;
    appState: any;
  };
}

class ExcalidrawRenderer {
  root: any;
  modalRoot: HTMLElement;
  excalidrawAppRef: any;
  currentNodeId?: string; // The ID of the currently edited NodeView
  emitter = new EventEmitter<IEvent>();

  constructor(config: any) {
    this.excalidrawAppRef = createRef();
    this.mountElements(config);
  }

  mountElements(config: any) {
    const modalRoot = document.createElement('div');
    document.body.appendChild(modalRoot);
    this.modalRoot = modalRoot;

    // Check if React 18's createRoot is available
    if (typeof createRoot === 'function') {
      this.root = createRoot(modalRoot);
      this.root.render(<ExcalidrawApp ref={this.excalidrawAppRef} {...config} onSave={(thumbnailUrl) => this.handleSaveEvent(thumbnailUrl)} />);
    } else {
      this.root = {
        unmount: () => ReactDOM.unmountComponentAtNode(modalRoot)
      };
      ReactDOM.render(<ExcalidrawApp ref={this.excalidrawAppRef} {...config} onSave={(thumbnailUrl) => this.handleSaveEvent(thumbnailUrl)} />, modalRoot);
    }
  }

  handleSaveEvent({ elements, appState, imageUrl }) {
    this.emitter.emit('save', {
      id: this.currentNodeId,
      elements,
      appState,
      imageUrl
    });
  }

  openModal({ id, elements, appState }) {
    this.currentNodeId = id; // Record the ID of the currently edited NodeView
    if (this.excalidrawAppRef.current) {
      this.excalidrawAppRef.current.openModal({ elements, appState });
    }
  }

  closeModal() {
    if (this.excalidrawAppRef.current) {
      this.excalidrawAppRef.current.closeModal();
    }
  }

  // Proxy other methods on excalidrawAPIRef.current
  executeExcalidrawAPI(methodName, ...args) {
    if (this.excalidrawAppRef.current && typeof this.excalidrawAppRef.current[methodName] === 'function') {
      return this.excalidrawAppRef.current[methodName](...args);
    } else {
      console.warn(`Method ${methodName} is not available on ExcalidrawAPI`);
    }
  }

  unmountElement() {
    if (this.root) {
      this.root.unmount();
    }
    if (this.modalRoot) {
      document.body.removeChild(this.modalRoot);
    }
  }
}

export default ExcalidrawRenderer;
