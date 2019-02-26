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
            this.loadShaders();
            this._shader.use();
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
        Engine.prototype.loadShaders = function () {
            var vertexShaderSource = "\nattribute vec3 a_position;\nvoid main()\n{\n    gl_Position = vec4(a_position, 1.0);\n}";
            var fragmentShaderSource = "\nprecision mediump float;\nvoid main(){\n    gl_FragColor = vec4(1.0);\n}";
            this._shader = new B2DGAME.Shader("basic", vertexShaderSource, fragmentShaderSource);
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
var B2DGAME;
(function (B2DGAME) {
    /**
     * Represents a WebGL shader.
     */
    var Shader = /** @class */ (function () {
        /**
         * Creates a new shader
         * @param name
         * @param vertexSource the source of the vertex shader
         * @param fragmentSource the source of the fragment shader
         */
        function Shader(name, vertexSource, fragmentSource) {
            this._name = name;
            var vertextShader = this.loadShader(vertexSource, B2DGAME.gl.VERTEX_SHADER);
            var fragmentShader = this.loadShader(fragmentSource, B2DGAME.gl.FRAGMENT_SHADER);
            this.createProgram(vertextShader, fragmentShader);
        }
        Object.defineProperty(Shader.prototype, "name", {
            /**
            * The name of the shader
            */
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        /**
        * Use this shader
        */
        Shader.prototype.use = function () {
            B2DGAME.gl.useProgram(this._program);
        };
        Shader.prototype.loadShader = function (source, shaderType) {
            var shader = B2DGAME.gl.createShader(shaderType);
            B2DGAME.gl.shaderSource(shader, source);
            B2DGAME.gl.compileShader(shader);
            var error = B2DGAME.gl.getShaderInfoLog(shader);
            if (error !== "") {
                throw new Error("Error compiling shader: '" + this._name + "': " + error);
            }
            return shader;
        };
        Shader.prototype.createProgram = function (vertexShader, fragmentShader) {
            this._program = B2DGAME.gl.createProgram();
            B2DGAME.gl.attachShader(this._program, vertexShader);
            B2DGAME.gl.attachShader(this._program, fragmentShader);
            B2DGAME.gl.linkProgram(this._program);
            var error = B2DGAME.gl.getProgramInfoLog(this._program);
            if (error !== "") {
                throw new Error("Error compiling linking shader: '" + this._name + "': " + error);
            }
        };
        return Shader;
    }());
    B2DGAME.Shader = Shader;
})(B2DGAME || (B2DGAME = {}));
//# sourceMappingURL=main.js.map