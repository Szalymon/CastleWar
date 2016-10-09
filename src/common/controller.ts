/**
 * Controllerek őse, ami közös a kliens és a szerver model kezelésében az itt található
 */

import Model = require("../common/model");
import Manager = require("../common/manager");

export interface Controller {
	controlable:Manager.Controllable;
}