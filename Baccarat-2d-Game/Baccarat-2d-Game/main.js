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
            this._projection = B2DGAME.Matrix4x4.orthographic(0, this._canvas.width, 0, this._canvas.height, -1.0, 100.0);
            //Load
            this._sprite = new B2DGAME.Sprite("test");
            this._sprite.load();
            this.resize();
            this.loop();
        };
        /**
         * Resizes the canvas to fit on the screen
         */
        Engine.prototype.resize = function () {
            if (this._canvas !== undefined) {
                this._canvas.width = window.innerWidth;
                this._canvas.height = window.innerHeight;
                B2DGAME.gl.viewport(-1, 1, 1, -1);
            }
        };
        Engine.prototype.loop = function () {
            B2DGAME.gl.clear(B2DGAME.gl.COLOR_BUFFER_BIT);
            //Set uniform
            var colorPosition = this._shader.getUniformLocation("u_color");
            B2DGAME.gl.uniform4f(colorPosition, 1, 0.5, 0, 1);
            var projectLocation = this._shader.getUniformLocation("u_projection");
            B2DGAME.gl.uniformMatrix4fv(projectLocation, false, new Float32Array(this._projection.data));
            //draw
            this._sprite.draw();
            requestAnimationFrame(this.loop.bind(this));
        };
        Engine.prototype.loadShaders = function () {
            var vertexShaderSource = "\nattribute vec3 a_position;\n\nuniform mat4 u_projection;\n\nvoid main()\n{\n    gl_Position = u_projection * vec4(a_position, 1.0);\n}";
            var fragmentShaderSource = "\nprecision mediump float;\n\nuniform vec4 u_color;\n\nvoid main(){\n    gl_FragColor = u_color;\n}";
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
     * Represents the information needed for a GLBuffer attribute.
     */
    var AttributeInfo = /** @class */ (function () {
        function AttributeInfo() {
        }
        return AttributeInfo;
    }());
    B2DGAME.AttributeInfo = AttributeInfo;
    /**
    * Represents the WebGL Buffer
     */
    var GLBuffer = /** @class */ (function () {
        /**
         * Creates a new GL Buffer
         * @param elementSize The size of the element in this buffer.
         * @param dataType The data type  of this buffer. Default: gl.Float
         * @param targetBufferType The Buffer target type. Can be either gl.ARRAY_BUFFER or gl.ELEMENT_ARRAY_BUFFER. Default: gl.ARRAY_BUFFER
         * @param mode The drawing mode of this buffer. (i.e gl.TRIANGLES or gl.LINES). Default: gl.TRIANGLES
         */
        function GLBuffer(elementSize, dataType, targetBufferType, mode) {
            if (dataType === void 0) { dataType = B2DGAME.gl.FLOAT; }
            if (targetBufferType === void 0) { targetBufferType = B2DGAME.gl.ARRAY_BUFFER; }
            if (mode === void 0) { mode = B2DGAME.gl.TRIANGLES; }
            this._hasAttributeLocation = false;
            this._data = [];
            this._attributes = [];
            this._elementSize = elementSize;
            this._dataType = dataType;
            this._targetBufferType = targetBufferType;
            this._mode = mode;
            //Determine byte size
            switch (this._dataType) {
                case B2DGAME.gl.FLOAT:
                case B2DGAME.gl.INT:
                case B2DGAME.gl.UNSIGNED_INT:
                    this._typeSize = 4;
                    break;
                case B2DGAME.gl.SHORT:
                case B2DGAME.gl.UNSIGNED_SHORT:
                    this._typeSize = 2;
                    break;
                case B2DGAME.gl.BYTE:
                case B2DGAME.gl.UNSIGNED_BYTE:
                    this._typeSize = 1;
                    break;
                default:
                    throw new Error("Unrecognized data type: " + dataType.toString());
            }
            this._stride = this._elementSize * this._typeSize;
            this._buffer = B2DGAME.gl.createBuffer();
        }
        /**
        * Destroys this buffer
        */
        GLBuffer.prototype.destroy = function () {
            B2DGAME.gl.deleteBuffer(this._buffer);
        };
        /**
         * Binds this buffer
         * @param normalized Indicate if the data should be normalized. Default: false
         */
        GLBuffer.prototype.bind = function (normalized) {
            if (normalized === void 0) { normalized = false; }
            B2DGAME.gl.bindBuffer(this._targetBufferType, this._buffer);
            if (this._hasAttributeLocation) {
                for (var _i = 0, _a = this._attributes; _i < _a.length; _i++) {
                    var it = _a[_i];
                    B2DGAME.gl.vertexAttribPointer(it.location, it.size, this._dataType, normalized, this._stride, it.offset * this._typeSize);
                    B2DGAME.gl.enableVertexAttribArray(it.location);
                }
            }
        };
        /**
        * Unbinds this buffer
        */
        GLBuffer.prototype.unbind = function () {
            for (var _i = 0, _a = this._attributes; _i < _a.length; _i++) {
                var it = _a[_i];
                B2DGAME.gl.disableVertexAttribArray(it.location);
            }
            B2DGAME.gl.bindBuffer(B2DGAME.gl.ARRAY_BUFFER, this._buffer);
        };
        /**
         * Adds an attribute with the provided information to this buffer
         * @param info Information to be added.
         */
        GLBuffer.prototype.addAttributeLocation = function (info) {
            this._hasAttributeLocation = true;
            this._attributes.push(info);
        };
        /**
         * Add data to this buffer
         * @param data
         */
        GLBuffer.prototype.pushBackData = function (data) {
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var d = data_1[_i];
                this._data.push(d);
            }
        };
        /**
        * Uploads this buffer data to the GPU
        */
        GLBuffer.prototype.upload = function () {
            B2DGAME.gl.bindBuffer(this._targetBufferType, this._buffer);
            var bufferData;
            switch (this._dataType) {
                case B2DGAME.gl.FLOAT:
                    bufferData = new Float32Array(this._data);
                    break;
                case B2DGAME.gl.INT:
                    bufferData = new Int32Array(this._data);
                    break;
                case B2DGAME.gl.UNSIGNED_INT:
                    bufferData = new Uint32Array(this._data);
                    break;
                case B2DGAME.gl.SHORT:
                    bufferData = new Int16Array(this._data);
                    break;
                case B2DGAME.gl.UNSIGNED_SHORT:
                    bufferData = new Uint16Array(this._data);
                    break;
                case B2DGAME.gl.BYTE:
                    bufferData = new Int8Array(this._data);
                    break;
                case B2DGAME.gl.UNSIGNED_BYTE:
                    bufferData = new Uint8Array(this._data);
                    break;
            }
            B2DGAME.gl.bufferData(this._targetBufferType, bufferData, B2DGAME.gl.STATIC_DRAW);
        };
        /**
        * Draw this buffer
        */
        GLBuffer.prototype.draw = function () {
            if (this._targetBufferType === B2DGAME.gl.ARRAY_BUFFER) {
                B2DGAME.gl.drawArrays(this._mode, 0, this._data.length / this._elementSize);
            }
            else if (this._targetBufferType === B2DGAME.gl.ELEMENT_ARRAY_BUFFER) {
                B2DGAME.gl.drawElements(this._mode, this._data.length, this._dataType, 0);
            }
        };
        return GLBuffer;
    }());
    B2DGAME.GLBuffer = GLBuffer;
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
            this._attributes = {}; //collection of keys
            this._uniforms = {};
            this._name = name;
            var vertextShader = this.loadShader(vertexSource, B2DGAME.gl.VERTEX_SHADER);
            var fragmentShader = this.loadShader(fragmentSource, B2DGAME.gl.FRAGMENT_SHADER);
            this.createProgram(vertextShader, fragmentShader);
            this.detectAttribute();
            this.detectUniforms();
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
        /**
         * Get the location of an attribute with the provided name.
         * @param name The name of the attribute whose location to retrieve.
         */
        Shader.prototype.getAttributeLocation = function (name) {
            if (this._attributes[name] === undefined) {
                throw new Error("Unable to find attribute'" + name + "' in shader '" + this._name + "'");
            }
            return this._attributes[name];
        };
        /**
         * Get the location of an uniform with the provided name.
         * @param name The name of the uniform whose location to retrieve.
         */
        Shader.prototype.getUniformLocation = function (name) {
            if (this._uniforms[name] === undefined) {
                throw new Error("Unable to find uniform'" + name + "' in shader '" + this._name + "'");
            }
            return this._uniforms[name];
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
        Shader.prototype.detectAttribute = function () {
            var attributeCount = B2DGAME.gl.getProgramParameter(this._program, B2DGAME.gl.ACTIVE_ATTRIBUTES);
            for (var i = 0; i < attributeCount; i++) {
                var info = B2DGAME.gl.getActiveAttrib(this._program, i);
                if (!info) {
                    break;
                }
                this._attributes[info.name] = B2DGAME.gl.getAttribLocation(this._program, info.name);
            }
        };
        Shader.prototype.detectUniforms = function () {
            var uniformCount = B2DGAME.gl.getProgramParameter(this._program, B2DGAME.gl.ACTIVE_UNIFORMS);
            for (var i = 0; i < uniformCount; i++) {
                var info = B2DGAME.gl.getActiveUniform(this._program, i);
                if (!info) {
                    break;
                }
                this._uniforms[info.name] = B2DGAME.gl.getUniformLocation(this._program, info.name);
            }
        };
        return Shader;
    }());
    B2DGAME.Shader = Shader;
})(B2DGAME || (B2DGAME = {}));
var B2DGAME;
(function (B2DGAME) {
    var Sprite = /** @class */ (function () {
        function Sprite(name, width, height) {
            if (width === void 0) { width = 100; }
            if (height === void 0) { height = 100; }
            this._name = name;
            this._width = width;
            this._height = height;
        }
        Sprite.prototype.load = function () {
            this._buffer = new B2DGAME.GLBuffer(3);
            var positionAttribute = new B2DGAME.AttributeInfo();
            positionAttribute.location = 0;
            positionAttribute.offset = 0;
            positionAttribute.size = 3;
            this._buffer.addAttributeLocation(positionAttribute);
            var vertices = [
                //x y z
                0, 0, 0,
                0, this._height, 0,
                this._width, this._height, 0,
                this._width, this._height, 0,
                this._width, 0.0, 0,
                0, 0, 0
            ];
            this._buffer.pushBackData(vertices);
            this._buffer.upload();
            this._buffer.unbind();
        };
        Sprite.prototype.update = function (time) {
        };
        Sprite.prototype.draw = function () {
            this._buffer.bind();
            this._buffer.draw();
        };
        return Sprite;
    }());
    B2DGAME.Sprite = Sprite;
})(B2DGAME || (B2DGAME = {}));
var B2DGAME;
(function (B2DGAME) {
    var Matrix4x4 = /** @class */ (function () {
        function Matrix4x4() {
            this._data = [];
            //Identity Matrix (Default Matrix)
            this._data = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ];
        }
        Object.defineProperty(Matrix4x4.prototype, "data", {
            get: function () {
                return this._data;
            },
            enumerable: true,
            configurable: true
        });
        Matrix4x4.identity = function () {
            return new Matrix4x4();
        };
        Matrix4x4.orthographic = function (left, right, bottom, top, nearclip, farclip) {
            var m = new Matrix4x4();
            var lr = 1.0 / (left - right);
            var bt = 1.0 / (bottom - top);
            var nf = 1.0 / (nearclip - farclip);
            m._data[0] = -2.0 * lr;
            m._data[5] = -2.0 * bt;
            m._data[10] = 2.0 * nf;
            m._data[12] = (left + top) * lr;
            m._data[13] = (top + bottom) * bt;
            m._data[14] = (farclip + nearclip) * nf;
            return m;
        };
        return Matrix4x4;
    }());
    B2DGAME.Matrix4x4 = Matrix4x4;
})(B2DGAME || (B2DGAME = {}));
//# sourceMappingURL=main.js.map