namespace B2DGAME {

    /**
     * The main game engine class
     */
    export class Engine {
        
        private _canvas: HTMLCanvasElement;
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

            
            gl.clearColor(0, 0, 0, 1);

            this.loop();
        }

        /**
         * Resizes the canvas to fit on the screen
         */
        public resize():void {
            if (this._canvas !== undefined) {
                this._canvas.width = window.innerWidth;
                this._canvas.height = window.innerHeight;
            }
        }

        private loop(): void {
            //clear the color buffer of the screen before you present an image to the screen
            gl.clear(gl.COLOR_BUFFER_BIT);


            //want to call loop against this particular instance of the engine
            requestAnimationFrame(this.loop.bind(this));
        }
    }
}