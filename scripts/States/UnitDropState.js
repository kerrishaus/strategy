import  * as Colors from "../Colors.js";

import { State } from "./State.js";
import { AttackState } from "./AttackState.js";

export class UnitDropState extends State
{
	constructor(availableUnits)
	{
		super();

		this.availableUnits = availableUnits;

		this.selectedTerritory = null;
	}

	init(stateMachine)
	{
		this.stateMachine = stateMachine;
		this.stateMachine.setStateNumber(0);

		console.log("UnitDropState ready.");

		this.selectedTerritory = null;

		$("#count").html(this.availableUnits);

		$(htmlRenderer.domElement).on("click", "#dropUnitButton", callback =>
		{
			if (this.selectedTerritory === null)
			{
				console.error("selectedTerritory is null in UnitDropState::init().");
				return;
			}

			const amount = parseInt($("#dropUnitAmount").val());

			if (this.availableUnits <= 0)
			{
				console.error("No available units to drop.");
				return;
			}

			if (amount > this.availableUnits)
			{
				console.error("Requested to drop too many units.");
				return;
			}

			this.availableUnits -= amount;
			this.selectedTerritory.addUnits(amount);
			//socket.send(JSON.stringify({ command: "dropUnits", territory: this.selectedTerritory.territoryId, unitCount: this.selectedTerritory.unitCount }));

			this.selectedTerritory.destroyUnitPlaceDialog();
			this.selectedTerritory.lower();
			this.selectedTerritory.material.color.setHex(Colors.ownedColor);
			this.selectedTerritory = null;

			if (this.availableUnits <= 0)
				this.stateMachine.changeState(new AttackState());

			$("#count").html(this.availableUnits);
		});
	}

	cleanup()
	{
		console.log("UnitDropState cleaned up.");
		
		$(htmlRenderer).off("click", "#dropUnitButton");
	}
	
	onHover(object)
	{
		if (object.userData.team != 1)
			return;
		
		if (this.selectedTerritory !== object)
		{
			if (this.availableUnits > 0)
			{
				object.raise();
				object.material.color.setHex(Colors.ownedHoverColor);
			}
		}
	}
	
	onStopHover(object)
	{
		if (object.userData.team != 1)
			return;
			
		if (object == this.selectedTerritory)
			return
			
		object.lower();
		object.material.color.setHex(Colors.ownedColor);
	}
	
	onMouseDown(event, object)
	{
		if (object.userData.team == 1)
		{
			if (object == this.selectedTerritory)
				return;
				
			if (this.availableUnits <= 0)
			{
				console.error("You have no more deployable units.");
				return;
			}
			
			if (this.selectedTerritory !== null)
			{
				this.selectedTerritory.lower();
				this.selectedTerritory.material.color.setHex(Colors.ownedColor);
				this.selectedTerritory.destroyUnitPlaceDialog();
				this.selectedTerritory = null;
			}
			
			this.selectedTerritory = object;
			this.selectedTerritory.raise();
			this.selectedTerritory.material.color.setHex(Colors.ownedSelectedColor);
			this.selectedTerritory.createUnitPlaceDialog(this.availableUnits);
		}
	}
	
	onKeyDown(event)
	{
		if (event.code == "Escape")
			if (this.selectedTerritory !== null)
			{
				this.selectedTerritory.lower();
				this.selectedTerritory.material.color.setHex(Colors.ownedColor);
				this.selectedTerritory.destroyUnitPlaceDialog();
				this.selectedTerritory = null;
			}
	}
	
	update(deltaTime)
	{
		
	}
};