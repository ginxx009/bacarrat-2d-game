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
    B2DGAME.MESSAGE_ASSET_LOADER_ASSET_LOADED = "MESSAGE_ASSET_LOADER_ASSET_LOADED::";
    var AssetManager = /** @class */ (function () {
        function AssetManager() {
        }
        AssetManager.initialize = function () {
            AssetManager._loaders.push(new B2DGAME.ImageAssetLoader());
        };
        AssetManager.registerLoader = function (loader) {
            AssetManager._loaders.push(loader);
        };
        AssetManager.onAssetLoaded = function (asset) {
            AssetManager._loadedAssets[asset.name] = asset;
            B2DGAME.Message.send(B2DGAME.MESSAGE_ASSET_LOADER_ASSET_LOADED + asset.name, this, asset);
        };
        AssetManager.loadAsset = function (assetName) {
            var extensions = assetName.split('.').pop().toLowerCase();
            for (var _i = 0, _a = AssetManager._loaders; _i < _a.length; _i++) {
                var l = _a[_i];
                //it exists
                if (l.supportedExtenstions.indexOf(extensions) !== -1) {
                    l.loadAsset(assetName);
                    return;
                }
            }
            console.warn("Unable to load asset with extensions " + extensions + " because there's no loader associated with it.");
        };
        AssetManager.isAssetLoaded = function (assetName) {
            return AssetManager._loadedAssets[assetName] !== undefined;
        };
        AssetManager.getAsset = function (assetName) {
            if (AssetManager._loadedAssets[assetName] !== undefined) {
                return AssetManager._loadedAssets[assetName];
            }
            else {
                AssetManager.loadAsset(assetName);
            }
            return undefined;
        };
        AssetManager._loaders = [];
        AssetManager._loadedAssets = {};
        return AssetManager;
    }());
    B2DGAME.AssetManager = AssetManager;
})(B2DGAME || (B2DGAME = {}));
var B2DGAME;
(function (B2DGAME) {
    var IAsset = /** @class */ (function () {
        function IAsset() {
        }
        return IAsset;
    }());
    B2DGAME.IAsset = IAsset;
})(B2DGAME || (B2DGAME = {}));
var B2DGAME;
(function (B2DGAME) {
    var ImageAsset = /** @class */ (function () {
        function ImageAsset(name, data) {
            this.name = name;
            this.data = data;
        }
        Object.defineProperty(ImageAsset.prototype, "width", {
            get: function () {
                return this.data.width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ImageAsset.prototype, "height", {
            get: function () {
                return this.data.height;
            },
            enumerable: true,
            configurable: true
        });
        return ImageAsset;
    }());
    B2DGAME.ImageAsset = ImageAsset;
    var ImageAssetLoader = /** @class */ (function () {
        function ImageAssetLoader() {
        }
        Object.defineProperty(ImageAssetLoader.prototype, "supportedExtenstions", {
            get: function () {
                return ["png", "gif", "jpg"];
            },
            enumerable: true,
            configurable: true
        });
        ImageAssetLoader.prototype.loadAsset = function (assetName) {
            var image = new Image();
            image.onload = this.onImageLoaded.bind(this, assetName, image);
            image.src = assetName;
        };
        ImageAssetLoader.prototype.onImageLoaded = function (assetName, image) {
            console.log("onImageLoaded: assetName/image", assetName, image);
            var asset = new ImageAsset(assetName, image);
            B2DGAME.AssetManager.onAssetLoaded(asset);
        };
        return ImageAssetLoader;
    }());
    B2DGAME.ImageAssetLoader = ImageAssetLoader;
})(B2DGAME || (B2DGAME = {}));
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
            B2DGAME.AssetManager.initialize();
            B2DGAME.gl.clearColor(0, 0, 0, 1);
            this.loadShaders();
            this._shader.use();
            this._projection = B2DGAME.Matrix4x4.orthographic(0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);
            //Load
            this._sprite = new B2DGAME.Sprite("test", "assets/textures/sample.jpg");
            this._sprite.load();
            this._sprite.position.x = 200;
            this._sprite.position.y = 100;
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
                //gl.viewport(0, 0, this._canvas.width, this._canvas.height);
                B2DGAME.gl.viewport(0, 0, B2DGAME.gl.canvas.width, B2DGAME.gl.canvas.height);
                this._projection = B2DGAME.Matrix4x4.orthographic(0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);
            }
        };
        Engine.prototype.loop = function () {
            B2DGAME.MessageBus.update(0);
            B2DGAME.gl.clear(B2DGAME.gl.COLOR_BUFFER_BIT);
            //Set uniform
            var colorPosition = this._shader.getUniformLocation("u_tint");
            //gl.uniform4f(colorPosition, 1, 0.5, 0, 1);
            B2DGAME.gl.uniform4f(colorPosition, 1, 1, 1, 1);
            var projectLocation = this._shader.getUniformLocation("u_projection");
            B2DGAME.gl.uniformMatrix4fv(projectLocation, false, new Float32Array(this._projection.data));
            var modelLocation = this._shader.getUniformLocation("u_model");
            B2DGAME.gl.uniformMatrix4fv(modelLocation, false, new Float32Array(B2DGAME.Matrix4x4.translation(this._sprite.position).data));
            //draw
            this._sprite.draw(this._shader);
            requestAnimationFrame(this.loop.bind(this));
        };
        Engine.prototype.loadShaders = function () {
            var vertexShaderSource = "\nattribute vec3 a_position;\nattribute vec2 a_texCoord;\nuniform mat4 u_projection;\n\nuniform mat4 u_model;\n\nvarying vec2 v_texCoord;\n\nvoid main()\n{\n    gl_Position = u_projection * u_model * vec4(a_position, 1.0);\n    v_texCoord =  a_texCoord;\n}";
            var fragmentShaderSource = "\nprecision mediump float;\n\nuniform vec4 u_tint;\nuniform sampler2D u_diffuse;\n\nvarying vec2 v_texCoord;\n\nvoid main(){\n    gl_FragColor = u_tint * texture2D(u_diffuse, v_texCoord);\n}";
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
    /**
    * Represents a 2- Dimensional sprite which is drawn on the screen
    */
    var Sprite = /** @class */ (function () {
        /**
         *  Creates a new sprite
         * @param name The name of this sprite
         * @param textureName The name of the texture to be used.
         * @param width The width of this sprite
         * @param height The height of this sprite
         */
        function Sprite(name, textureName, width, height) {
            if (width === void 0) { width = 200; }
            if (height === void 0) { height = 200; }
            /**
            * The position of this sprite
            */
            this.position = new B2DGAME.Vector3();
            this._name = name;
            this._width = width;
            this._height = height;
            this._textureName = textureName;
            this._texture = B2DGAME.TextureManager.getTexture(this._textureName);
        }
        Object.defineProperty(Sprite.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Sprite.prototype.destroy = function () {
            this._buffer.destroy();
            B2DGAME.TextureManager.releaseTexture(this._textureName);
        };
        /**
        * Performs loading routines on this sprite
        */
        Sprite.prototype.load = function () {
            this._buffer = new B2DGAME.GLBuffer(5);
            var positionAttribute = new B2DGAME.AttributeInfo();
            positionAttribute.location = 0;
            positionAttribute.offset = 0;
            positionAttribute.size = 3;
            this._buffer.addAttributeLocation(positionAttribute);
            var texCoordAttribute = new B2DGAME.AttributeInfo();
            texCoordAttribute.location = 1;
            texCoordAttribute.offset = 3;
            texCoordAttribute.size = 2;
            this._buffer.addAttributeLocation(texCoordAttribute);
            var vertices = [
                //x y z   ,u ,v
                0, 0, 0, 0, 0,
                0, this._height, 0, 0, 1.0,
                this._width, this._height, 0, 1.0, 1.0,
                this._width, this._height, 0, 1.0, 1.0,
                this._width, 0.0, 0, 1.0, 0,
                0, 0, 0, 0, 0
            ];
            this._buffer.pushBackData(vertices);
            this._buffer.upload();
            this._buffer.unbind();
        };
        Sprite.prototype.update = function (time) {
        };
        Sprite.prototype.draw = function (shader) {
            this._texture.activateAndBind(0);
            var diffuseLocation = shader.getUniformLocation("u_diffuse");
            B2DGAME.gl.uniform1i(diffuseLocation, 0);
            this._buffer.bind();
            this._buffer.draw();
        };
        return Sprite;
    }());
    B2DGAME.Sprite = Sprite;
})(B2DGAME || (B2DGAME = {}));
var B2DGAME;
(function (B2DGAME) {
    var LEVEL = 0;
    var BORDER = 0;
    var TEMP_IMAGE_DATA = new Uint8Array([255, 255, 255, 255]);
    var Texture = /** @class */ (function () {
        function Texture(name, width, height) {
            if (width === void 0) { width = 1; }
            if (height === void 0) { height = 1; }
            this._isLoaded = false;
            this._name = name;
            this._width = width;
            this._height = height;
            this._handle = B2DGAME.gl.createTexture();
            B2DGAME.Message.subscribe(B2DGAME.MESSAGE_ASSET_LOADER_ASSET_LOADED + this._name, this);
            this.bind();
            B2DGAME.gl.texImage2D(B2DGAME.gl.TEXTURE_2D, LEVEL, B2DGAME.gl.RGBA, 1, 1, BORDER, B2DGAME.gl.RGBA, B2DGAME.gl.UNSIGNED_BYTE, TEMP_IMAGE_DATA);
            var asset = B2DGAME.AssetManager.getAsset(this.name);
            if (asset !== undefined) {
                this.loadTextureFromAsset(asset);
            }
        }
        Object.defineProperty(Texture.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Texture.prototype, "isLoaded", {
            get: function () {
                return this._isLoaded;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Texture.prototype, "width", {
            get: function () {
                return this._width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Texture.prototype, "height", {
            get: function () {
                return this._height;
            },
            enumerable: true,
            configurable: true
        });
        Texture.prototype.destroy = function () {
            B2DGAME.gl.deleteTexture(this._handle);
        };
        Texture.prototype.activateAndBind = function (textureUnit) {
            if (textureUnit === void 0) { textureUnit = 0; }
            B2DGAME.gl.activeTexture(B2DGAME.gl.TEXTURE0 + textureUnit);
            this.bind();
        };
        Texture.prototype.bind = function () {
            B2DGAME.gl.bindTexture(B2DGAME.gl.TEXTURE_2D, this._handle);
        };
        Texture.prototype.unbind = function () {
            B2DGAME.gl.bindTexture(B2DGAME.gl.TEXTURE_2D, undefined);
        };
        Texture.prototype.onMessage = function (message) {
            if (message.code === B2DGAME.MESSAGE_ASSET_LOADER_ASSET_LOADED + this.name) {
                this.loadTextureFromAsset(message.context);
            }
        };
        Texture.prototype.loadTextureFromAsset = function (asset) {
            this._width = asset.width;
            this._height = asset.height;
            this.bind();
            B2DGAME.gl.texImage2D(B2DGAME.gl.TEXTURE_2D, LEVEL, B2DGAME.gl.RGBA, B2DGAME.gl.RGBA, B2DGAME.gl.UNSIGNED_BYTE, asset.data);
            if (this.isPowerof2()) {
                B2DGAME.gl.generateMipmap(B2DGAME.gl.TEXTURE_2D);
            }
            else {
                // Do not generate a mipmap and clamp to edge.
                B2DGAME.gl.texParameteri(B2DGAME.gl.TEXTURE_2D, B2DGAME.gl.TEXTURE_WRAP_S, B2DGAME.gl.CLAMP_TO_EDGE);
                B2DGAME.gl.texParameteri(B2DGAME.gl.TEXTURE_2D, B2DGAME.gl.TEXTURE_WRAP_T, B2DGAME.gl.CLAMP_TO_EDGE);
                B2DGAME.gl.texParameteri(B2DGAME.gl.TEXTURE_2D, B2DGAME.gl.TEXTURE_MIN_FILTER, B2DGAME.gl.LINEAR);
            }
            this._isLoaded = true;
        };
        Texture.prototype.isPowerof2 = function () {
            return (this.isValueof2(this._width) && this.isValueof2(this._height));
        };
        Texture.prototype.isValueof2 = function (value) {
            return (value & (value - 1)) == 0;
        };
        return Texture;
    }());
    B2DGAME.Texture = Texture;
})(B2DGAME || (B2DGAME = {}));
var B2DGAME;
(function (B2DGAME) {
    var TextureReferenceNode = /** @class */ (function () {
        function TextureReferenceNode(texture) {
            this.referenceCount = 1;
            this.texture = texture;
        }
        return TextureReferenceNode;
    }());
    var TextureManager = /** @class */ (function () {
        function TextureManager() {
        }
        TextureManager.prototype.contructor = function () {
        };
        TextureManager.getTexture = function (textureName) {
            if (TextureManager._texture[textureName] === undefined) {
                var texture = new B2DGAME.Texture(textureName);
                TextureManager._texture[textureName] = new TextureReferenceNode(texture);
            }
            else {
                TextureManager._texture[textureName].referenceCount++;
            }
            return TextureManager._texture[textureName].texture;
        };
        TextureManager.releaseTexture = function (textureName) {
            if (TextureManager._texture[textureName] === undefined) {
                console.warn("A texture named $(textureName) does not exist and therefore cannot be released");
            }
            else {
                TextureManager._texture[textureName].referenceCount--;
                if (TextureManager._texture[textureName].referenceCount < 1) {
                    TextureManager._texture[textureName].texture.destroy();
                    TextureManager._texture[textureName] = undefined;
                    delete TextureManager._texture[textureName];
                }
            }
        };
        TextureManager._texture = {};
        return TextureManager;
    }());
    B2DGAME.TextureManager = TextureManager;
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
            m._data[12] = (left + right) * lr;
            m._data[13] = (top + bottom) * bt;
            m._data[14] = (farclip + nearclip) * nf;
            return m;
        };
        Matrix4x4.translation = function (position) {
            var m = new Matrix4x4();
            m._data[12] = position.x;
            m._data[13] = position.y;
            m._data[14] = position.z;
            return m;
        };
        return Matrix4x4;
    }());
    B2DGAME.Matrix4x4 = Matrix4x4;
})(B2DGAME || (B2DGAME = {}));
var B2DGAME;
(function (B2DGAME) {
    /**
    * Represents a 2-component vector.
     */
    var Vector2 = /** @class */ (function () {
        /**
         *  Creates a new Vector 2
         * @param x The x component
         * @param y The y component
         */
        function Vector2(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this._x = x;
            this._y = y;
        }
        Object.defineProperty(Vector2.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (value) {
                this._x = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector2.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (value) {
                this._y = value;
            },
            enumerable: true,
            configurable: true
        });
        Vector2.prototype.toArray = function () {
            return [this._x, this._y];
        };
        Vector2.prototype.toFloat32Array = function () {
            return new Float32Array(this.toArray());
        };
        return Vector2;
    }());
    B2DGAME.Vector2 = Vector2;
})(B2DGAME || (B2DGAME = {}));
var B2DGAME;
(function (B2DGAME) {
    /**
    * Represents a 3-component vector.
     */
    var Vector3 = /** @class */ (function () {
        /**
         *  Creates a new Vector 3
         * @param x The x component
         * @param y The y component
         * @param z The z component
         */
        function Vector3(x, y, z) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (z === void 0) { z = 0; }
            this._x = x;
            this._y = y;
            this._z = z;
        }
        Object.defineProperty(Vector3.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (value) {
                this._x = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector3.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (value) {
                this._y = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector3.prototype, "z", {
            get: function () {
                return this._z;
            },
            set: function (value) {
                this._z = value;
            },
            enumerable: true,
            configurable: true
        });
        Vector3.prototype.toArray = function () {
            return [this._x, this._y, this._z];
        };
        Vector3.prototype.toFloat32Array = function () {
            return new Float32Array(this.toArray());
        };
        return Vector3;
    }());
    B2DGAME.Vector3 = Vector3;
})(B2DGAME || (B2DGAME = {}));
var B2DGAME;
(function (B2DGAME) {
    var MessagePriority;
    (function (MessagePriority) {
        MessagePriority[MessagePriority["NORMAL"] = 0] = "NORMAL";
        MessagePriority[MessagePriority["HIGH"] = 1] = "HIGH";
    })(MessagePriority = B2DGAME.MessagePriority || (B2DGAME.MessagePriority = {}));
    var Message = /** @class */ (function () {
        function Message(code, sender, context, priority) {
            if (priority === void 0) { priority = MessagePriority.NORMAL; }
            this.code = code;
            this.sender = sender;
            this.context = context;
            this.priority = priority;
        }
        Message.send = function (code, sender, context) {
            B2DGAME.MessageBus.post(new Message(code, sender, context, MessagePriority.NORMAL));
        };
        Message.sendPriority = function (code, sender, context) {
            B2DGAME.MessageBus.post(new Message(code, sender, context, MessagePriority.HIGH));
        };
        Message.subscribe = function (code, handler) {
            B2DGAME.MessageBus.addSubscription(code, handler);
        };
        Message.unsubscribe = function (code, handler) {
            B2DGAME.MessageBus.RemoveSubscription(code, handler);
        };
        return Message;
    }());
    B2DGAME.Message = Message;
})(B2DGAME || (B2DGAME = {}));
var B2DGAME;
(function (B2DGAME) {
    var MessageBus = /** @class */ (function () {
        function MessageBus() {
        }
        MessageBus.addSubscription = function (code, handler) {
            if (MessageBus._subscription[code] === undefined) {
                MessageBus._subscription[code] = [];
            }
            if (MessageBus._subscription[code].indexOf(handler) !== -1) {
                console.warn("Attempting to add a duplicate handler to code: " + code + ". Subscription not added!");
            }
            else {
                MessageBus._subscription[code].push(handler);
            }
        };
        MessageBus.RemoveSubscription = function (code, handler) {
            if (MessageBus._subscription[code] === undefined) {
                console.warn("Cannot unsubscribe handler from code: " + code + ". Because that code is not subscribe to!");
                return;
            }
            var nodeIndex = MessageBus._subscription[code].indexOf(handler);
            if (nodeIndex !== -1) {
                MessageBus._subscription[code].splice(nodeIndex, 1);
            }
        };
        MessageBus.post = function (message) {
            console.log("Message Posted: ", message);
            var handlers = MessageBus._subscription[message.code];
            if (handlers === undefined) {
                return;
            }
            for (var _i = 0, handlers_1 = handlers; _i < handlers_1.length; _i++) {
                var h = handlers_1[_i];
                if (message.priority === B2DGAME.MessagePriority.HIGH) {
                    h.onMessage(message);
                }
                else {
                    MessageBus._NormalMessageQueue.push(new B2DGAME.MessageSubscriptionNode(message, h));
                }
            }
        };
        MessageBus.update = function (time) {
            if (MessageBus._NormalMessageQueue.length === 0) {
                return;
            }
            var messageLimit = Math.min(MessageBus._normalQueueMessagePerUpdate, MessageBus._NormalMessageQueue.length);
            for (var i = 0; i < messageLimit; ++i) {
                var node = MessageBus._NormalMessageQueue.pop();
                node.handler.onMessage(node.message);
            }
        };
        MessageBus._subscription = {};
        MessageBus._normalQueueMessagePerUpdate = 10;
        MessageBus._NormalMessageQueue = [];
        return MessageBus;
    }());
    B2DGAME.MessageBus = MessageBus;
})(B2DGAME || (B2DGAME = {}));
var B2DGAME;
(function (B2DGAME) {
    var MessageSubscriptionNode = /** @class */ (function () {
        function MessageSubscriptionNode(message, handler) {
            this.message = message;
            this.handler = handler;
        }
        return MessageSubscriptionNode;
    }());
    B2DGAME.MessageSubscriptionNode = MessageSubscriptionNode;
})(B2DGAME || (B2DGAME = {}));
//# sourceMappingURL=main.js.map