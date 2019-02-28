namespace B2DGAME {

    /**
     * The main game engine class
     */
    export class Engine {
        
        private _canvas: HTMLCanvasElement;
        private _basicshader: BasicShader;
        private _projection: Matrix4x4;

        private _sprite: Sprite;

        /**
         * Creates a new engine
         */
        public constructor() {
        }

        /**
         * Starts up this engine
         */
        public start(): void {

            this._canvas = GLUtilities.initialize();
            AssetManager.initialize();
            
            gl.clearColor(0, 0, 0, 1);

            this._basicshader = new BasicShader();
            this._basicshader.use();

            this._projection = Matrix4x4.orthographic(0,this._canvas.width,this._canvas.height,0,-100.0,100.0);

            //Load Material
            MaterialManager.registerMaterial(new Material("crate", "assets/textures/sample.jpg", new Color(255, 128, 0, 255)));

            //Load
            this._sprite = new Sprite("test","crate");
            this._sprite.load();
            this._sprite.position.x = 200;
            this._sprite.position.y = 100;


            this.resize();
            this.loop();
        }

        /**
         * Resizes the canvas to fit on the screen
         */
        public resize():void {
            if (this._canvas !== undefined) {
                this._canvas.width = window.innerWidth;
                this._canvas.height = window.innerHeight;

                //gl.viewport(0, 0, this._canvas.width, this._canvas.height);

                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                this._projection = Matrix4x4.orthographic(0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);

            }
        }

        private loop(): void {

            MessageBus.update(0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            //Set uniform
            let projectLocation = this._basicshader.getUniformLocation("u_projection");
            gl.uniformMatrix4fv(projectLocation,false,new Float32Array(this._projection.data));
            
            //draw
            this._sprite.draw(this._basicshader);

            requestAnimationFrame(this.loop.bind(this));
        }
        
    }
}