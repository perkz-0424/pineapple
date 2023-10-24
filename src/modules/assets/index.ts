import * as assetsConfig from './config';

const assets = {
   ...assetsConfig
}
export type AssetsType = keyof typeof assets;

export default assets;