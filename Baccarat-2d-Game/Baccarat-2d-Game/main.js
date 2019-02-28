var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
            this._basicshader = new B2DGAME.BasicShader();
            this._basicshader.use();
            this._projection = B2DGAME.Matrix4x4.orthographic(0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);
            //Load Material
            B2DGAME.MaterialManager.registerMaterial(new B2DGAME.Material("crate", "assets/textures/sample.jpg", new B2DGAME.Color(255, 128, 0, 255)));
            //Load
            this._sprite = new B2DGAME.Sprite("test", "crate");
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
            var projectLocation = this._basicshader.getUniformLocation("u_projection");
            B2DGAME.gl.uniformMatrix4fv(projectLocation, false, new Float32Array(this._projection.data));
            //draw
            this._sprite.draw(this._basicshader);
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
         */
        function Shader(name) {
            this._attributes = {}; //collection of keys
            this._uniforms = {};
            this._name = name;
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
        Shader.prototype.load = function (vertexSource, fragmentSource) {
            var vertextShader = this.loadShader(vertexSource, B2DGAME.gl.VERTEX_SHADER);
            var fragmentShader = this.loadShader(fragmentSource, B2DGAME.gl.FRAGMENT_SHADER);
            this.createProgram(vertextShader, fragmentShader);
            this.detectAttribute();
            this.detectUniforms();
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
    var BasicShader = /** @class */ (function (_super) {
        __extends(BasicShader, _super);
        function BasicShader() {
            var _this = _super.call(this, "basic") || this;
            _this.load(_this.getVertexSource(), _this.getFragmentSource());
            return _this;
        }
        BasicShader.prototype.getVertexSource = function () {
            return "\nattribute vec3 a_position;\nattribute vec2 a_texCoord;\nuniform mat4 u_projection;\n\nuniform mat4 u_model;\n\nvarying vec2 v_texCoord;\n\nvoid main()\n{\n    gl_Position = u_projection * u_model * vec4(a_position, 1.0);\n    v_texCoord =  a_texCoord;\n}";
        };
        BasicShader.prototype.getFragmentSource = function () {
            return "\nprecision mediump float;\n\nuniform vec4 u_tint;\nuniform sampler2D u_diffuse;\n\nvarying vec2 v_texCoord;\n\nvoid main(){\n    gl_FragColor = u_tint * texture2D(u_diffuse, v_texCoord);\n}";
        };
        return BasicShader;
    }(B2DGAME.Shader));
    B2DGAME.BasicShader = BasicShader;
})(B2DGAME || (B2DGAME = {}));
var B2DGAME;
(function (B2DGAME) {
    var Color = /** @class */ (function () {
        function Color(r, g, b, a) {
            if (r === void 0) { r = 255; }
            if (g === void 0) { g = 255; }
            if (b === void 0) { b = 255; }
            if (a === void 0) { a = 255; }
            this._r = r;
            this._g = g;
            this._b = b;
            this._a = a;
        }
        Object.defineProperty(Color.prototype, "r", {
            get: function () {
                return this._r;
            },
            set: function (value) {
                this._r = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "rFloat", {
            get: function () {
                return this._r / 255;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "g", {
            get: function () {
                return this._g;
            },
            set: function (value) {
                this._g = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "gFloat", {
            get: function () {
                return this._g / 255;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "b", {
            get: function () {
                return this._b;
            },
            set: function (value) {
                this._b = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "bFloat", {
            get: function () {
                return this._b / 255;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "a", {
            get: function () {
                return this._a;
            },
            set: function (value) {
                this._a = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "aFloat", {
            get: function () {
                return this._a / 255;
            },
            enumerable: true,
            configurable: true
        });
        Color.prototype.toArray = function () {
            return [this._r, this._g, this._b, this._a];
        };
        Color.prototype.toFloatArray = function () {
            return [this._r / 255.0, this._g / 255.0, this._b / 255.0, this._a / 255.0];
        };
        Color.prototype.toFloat32Array = function () {
            return new Float32Array(this.toFloatArray());
        };
        Color.white = function () {
            return new Color(255, 255, 255, 255);
        };
        Color.black = function () {
            return new Color(0, 0, 0, 255);
        };
        Color.red = function () {
            return new Color(255, 0, 0, 255);
        };
        Color.green = function () {
            return new Color(0, 255, 0, 255);
        };
        Color.blue = function () {
            return new Color(0, 0, 255, 255);
        };
        return Color;
    }());
    B2DGAME.Color = Color;
})(B2DGAME || (B2DGAME = {}));
var B2DGAME;
(function (B2DGAME) {
    var Material = /** @class */ (function () {
        function Material(name, diffuseTextureName, tint) {
            this._name = name;
            this._diffuseTextureName = diffuseTextureName;
            this._tint = tint;
            if (this._diffuseTextureName !== undefined) {
                this._diffuseTexture = B2DGAME.TextureManager.getTexture(this._diffuseTextureName);
            }
        }
        Object.defineProperty(Material.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Material.prototype, "diffuseTextureName", {
            get: function () {
                return this._diffuseTextureName;
            },
            set: function (value) {
                if (this._diffuseTexture !== undefined) {
                    B2DGAME.TextureManager.releaseTexture(this._diffuseTextureName);
                }
                this._diffuseTextureName = value;
                if (this._diffuseTextureName !== undefined) {
                    this._diffuseTexture = B2DGAME.TextureManager.getTexture(this._diffuseTextureName);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Material.prototype, "diffuseTexture", {
            get: function () {
                return this._diffuseTexture;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Material.prototype, "tint", {
            get: function () {
                return this._tint;
            },
            enumerable: true,
            configurable: true
        });
        Material.prototype.destroy = function () {
            B2DGAME.TextureManager.releaseTexture(this._diffuseTextureName);
            this._diffuseTexture = undefined;
        };
        return Material;
    }());
    B2DGAME.Material = Material;
})(B2DGAME || (B2DGAME = {}));
var B2DGAME;
(function (B2DGAME) {
    var MaterialReferenceNode = /** @class */ (function () {
        function MaterialReferenceNode(material) {
            this.referenceCount = 1;
            this.material = material;
        }
        return MaterialReferenceNode;
    }());
    var MaterialManager = /** @class */ (function () {
        function MaterialManager() {
        }
        MaterialManager.registerMaterial = function (material) {
            if (MaterialManager._materials[material.name] === undefined) {
                MaterialManager._materials[material.name] = new MaterialReferenceNode(material);
            }
        };
        MaterialManager.getMaterial = function (materialName) {
            if (MaterialManager._materials[materialName] === undefined) {
                return undefined;
            }
            else {
                MaterialManager._materials[materialName].referenceCount++;
                return MaterialManager._materials[materialName].material;
            }
        };
        MaterialManager.releaseMaterial = function (materialName) {
            if (MaterialManager._materials[materialName] === undefined) {
                console.log("Cannot release a material that has not been registered");
            }
            else {
                MaterialManager._materials[materialName].referenceCount--;
                if (MaterialManager._materials[materialName].referenceCount < 1) {
                    MaterialManager._materials[materialName].material.destroy();
                    MaterialManager._materials[materialName].material = undefined;
                    delete MaterialManager._materials[materialName];
                }
            }
        };
        MaterialManager._materials = {};
        return MaterialManager;
    }());
    B2DGAME.MaterialManager = MaterialManager;
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
         * @param materialName The name of the material to be used.
         * @param width The width of this sprite
         * @param height The height of this sprite
         */
        function Sprite(name, materialName, width, height) {
            if (width === void 0) { width = 200; }
            if (height === void 0) { height = 200; }
            /**
            * The position of this sprite
            */
            this.position = new B2DGAME.Vector3();
            this._name = name;
            this._width = width;
            this._height = height;
            this._materialName = materialName;
            this._material = B2DGAME.MaterialManager.getMaterial(this._materialName);
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
            B2DGAME.MaterialManager.releaseMaterial(this._materialName);
            this._material = undefined;
            this._materialName = undefined;
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
            var modelLocation = shader.getUniformLocation("u_model");
            B2DGAME.gl.uniformMatrix4fv(modelLocation, false, new Float32Array(B2DGAME.Matrix4x4.translation(this.position).data));
            var colorLocation = shader.getUniformLocation("u_tint");
            B2DGAME.gl.uniform4fv(colorLocation, this._material.tint.toFloat32Array());
            if (this._material.diffuseTexture !== undefined) {
                this._material.diffuseTexture.activateAndBind(0);
                var diffuseLocation = shader.getUniformLocation("u_diffuse");
                B2DGAME.gl.uniform1i(diffuseLocation, 0);
            }
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
        /**
         * Creates a rotation matrix on the X axis from the provided angle in radians.
         * @param angleInRadians The angle in radians.
         */
        Matrix4x4.rotationX = function (angleInRadians) {
            var m = new Matrix4x4();
            var c = Math.cos(angleInRadians);
            var s = Math.sin(angleInRadians);
            m._data[5] = c;
            m._data[6] = s;
            m._data[9] = -s;
            m._data[10] = c;
            return m;
        };
        /**
         * Creates a rotation matrix on the Y axis from the provided angle in radians.
         * @param angleInRadians The angle in radians.
         */
        Matrix4x4.rotationY = function (angleInRadians) {
            var m = new Matrix4x4();
            var c = Math.cos(angleInRadians);
            var s = Math.sin(angleInRadians);
            m._data[0] = c;
            m._data[2] = -s;
            m._data[8] = s;
            m._data[10] = c;
            return m;
        };
        /**
         * Creates a rotation matrix on the Z axis from the provided angle in radians.
         * @param angleInRadians The angle in radians.
         */
        Matrix4x4.rotationZ = function (angleInRadians) {
            var m = new Matrix4x4();
            var c = Math.cos(angleInRadians);
            var s = Math.sin(angleInRadians);
            m._data[0] = c;
            m._data[1] = s;
            m._data[4] = -s;
            m._data[5] = c;
            return m;
        };
        /**
         * Creates a rotation matrix from the provided angles in radians.
         * @param xRadians The angle in radians on the X axis.
         * @param yRadians The angle in radians on the Y axis.
         * @param zRadians The angle in radians on the Z axis.
         */
        Matrix4x4.rotationXYZ = function (xRadians, yRadians, zRadians) {
            var rx = Matrix4x4.rotationX(xRadians);
            var ry = Matrix4x4.rotationY(yRadians);
            var rz = Matrix4x4.rotationZ(zRadians);
            // ZYX
            return Matrix4x4.multiply(Matrix4x4.multiply(rz, ry), rx);
        };
        /**
         * Creates a scale matrix.
         * @param scale The scale to use.
         */
        Matrix4x4.scale = function (scale) {
            var m = new Matrix4x4();
            m._data[0] = scale.x;
            m._data[5] = scale.y;
            m._data[10] = scale.z;
            return m;
        };
        /**
         * Multiplies matrix a by matrix b and returns the result.
         * @param a The first matrix.
         * @param b The second matrix.
         */
        Matrix4x4.multiply = function (a, b) {
            var m = new Matrix4x4();
            var b00 = b._data[0 * 4 + 0];
            var b01 = b._data[0 * 4 + 1];
            var b02 = b._data[0 * 4 + 2];
            var b03 = b._data[0 * 4 + 3];
            var b10 = b._data[1 * 4 + 0];
            var b11 = b._data[1 * 4 + 1];
            var b12 = b._data[1 * 4 + 2];
            var b13 = b._data[1 * 4 + 3];
            var b20 = b._data[2 * 4 + 0];
            var b21 = b._data[2 * 4 + 1];
            var b22 = b._data[2 * 4 + 2];
            var b23 = b._data[2 * 4 + 3];
            var b30 = b._data[3 * 4 + 0];
            var b31 = b._data[3 * 4 + 1];
            var b32 = b._data[3 * 4 + 2];
            var b33 = b._data[3 * 4 + 3];
            var a00 = a._data[0 * 4 + 0];
            var a01 = a._data[0 * 4 + 1];
            var a02 = a._data[0 * 4 + 2];
            var a03 = a._data[0 * 4 + 3];
            var a10 = a._data[1 * 4 + 0];
            var a11 = a._data[1 * 4 + 1];
            var a12 = a._data[1 * 4 + 2];
            var a13 = a._data[1 * 4 + 3];
            var a20 = a._data[2 * 4 + 0];
            var a21 = a._data[2 * 4 + 1];
            var a22 = a._data[2 * 4 + 2];
            var a23 = a._data[2 * 4 + 3];
            var a30 = a._data[3 * 4 + 0];
            var a31 = a._data[3 * 4 + 1];
            var a32 = a._data[3 * 4 + 2];
            var a33 = a._data[3 * 4 + 3];
            m._data[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
            m._data[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
            m._data[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
            m._data[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
            m._data[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
            m._data[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
            m._data[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
            m._data[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
            m._data[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
            m._data[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
            m._data[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
            m._data[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
            m._data[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
            m._data[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
            m._data[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
            m._data[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
            return m;
        };
        Matrix4x4.prototype.toFloat32Array = function () {
            return new Float32Array(this._data);
        };
        return Matrix4x4;
    }());
    B2DGAME.Matrix4x4 = Matrix4x4;
})(B2DGAME || (B2DGAME = {}));
var B2DGAME;
(function (B2DGAME) {
    var Transform = /** @class */ (function () {
        function Transform() {
            /** The position. Default: Vector3.zero */
            this.position = B2DGAME.Vector3.zero;
            /** The rotation. Default: Vector3.zero */
            this.rotation = B2DGAME.Vector3.zero;
            /** The rotation. Default: Vector3.one */
            this.scale = B2DGAME.Vector3.one;
        }
        /**
         * Creates a copy of the provided transform.
         * @param transform The transform to be copied.
         */
        Transform.prototype.copyFrom = function (transform) {
            this.position.copyFrom(transform.position);
            this.rotation.copyFrom(transform.rotation);
            this.scale.copyFrom(transform.scale);
        };
        /** Creates and returns a matrix based on this transform. */
        Transform.prototype.getTransformationMatrix = function () {
            var translation = B2DGAME.Matrix4x4.translation(this.position);
            var rotation = B2DGAME.Matrix4x4.rotationXYZ(this.rotation.x, this.rotation.y, this.rotation.z);
            var scale = B2DGAME.Matrix4x4.scale(this.scale);
            // T * R * S
            return B2DGAME.Matrix4x4.multiply(B2DGAME.Matrix4x4.multiply(translation, rotation), scale);
        };
        /**
         * Sets the values of this transform to the ones provided in the given JSON.
         * Only values which are overridden need be provided. For example, a position of [0,1,0]
         * needs only to provide the y value (1) as 0 is the default for x and z.
         * @param json The JSON to set from.
         */
        Transform.prototype.setFromJson = function (json) {
            if (json.position !== undefined) {
                this.position.setFromJson(json.position);
            }
            if (json.rotation !== undefined) {
                this.rotation.setFromJson(json.rotation);
            }
            if (json.scale !== undefined) {
                this.scale.setFromJson(json.scale);
            }
        };
        return Transform;
    }());
    B2DGAME.Transform = Transform;
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
        Object.defineProperty(Vector3, "zero", {
            /** Returns a vector3 with all components set to 0. */
            get: function () {
                return new Vector3();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector3, "one", {
            /** Returns a vector3 with all components set to 1. */
            get: function () {
                return new Vector3(1, 1, 1);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Calculates the difference between vector a and vector b.
         * @param a The first vector.
         * @param b The second vector.
         */
        Vector3.distance = function (a, b) {
            var diff = a.subtract(b);
            return Math.sqrt(diff.x * diff.x + diff.y * diff.y + diff.z * diff.z);
        };
        /**
         * Sets the x, y and z components of this vector.
         * @param x The x component value.
         * @param y The y component value.
         * @param z The z component value.
         */
        Vector3.prototype.set = function (x, y, z) {
            if (x !== undefined) {
                this._x = x;
            }
            if (y !== undefined) {
                this._y = y;
            }
            if (z !== undefined) {
                this._z = z;
            }
        };
        /**
         * Copies the contents of the provided vector to this vector.
         * @param vector The vector to be copied.
         */
        Vector3.prototype.copyFrom = function (vector) {
            this._x = vector._x;
            this._y = vector._y;
            this._z = vector._z;
        };
        /**
         * Check if this vector is equal to the one passed in.
         * @param v The vector to check against.
         */
        Vector3.prototype.equals = function (v) {
            return (this.x === v.x && this.y === v.y && this.z === v.z);
        };
        /**
         * Sets the values of this vector from the provided JSON.
         * @param json The JSON to set from.
         */
        Vector3.prototype.setFromJson = function (json) {
            if (json.x !== undefined) {
                this._x = Number(json.x);
            }
            if (json.y !== undefined) {
                this._y = Number(json.y);
            }
            if (json.z !== undefined) {
                this._z = Number(json.z);
            }
        };
        Vector3.prototype.toArray = function () {
            return [this._x, this._y, this._z];
        };
        Vector3.prototype.toFloat32Array = function () {
            return new Float32Array(this.toArray());
        };
        /** Converts this vector to a Vector2 by dropping the Z component. */
        Vector3.prototype.toVector2 = function () {
            return new B2DGAME.Vector2(this._x, this._y);
        };
        /**
        * Adds the provided vector to this vector.
        * @param v The vector to be added.
        */
        Vector3.prototype.add = function (v) {
            this._x += v._x;
            this._y += v._y;
            this._z += v._z;
            return this;
        };
        /**
         * Subtracts the provided vector from this vector.
         * @param v The vector to be subtracted.
         */
        Vector3.prototype.subtract = function (v) {
            this._x -= v._x;
            this._y -= v._y;
            this._z -= v._z;
            return this;
        };
        /**
         * Multiplies this vector by the provided vector.
         * @param v The vector to be multiplied by.
         */
        Vector3.prototype.multiply = function (v) {
            this._x *= v._x;
            this._y *= v._y;
            this._z *= v._z;
            return this;
        };
        /**
         * Divides this vector by the provided vector.
         * @param v The vector to be divided by.
         */
        Vector3.prototype.divide = function (v) {
            this._x /= v._x;
            this._y /= v._y;
            this._z /= v._z;
            return this;
        };
        /**
         * Scales this vector by the provided number.
         */
        Vector3.prototype.scale = function (scale) {
            this._x *= scale;
            this._y *= scale;
            this._z *= scale;
            return this;
        };
        /** Clones this vector. */
        Vector3.prototype.clone = function () {
            return new Vector3(this._x, this._y, this._z);
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
var B2DGAME;
(function (B2DGAME) {
    var SimObjects = /** @class */ (function () {
        function SimObjects() {
        }
        return SimObjects;
    }());
    B2DGAME.SimObjects = SimObjects;
})(B2DGAME || (B2DGAME = {}));
//# sourceMappingURL=main.js.map