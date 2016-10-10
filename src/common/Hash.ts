namespace Hash {

    export interface String<ValueType> {
        [index: string]: ValueType;
    }

    export interface Number<ValueType> {
        [index: number]: ValueType;
    }
}

export default Hash;