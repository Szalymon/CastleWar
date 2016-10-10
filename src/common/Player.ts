import SynchronUtility from "SynchronUtility";

class Player {
    id: number;
    name: string;

    constructor(name?: string) {
        this.id = SynchronUtility.getNextId();
        this.name = name || "player" + this.id;
    }

    static buildFromObject(object: Player): Player {
        var result: Player = new Player(object.name);
        result.id = object.id;
        return result;
    }

    public printToConsole() {
        console.log("player: " + this.name + " with id: " + this.id);
    }
}

export default Player;