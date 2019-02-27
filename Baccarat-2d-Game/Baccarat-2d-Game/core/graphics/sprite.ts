namespace B2DGAME {

    /**
    * Represents a 2- Dimensional sprite which is drawn on the screen
    */
    export class Sprite {

        private _width: number;
        private _height: number;
        private _name: string;

        private _buffer: GLBuffer;
        private _textureName: string;
        private _texture: Texture;


        /**
        * The position of this sprite
        */
        public position: Vector3 = new Vector3();

        /**
         *  Creates a new sprite
         * @param name The name of this sprite
         * @param textureName The name of the texture to be used.
         * @param width The width of this sprite
         * @param height The height of this sprite
         */
        public constructor(name: string, textureName: string, width:number = 100, height:number = 100) {
            this._name = name;
            this._width = width;
            this._height = height;
            this._textureName = textureName;
            this._texture = TextureManager.getTexture(this._textureName);
        }

        public get name(): string {
            return this._name;
        }

        public destroy():void {
            this._buffer.destroy();
            TextureManager.releaseTexture(this._textureName);
        }

        /**
        * Performs loading routines on this sprite
        */
        public load():void {
            this._buffer = new GLBuffer(3);

            let positionAttribute = new AttributeInfo();
            positionAttribute.location = 0;
            positionAttribute.offset = 0;
            positionAttribute.size = 3;
            this._buffer.addAttributeLocation(positionAttribute);

            let vertices = [
                //x y z
                0, 0, 0,
                0, this._height, 0,
                this._width, this._height, 0,

                this._width, this._height, 0,
                this._width, 0.0, 0,
                0, 0, 0
            ]

            this._buffer.pushBackData(vertices);
            this._buffer.upload();
            this._buffer.unbind();
        }

        public update(time:number): void {
            
        }

        public draw(): void {

            this._texture.activateAndBind();


            this._buffer.bind();
            this._buffer.draw();
        }
    }
}