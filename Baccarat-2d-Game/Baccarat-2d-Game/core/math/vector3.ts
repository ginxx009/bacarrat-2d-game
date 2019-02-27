namespace B2DGAME {
    /**
    * Represents a 3-component vector.
     */
    export class Vector3 {

        private _x: number;
        private _y: number;
        private _z: number;

        /**
         *  Creates a new Vector 3
         * @param x The x component
         * @param y The y component
         * @param z The z component
         */
        public constructor(x:number = 0, y:number = 0, z:number = 0) {
            this._x = x;
            this._y = y;
            this._z = z;
        }

        public get x(): number {
            return this._x;
        }

        public set x(value: number) {
            this._x = value;
        }

        public get y(): number {
            return this._y;
        }

        public set y(value: number) {
            this._y = value;
        }
        
        public get z(): number {
            return this._z;
        }

        public set z(value: number) {
            this._z = value;
        }

        public toArray(): number[] {
            return [this._x, this._y, this._z];
        }

        public toFloat32Array(): Float32Array {
            return new Float32Array(this.toArray());
        }

    }
}