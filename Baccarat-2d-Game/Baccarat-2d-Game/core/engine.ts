﻿namespace B2DGAME {

    /**
     * The main game engine class
     */
    export class Engine {
        
        private _canvas: HTMLCanvasElement;
        private _shader: Shader;

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

            this.loadShaders();
            this._shader.use();

            this._projection = Matrix4x4.orthographic(0,this._canvas.width,this._canvas.height,0,-100.0,100.0);

            //Load
            this._sprite = new Sprite("test","assets/textures/sample.jpg");
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
            let colorPosition = this._shader.getUniformLocation("u_tint");
            //gl.uniform4f(colorPosition, 1, 0.5, 0, 1);
            gl.uniform4f(colorPosition, 1, 1, 1, 1);
            let projectLocation = this._shader.getUniformLocation("u_projection");
            gl.uniformMatrix4fv(projectLocation,false,new Float32Array(this._projection.data));

            let modelLocation = this._shader.getUniformLocation("u_model");
            gl.uniformMatrix4fv(modelLocation, false, new Float32Array(Matrix4x4.translation(this._sprite.position).data));

            //draw
            this._sprite.draw(this._shader);

            requestAnimationFrame(this.loop.bind(this));
        }
        
        private loadShaders(): void {
            let vertexShaderSource = `
attribute vec3 a_position;
attribute vec2 a_texCoord;
uniform mat4 u_projection;

uniform mat4 u_model;

varying vec2 v_texCoord;

void main()
{
    gl_Position = u_projection * u_model * vec4(a_position, 1.0);
    v_texCoord =  a_texCoord;
}`;
            let fragmentShaderSource = `
precision mediump float;

uniform vec4 u_tint;
uniform sampler2D u_diffuse;

varying vec2 v_texCoord;

void main(){
    gl_FragColor = u_tint * texture2D(u_diffuse, v_texCoord);
}`;
            this._shader = new Shader("basic", vertexShaderSource, fragmentShaderSource);
        }
    }
}