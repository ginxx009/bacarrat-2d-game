﻿namespace B2DGAME {


    /**
     * Represents a WebGL shader.
     */
    export class Shader {

        private _name: string;
        private _program: WebGLProgram;
        private _attributes: { [name: string]: number } = {}; //collection of keys
        private _uniforms: { [name: string]: WebGLUniformLocation } = {};

        /**
         * Creates a new shader
         * @param name
         * @param vertexSource the source of the vertex shader
         * @param fragmentSource the source of the fragment shader
         */

        public constructor(name: string, vertexSource: string, fragmentSource: string) {
            this._name = name;
            let vertextShader = this.loadShader(vertexSource, gl.VERTEX_SHADER);
            let fragmentShader = this.loadShader(fragmentSource, gl.FRAGMENT_SHADER);

            this.createProgram(vertextShader, fragmentShader);

            this.detectAttribute();
            this.detectUniforms();
        }

        /**
        * The name of the shader
        */
        public get name(): string {
            return this._name;
        }

        /**
        * Use this shader
        */
        public use(): void {
            gl.useProgram(this._program);
        }

        /**
         * Get the location of an attribute with the provided name.
         * @param name The name of the attribute whose location to retrieve.
         */
        public getAttributeLocation(name: string):number {
            if (this._attributes[name] === undefined) {
                throw new Error(`Unable to find attribute'${name}' in shader '${this._name}'`);
            }
            return this._attributes[name];
        }

        /**
         * Get the location of an uniform with the provided name.
         * @param name The name of the uniform whose location to retrieve.
         */
        public getUniformLocation(name: string): WebGLUniformLocation {
            if (this._uniforms[name] === undefined) {
                throw new Error(`Unable to find uniform'${name}' in shader '${this._name}'`);
            }
            return this._uniforms[name];
        }

        private loadShader(source: string, shaderType:number): WebGLShader {
            let shader: WebGLShader = gl.createShader(shaderType);

            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            let error = gl.getShaderInfoLog(shader);
            if (error !== "") {
                throw new Error("Error compiling shader: '" + this._name + "': " + error);
            }
            return shader;
        }

        private createProgram(vertexShader:WebGLShader, fragmentShader:WebGLShader): void {
            this._program = gl.createProgram();

            gl.attachShader(this._program, vertexShader);
            gl.attachShader(this._program, fragmentShader);

            gl.linkProgram(this._program);

            let error = gl.getProgramInfoLog(this._program);
            if (error !== "") {
                throw new Error("Error compiling linking shader: '" + this._name + "': " + error);
            }
        }

        private detectAttribute(): void {

            let attributeCount = gl.getProgramParameter(this._program, gl.ACTIVE_ATTRIBUTES);
            for (let i = 0; i < attributeCount; i++) {
                let info: WebGLActiveInfo = gl.getActiveAttrib(this._program, i);
                if (!info) {
                    break;
                }

                this._attributes[info.name] = gl.getAttribLocation(this._program, info.name);
            }
        }

        private detectUniforms(): void {
            let uniformCount = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < uniformCount; i++) {
                let info: WebGLActiveInfo = gl.getActiveUniform(this._program, i);
                if (!info) {
                    break;
                }

                this._uniforms[info.name] = gl.getUniformLocation(this._program, info.name);
            }
        }
    }
}