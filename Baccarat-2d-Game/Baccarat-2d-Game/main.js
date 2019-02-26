var engine;
//The main entry point of the application
window.onload = function () {
    engine = new B2DGAME.Engine();
    engine.start();
};
window.onresize = function () {
    engine.resize();
};
var B2DGAME;
(function (B2DGAME) {
    /**
     * The main game engine class
     */
    var Engine = /** @class */ (function () {
        /**
         * Creates a new engine
         */
        function Engine() {
        }
        /**
         * Starts up this engine
         */
        Engine.prototype.start = function () {
            this._canvas = B2DGAME.GLUtilities.initialize();
            B2DGAME.gl.clearColor(0, 0, 0, 1);
            this.loop();
        };
        /**
         * Resizes the canvas to fit on the screen
         */
        Engine.prototype.resize = function () {
            if (this._canvas !== undefined) {
                this._canvas.width = window.innerWidth;
                this._canvas.height = window.innerHeight;
            }
        };
        Engine.prototype.loop = function () {
            //clear the color buffer of the screen before you present an image to the screen
            B2DGAME.gl.clear(B2DGAME.gl.COLOR_BUFFER_BIT);
            //want to call loop against this particular instance of the engine
            requestAnimationFrame(this.loop.bind(this));
        };
        return Engine;
    }());
    B2DGAME.Engine = Engine;
})(B2DGAME || (B2DGAME = {}));
var B2DGAME;
(function (B2DGAME) {
    /**
     * Responsible for setting up a WebGL rendering context
     */
    var GLUtilities = /** @class */ (function () {
        function GLUtilities() {
        }
        /**
         * Initializes WebGL, potentially using the canvas with an assign ID matching the provided if it is defined.
         * @param elementId the id of the element to search for
         */
        GLUtilities.initialize = function (elementId) {
            var canvas;
            if (elementId !== undefined) {
                canvas = document.getElementById(elementId);
                if (canvas === undefined) {
                    throw new Error("Cannot find a canvas element named: " + elementId);
                }
            }
            else {
                canvas = document.createElement("canvas");
                document.body.appendChild(canvas);
            }
            B2DGAME.gl = canvas.getContext("webgl");
            if (B2DGAME.gl === undefined) {
                throw new Error("Unable to initialize WebGL!");
            }
            return canvas;
        };
        return GLUtilities;
    }());
    B2DGAME.GLUtilities = GLUtilities;
})(B2DGAME || (B2DGAME = {}));
//# sourceMappingURL=main.js.map