namespace B2DGAME {

    export const MESSAGE_ASSET_LOADER_ASSET_LOADED = "MESSAGE_ASSET_LOADER_ASSET_LOADED::";

    export class AssetManager {

        private static _loaders: IAssetLoader[] = [];
        private static _loadedAssets: { [name: string]: IAsset } = {};

        private constructor() {

        }

        public static initialize(): void {
            AssetManager._loaders.push(new ImageAssetLoader());
        }

        public static registerLoader(loader:IAssetLoader):void {
            AssetManager._loaders.push(loader);
        }

        public static onAssetLoaded(asset:IAsset):void {
            AssetManager._loadedAssets[asset.name] = asset;
            Message.send(MESSAGE_ASSET_LOADER_ASSET_LOADED + asset.name,this,asset);
        }

        public static loadAsset(assetName: string):void {
            let extensions = assetName.split('.').pop().toLowerCase();
            for (let l of AssetManager._loaders) {
                //it exists
                if (l.supportedExtenstions.indexOf(extensions) !== -1) {
                    l.loadAsset(assetName);
                    return;
                }
            }
            console.warn("Unable to load asset with extensions " + extensions + " because there's no loader associated with it.");
        }

        public static isAssetLoaded(assetName:string):boolean {
            return AssetManager._loadedAssets[assetName] !== undefined;
        }

        public static getAsset(assetName:string):IAsset {
            if (AssetManager._loadedAssets[assetName] !== undefined) {
                return AssetManager._loadedAssets[assetName];
            } else {
                AssetManager.loadAsset(assetName);
            }
            return undefined;
        }
    }
}