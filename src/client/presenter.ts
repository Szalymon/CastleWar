/// <reference path="../../typings/globals/phaser/index.d.ts"/>

import Model = require("../common/model");
import Manager = require("./client-manager");
import CommonManager = require("../common/manager");

export class Match extends Phaser.State {
	
	castleSprites : SpriteDictionary = {};
	castleValues : TextDictionary = {};
	
	unitLineSprites:SpriteDictionary = {};
	unitSprites:SpriteDictionary = {};
	
	cutter : Phaser.Sprite;
	cutterStart : Phaser.Point;
	
	arrow:Phaser.Sprite;
	castleFrom:number;
	overCastle:number;
	
	music : Phaser.Sound;
	
	update() {
		// TODO model alapján frissíteni a dolgokat
		var castleDict = (<Presenter>this.game).gameManager.getCastles();
		for(var castleId in castleDict) {
		// Nem kellene minden frameben inicializálást vizsgálni
			var castle = castleDict[castleId];
        	if(this.castleSprites[castleId] == null) {
        		this.initCastle(castle);
        	} else {
        		var sprite = this.castleSprites[castleId];
        		sprite.width = 40 + castle.units/4;
        		sprite.height = 40 + castle.units/4;
        		this.castleValues[castle.id].text = castle.units.toString();
        	}
		}
		
		var unitLineDict = (<Presenter>this.game).gameManager.getUnitLines();
		for(var unitLineId in unitLineDict) {
			var unitLine = unitLineDict[unitLineId];
        	for (var index = 0; index < unitLine.units.length; index++) {
        		var unit = unitLine.units[index];
        		if(this.unitSprites[unit.id] == null) {
        			var unitSprite = this.game.add.sprite(unit.position.x,unit.position.y,"UNIT");
        			unitSprite.anchor.setTo(0.5,0.5);
        			unitSprite.scale.setTo(0.1,0.1);
        			this.unitSprites[unit.id] = unitSprite;
        		} else {
        			this.unitSprites[unit.id].x = unit.position.x;
        			this.unitSprites[unit.id].y = unit.position.y;
        		}
        	}
		}
		
		while(Model.Utils.removedOnes.length > 0) {
			var unitId = Model.Utils.removedOnes.shift();
			if(this.unitSprites[unitId] != null) {
				this.unitSprites[unitId].destroy();
				delete this.unitSprites[unitId];
			}
		}
		this.updateTools();
	}
	
	initCastle(castle : Model.Castle) {
		var newSprite;
		if(castle.owner.id == (<Presenter>this.game).gameManager.ownPlayerId) {
			newSprite = this.game.add.sprite(castle.position.x, castle.position.y, "CASTLE");
			newSprite.events.onInputDown.add(this.onCastleClickDown);
		} else {
			newSprite = this.game.add.sprite(castle.position.x, castle.position.y, "CASTLEENEMY");
		}
		var style = { font: "15px Arial", fill: "#ffffff", align: "center" };
		this.castleValues[castle.id] = this.game.add.text(castle.position.x,castle.position.y, castle.units.toString(), style);
		this.castleValues[castle.id].anchor.set(0.5, 0.5);
		newSprite.name = castle.id.toString();
		newSprite.anchor.setTo(0.5, 0.5);
		newSprite.width = 40 + castle.units/4;
		newSprite.height = 40 + castle.units/4;
		newSprite.inputEnabled = true;
		newSprite.events.onInputOver.add(this.onCastleClickOver);
		newSprite.events.onInputOut.add(this.onCastleClickOut);
		
		this.castleSprites[castle.id] = newSprite;
	}
	
	onCastleClickDown(target:Phaser.Sprite) {
		var currentState:Match = <Match>target.game.state.getCurrentState();
		currentState.arrow = target.game.add.sprite(target.x, target.y, "ARROW");
		currentState.arrow.anchor.setTo(0,0.5);
		currentState.arrow.scale.setTo(0.5,0.2);
		
		currentState.castleFrom = parseInt(target.name);
	}
	
	onCastleClickOver(target:Phaser.Sprite) {
		var currentState:Match = <Match>target.game.state.getCurrentState();
		currentState.overCastle = parseInt(target.name);
	}
	
	onCastleClickOut(target:Phaser.Sprite) {
		var currentState:Match = <Match>target.game.state.getCurrentState();
		currentState.overCastle = null;
	}
	
	updateTools() {
		var presenter:Presenter = <Presenter>this.game;
		if(this.arrow != null) {
			if(!this.input.activePointer.isDown) {
				if(this.overCastle != null) {
					
					//presenter.gameManager.sendUnits(null, this.castleFrom, this.overCastle);
					presenter.controllable.sendUnits(null, this.castleFrom, this.overCastle);
				}
				this.arrow.destroy();
				this.arrow = null;
				this.castleFrom = null;
				return;
			}
			var x:number = this.input.activePointer.position.x;
			var y:number = this.input.activePointer.position.y;
			//this.arrow.angle
			var direction_x = x - this.arrow.x;
			var direction_y = y - this.arrow.y;
			this.arrow.angle = 180/Math.PI * Math.atan2(direction_y,direction_x);
			var distance:number = new Phaser.Point(direction_x, direction_y).getMagnitude();
			this.arrow.width = distance;
		} else if(this.cutter != null) {
			if(!this.input.activePointer.isDown) {
				var vcx = this.input.activePointer.positionUp.x - this.cutter.position.x;
				var vcy = this.input.activePointer.positionUp.y - this.cutter.position.y;
				var pxc0 = this.cutter.position.x;
				var pyc0 = this.cutter.position.y;
				var pxc1 = this.input.activePointer.positionUp.x;
				var pyc1 = this.input.activePointer.positionUp.y;
				//this.getCuttedLines(new Phaser.Point(pxc0, pyc0), new Phaser.Point(vcx, vcy).normalize());
				var unitLineCutters = this.getCuttedLines(new Phaser.Point(pxc0, pyc0), new Phaser.Point(pxc1,pyc1), new Phaser.Point(vcx, vcy));
				console.log(unitLineCutters);
				this.cutter.destroy();
				this.cutter = null;
				//presenter.gameManager.cutLines(null, unitLineCutters);
				presenter.controllable.cutLines(null, unitLineCutters);
				return;
			}
			var x:number = this.input.activePointer.position.x;
			var y:number = this.input.activePointer.position.y;
			var direction_x = x - this.cutter.x;
			var direction_y = y - this.cutter.y;
			//this.arrow.angle = 180/Math.PI * Math.atan2(direction_y,direction_x);
			this.cutter.angle = 180/Math.PI * Math.atan2(direction_y,direction_x);
			var distance:number = new Phaser.Point(direction_x, direction_y).getMagnitude();
			this.cutter.width = distance;
		} else if(this.input.activePointer.isDown) {
			var x = this.input.activePointer.positionDown.x;
			var y = this.input.activePointer.positionDown.y;
			var currentState:Match = <Match>this.game.state.getCurrentState();
			//currentState.arrow = this.game.add.sprite(x, y, "CUTTER");
			//currentState.arrow.anchor.setTo(0,0.5);
			currentState.cutter = this.game.add.sprite(x, y, "CUTTER");
			currentState.cutter.anchor.setTo(0,0.5);
			//currentState.arrow.scale.setTo(0.5,0.2);
		}
	}
	
	private getCuttedLines(pc0 : Phaser.Point, pc1 : Phaser.Point, vc : Phaser.Point) : Model.VectorDictionary {
		//console.log("vizsgal");
		var resultList:Model.VectorDictionary = <Model.VectorDictionary>{};
		// végig megy a UnitLine-okon,
		var manager = (<Presenter>this.game).gameManager;
		var unitLinesDict = manager.getUnitLines();
		for(var unitLineId in unitLinesDict) {
			var unitLine = unitLinesDict[unitLineId];
			// Ha saját akkor vizsgálja
			if(unitLine.owner.id == manager.ownPlayerId && unitLine.units.length > 0) {
				// Az s-es a szakaszé
				//var ps0_ = unitLine.units[unitLine.units.length-1].position.clone();
				var ps0_ = unitLine.units[0].position.clone();
				//var ps = unitLine.units[0].position.clone();
				var ps0 = new Phaser.Point(ps0_.x, ps0_.y);
				var ps1_ = manager.getCastles()[unitLine.castleIdFrom].position;
				var ps1 = new Phaser.Point(ps1_.x, ps1_.y);
				var vs_ = ps1_.substract(ps0_).getNormalized();
				var vs = new Phaser.Point(vs_.x, vs_.y);
				// Ha nem párhuzamos irányú
				//vc.cross() - másik iránnyal szorzva megmondja hogy párhuzamopsak-e
				if(vc.cross(vs) != 0) {
					var ts = vc.x*pc0.y + ps0.x*vc.y - pc0.x*vc.y - ps0.y*vc.x;
					ts = ts / (vc.x*vs.y - vs.x*vc.y);
					var p = new Phaser.Point();
					p.x = ps0.x + ts*vs.x;
					p.y = ps0.y + ts*vs.y;
					// Ha a metszés pont belül van
					
					var sumPWithPc = p.distance(pc0) + p.distance(pc1);
					var sumPWithPs = p.distance(ps0) + p.distance(ps1);
					
					//var percentage = ps0.distance(p) / ps0.distance(ps1) * 100;
					
					if(Math.abs(pc0.distance(pc1) - sumPWithPc) < 0.002 && Math.abs(ps0.distance(ps1) - sumPWithPs) < 0.002) {
						resultList[unitLineId] = new Model.Vector(p.x, p.y);
					}
				}
				
			}
		}
		return resultList;
	}
	
	constructor() {
		super();
		this.arrow = null;
		this.cutter = null;
	}
	
    preload() {
    	this.game.load.image("CASTLE", "assets/castle.png");
    	this.game.load.image("CASTLEENEMY", "assets/castle_enemy.png");
    	this.game.load.image("ARROW", "assets/arrow.png");
    	this.game.load.image("UNIT", "assets/unit.png");
    	this.game.load.image("CUTTER", "assets/cutter.png");
    	this.game.load.image("GRASS", "assets/grass.png");
    	
    	this.game.load.audio("BACKGROUNDMUSIC", "assets/tribal_war.mp3");
    }

    create() {
        this.game.add.tileSprite(0, 0, 2048, 2048, "GRASS");
        this.music = this.game.add.audio("BACKGROUNDMUSIC");
        this.music.loop=true;
        this.music.play();
    }
}

interface SpriteDictionary {
	[index : string] : Phaser.Sprite;
}
interface UnitLineDictionary {
	[index : string] : Phaser.Sprite;
}
interface UnitDictionary {
	[index : string] : Phaser.Sprite;
}
interface TextDictionary {
	[index : string] : Phaser.Text;
}

export class Presenter extends Phaser.Game {

	gameManager : Manager.ClientGameManager;
	controllable : CommonManager.Controllable;
	
	constructor() {
		super(800, 480, Phaser.AUTO, 'content', {});

		this.state.add("MATCH", Match, false);
	}
}