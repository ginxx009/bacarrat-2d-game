namespace B2DGAME {

    export class Matrix4x4 {

        private _data: number[] = [];

        private constructor() {
            //Identity Matrix (Default Matrix)
            this._data = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ];
        }

        public get data(): number[] {
            return this._data;
        }

        public static identity(): Matrix4x4 {
            return new Matrix4x4();
        }

        public static orthographic(left:number,right:number,bottom:number,top:number,nearclip:number,farclip:number): Matrix4x4 {
            let m = new Matrix4x4();

            let lr: number = 1.0 / (left - right);
            let bt: number = 1.0 / (bottom - top);
            let nf: number = 1.0 / (nearclip - farclip);

            m._data[0] = -2.0 * lr;
            m._data[5] = -2.0 * bt;
            m._data[10] = 2.0 * nf; 

            m._data[12] = (left + top) * lr;
            m._data[13] = (top + bottom) * bt;
            m._data[14] = (farclip + nearclip) * nf;

            return m;
        }
    }
}