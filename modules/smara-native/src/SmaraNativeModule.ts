import { NativeModule, requireNativeModule } from 'expo';

import { SmaraNativeModuleEvents } from './SmaraNative.types';

declare class SmaraNativeModule extends NativeModule<SmaraNativeModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<SmaraNativeModule>('SmaraNative');
