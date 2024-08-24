import React, { useRef, useEffect, useCallback } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { NodeViewWrapper } from '@tiptap/react';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';
import { getTotalVersion } from '../util';

const ExcalidrawComponent = (props: any) => {
  const { node, editor, extension, updateAttributes, getPos } = props;
  const lastLocalVersionRef = useRef(0);

  const excalidrawAPI = useRef<ExcalidrawImperativeAPI>(null);

  const initialData = node?.attrs?.data;

  const handleExcalidrawChange = (elements: any) => {
    const version = getTotalVersion(elements);
    if (version !== lastLocalVersionRef.current) {
      // update version
      lastLocalVersionRef.current = version;

      updateAttributes({
        data: {
          elements
        }
      });

      console.log(editor.getJSON());
    }
  };

  return (
    <NodeViewWrapper
      className="excalidraw-wrapper"
      style={{
        height: '300px'
      }}
    >
      <Excalidraw initialData={initialData} excalidrawAPI={(api) => (excalidrawAPI.current = api)} onChange={handleExcalidrawChange} />
    </NodeViewWrapper>
  );
};

export default React.memo(ExcalidrawComponent);
