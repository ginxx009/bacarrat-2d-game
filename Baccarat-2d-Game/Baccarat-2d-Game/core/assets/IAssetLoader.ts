namespace B2DGAME {

    export interface IAssetLoader {

        readonly supportedExtenstions: string[];

        loadAsset(assetName: string): void;
    }
}