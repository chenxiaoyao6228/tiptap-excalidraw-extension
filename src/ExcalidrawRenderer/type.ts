// Define the attributes for the Excalidraw node
export interface IExcalidrawNodeAttrs {
  id: string | null;
  data?: {
    elements: Array<any>;
    appState: Record<string, any>;
    fileIds: string[];
    thumbnailUrl: string;
  };
  remoteDataUrl?: string;
  version?: number;
}

type FileExt = 'json' | 'png' | 'jpg' | 'webp';

export interface IExcalidrawOptions {
  // Static properties for Excalidraw UI
  excalidraw: Record<string, any>;
  // Props for extension
  extension: {
    wrapperClass: string;
    inline: boolean; // inline excalidraw data, this option might bloat your document
    uploadFn?: (file: Blob | object, ext: FileExt) => Promise<{ dataUrl: string }>; // if inline is set to false, you have to provide this function
    downloadFn?: (url: string) => Promise<any>; // function to download remote data
  };
}
