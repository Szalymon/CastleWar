
class SynchronUtility {
    private static idSeck: number;
    public static removedOnes: number[];
    // TODO Eltelt idő, a játék kezdete óta

    public static initialize() {
        SynchronUtility.idSeck = Number.MIN_VALUE;
        SynchronUtility.removedOnes = new Array();
    }

    public static getNextId(): number {
        this.idSeck++;
        return this.idSeck;
    }
}

export default SynchronUtility;