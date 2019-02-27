namespace B2DGAME {

    class TextureReferenceNode {

        public texture;
        public referenceCount: number = 1;

        public constructor(texture: Texture) {
            this.texture = texture;
        }
    }


    export class TextureManager {

        private static _texture: { [name: string]: TextureReferenceNode } = {};

        private contructor() {

        }

        public static getTexture(textureName: string): Texture {
            if (TextureManager._texture[textureName] === undefined) {
                let texture = new Texture(textureName);
                TextureManager._texture[textureName] = new TextureReferenceNode(texture);
            } else {
                TextureManager._texture[textureName].referenceCount++;
            }

            return TextureManager._texture[textureName].texture;
        }

        public static releaseTexture(textureName: string): void {
            if (TextureManager._texture[textureName] === undefined) {
                console.warn(`A texture named $(textureName) does not exist and therefore cannot be released`);
            } else {
                TextureManager._texture[textureName].referenceCount--;
                if (TextureManager._texture[textureName].referenceCount < 1) {
                    TextureManager._texture[textureName].texture.destroy();
                    TextureManager._texture[textureName] = undefined;
                    delete TextureManager._texture[textureName];
                }
            }
        }
    }
}