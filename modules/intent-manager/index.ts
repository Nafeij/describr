import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to IntentManager.web.ts
// and on native platforms to IntentManager.ts
import IntentManagerModule from './src/IntentManagerModule';
// import { ChangeEventPayload } from './src/IntentManager.types';

// Get the native constant value.
// export const PI = IntentManagerModule.PI;

// export function hello(): string {
//   return IntentManagerModule.hello();
// }

// export function getActivity(): string {
//   return IntentManagerModule.getActivityName();
// }

// export async function setValueAsync(value: string) {
//   return await IntentManagerModule.setValueAsync(value);
// }

// const emitter = new EventEmitter(IntentManagerModule ?? NativeModulesProxy.IntentManager);

// export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
//   return emitter.addListener<ChangeEventPayload>('onChange', listener);
// }

// export { ChangeEventPayload };

export function getIntent(): Object {
  return IntentManagerModule.getIntent();
}
