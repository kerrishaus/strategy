import { State } from "./State.js";

export class GameOverState extends State
{
	constructor()
	{
		super();
	}

	init()
	{
		console.log("Initialising GameOverState...");

		console.log("GameOverState initialised.");
	}

    cleanup()
	{
		console.log("Cleaing up GameOverState...");

		console.log("GameOverState cleaned up.");
	}
}