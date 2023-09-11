import  * as Colors from "../Colors.js";

import { State } from "./State.js";

export class UnitDropState extends State
{
	constructor(availableUnits)
	{
		super();

		this.availableUnits = availableUnits;

		this.selectedTerritory = null;
	}

	init()
	{
		this.selectedTerritory = null;

		$("#count").html(this.availableUnits);

		$(htmlRenderer.domElement).on("click", "#dropUnitButton", () =>
		{
			if (this.selectedTerritory === null)
			{
				console.error("selectedTerritory is null in UnitDropState::init().");
				return;
			}

			const amount = parseInt($("#dropUnitAmount").val());

			if (this.availableUnits <= 0)
			{
				console.warn("No available units to drop.");
				return;
			}

			if (amount > this.availableUnits)
			{
				console.error("Requested to drop more units than are available. This should not be possible.");
				return;
			}

			this.availableUnits -= amount;

			document.dispatchEvent(new CustomEvent("dropUnits", { detail: {
                territoryId: this.selectedTerritory.territoryId,
                amount: amount,
                population: this.selectedTerritory.unitCount + amount,
				unitsRemaining: this.availableUnits
            } }));

			// TODO: don't do this stuff until after the units have been sucessfully dropped.

			this.clearDropPoint();

			if (this.availableUnits <= 0)
			{
				console.log("No more available units, moving to next stage.");
				$("#nextStateButton").click();
			}
		});

		$(this).on("objectHover",     this.onHover);
		$(this).on("objectHoverStop", this.onStopHover);
		$(this).on("objectClick",     this.onMouseDown);
		$(this).on("keydown",         this.onKeyDown);
	}

	cleanup()
	{
		$(htmlRenderer).off("click", "#dropUnitButton");

		$(this).off("objectHover",     this.onHover);
		$(this).off("objectHoverStop", this.onStopHover);
		$(this).off("objectClick",     this.onMouseDown);
		$(this).off("keydown",         this.onKeyDown);
	}
	
	onHover(event)
	{
		const object = event.detail.object;

		if (object.userData.ownerId != clientId)
			return;

		// make sure we have enough units available
		if (this.availableUnits <= 0)
			return;
		
		// highlight any suitable territory that we haven't already selected as a drop point
		if (this.selectedTerritory !== object)
		{
			object.raise();
			object.material.color.set(Colors.shade(game.clients.getById(object.userData.ownerId).color, -20));
		}
	}
	
	onStopHover(event)
	{
		const object = event.detail.object;

		if (object.userData.ownerId != clientId)
			return;
		
		// don't put away the selected drop point
		if (object == this.selectedTerritory)
			return
			
		object.lower();
		object.material.color.set(game.clients.getById(object.userData.ownerId).color);
	}
	
	onMouseDown(event)
	{
		const object = event.detail.object;

		if (object.userData.ownerId == clientId)
		{
			if (object == this.selectedTerritory)
				return;
				
			if (this.availableUnits <= 0)
			{
				console.error("No more deployable units.");
				return;
			}
			
			if (this.selectedTerritory !== null)
				this.clearDropPoint();
			
			this.selectedTerritory = object;
			this.selectedTerritory.raise();
			this.selectedTerritory.material.color.set(Colors.shade(game.clients.getById(object.userData.ownerId).color, -40));
			this.selectedTerritory.createUnitPlaceDialog(this.availableUnits);
		}
	}
	
	onKeyDown(event)
	{
		if (event.code == "Escape")
			if (this.selectedTerritory !== null)
				this.clearDropPoint();
	}
	
	update(deltaTime)
	{
		
	}

	clearDropPoint()
	{
		this.selectedTerritory.lower();
		this.selectedTerritory.material.color.set(game.clients.getById(this.selectedTerritory.userData.ownerId).color);
		this.selectedTerritory.destroyUnitPlaceDialog();
		this.selectedTerritory = null;
	}
};