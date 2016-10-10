class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public multiply(a: number) {
        return new Vector(this.x * a, this.y * a);
    }

    public cross(other: Vector): number {
        return this.x * other.y + this.y * other.x;
    }

    public distance(other: Vector): number {
        return this.substract(other).getLength();
    }

    public printToConsole(): void {
        console.log("(x : " + this.x + ", y : " + this.y + ")");
    }

    static buildFromObject(object: Vector): Vector {
        return new Vector(object.x, object.y);
    }

    public getLength(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public getNormalized() {
        var length = this.getLength();
        return new Vector(this.x / length, this.y / length);
    }

    public substract(v: Vector) {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    public add(v: Vector) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    public clone() {
        return new Vector(this.x, this.y);
    }
}

export default Vector;