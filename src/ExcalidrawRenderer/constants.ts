import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';

export const PRECEDING_ELEMENT_KEY = '__precedingElement__';

export type ReconciledElements = readonly ExcalidrawElement[] & {
  _brand: 'reconciledElements';
};

export type BroadcastedExcalidrawElement = ExcalidrawElement & {
  [PRECEDING_ELEMENT_KEY]?: string;
};

export enum WS_SCENE_EVENT_TYPES {
  INIT = 'SCENE_INIT',
  UPDATE = 'SCENE_UPDATE'
}

export const arrayToMapWithIndex = <T extends { id: string }>(elements: readonly T[]) =>
  elements.reduce((acc, element: T, idx) => {
    acc.set(element.id, [element, idx]);
    return acc;
  }, new Map<string, [element: T, index: number]>());
