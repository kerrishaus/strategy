<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>strategy</title>
		<style>
			body
			{
			    margin: 0;
			    background: navy;
			    font-family: Tahoma;
			}
		</style>
		
		<script src="https://kerrishaus.com/assets/scripts/jquery-3.6.0.min.js"></script>
		
		<script src="https://portal.kerrishaus.com/assets/javascript/messages.js"></script>
		<link rel='stylesheet' href='https://portal.kerrishaus.com/assets/styles/messages.css' />
		
		<style>
		    .gameInterfaceContainer
		    {
		        box-sizing: border-box;
		        
		        pointer-events: none;
		        color: white;
		        
		        position: absolute;
		        z-index: 99999;
		        
		        width: 100vw;
		        height: 100vh;
		        
		        overflow-x: hidden;
		        overflow-y: hidden;
		        
		        display: flex;
		        justify-content: center;
		        align-items: flex-end;
		        
		        opacity: 1;
		    }
		    
		    .transition-quick
		    {
		        transition: all 0.3s;
		    }
		    
		    .transition-long
		    {
		        transition: all 1s;
		    }
		    
		    .moveableInterfaceElement
		    {
		        transition: top    0.3s cubic-bezier(0.175, 0.885, 0.2, 1.13),
		                    left   0.3s cubic-bezier(0.175, 0.885, 0.2, 1.13),
		                    bottom 0.3s cubic-bezier(0.175, 0.885, 0.2, 1.13),
		                    right  0.3s cubic-bezier(0.175, 0.885, 0.2, 1.13);
		    }
		    
    	    .moveableInterfaceElement[data-visibility='hidden']
		    {
		        transition: top    0.3s cubic-bezier(1.13, 0.2, 0.885, 1.175),
		                    left   0.3s cubic-bezier(1.13, 0.2, 0.885, 1.175),
		                    bottom 0.3s cubic-bezier(1.13, 0.2, 0.885, 1.175),
		                    right  0.3s cubic-bezier(1.13, 0.2, 0.885, 1.175);
		    }
		    
		    .hidden
		    {
		        opacity: 0 !important;
		    }
		    
		    .gameStatus[data-state='0']
		    {
		        --outline: darkblue;
		        --primary: blue;
		        --secondary: lightblue;
		    }
		    
		    .gameStatus[data-state='1']
		    {
		        --outline: darkred;
		        --primary: red;
		        --secondary: purple; /* find a light red */
		    }
		    
		    .gameStatus[data-state='2']
		    {
		        --outline: darkgreen;
		        --primary: green;
		        --secondary: lightgreen;
		    }
		    
		    .gameStatus
		    {
		        --color-fade-time: 0.3s;
		        
		        display: flex;
		        flex-direction: row;
		        align-items: center;
		        
		        padding-bottom: 40px;
		        
		        position: relative;
		        bottom: 0px;
		    }
		    
		    .gameInterfaceContainer[data-visibility="hidden"] > .gameStatus
		    {
		        bottom: -200px;
		    }
		    
		    #me
		    {
		        width: 128px;
		        height: 128px;
		        
		        background-color: var(--primary);
		        
		        border-radius: 100%;
		        border: 10px solid var(--outline);
		        
		        display: flex;
		        flex-direction: column;
		        align-items: center;
		        justify-content: flex-end;
		        
                position: relative;
                left: 26px;
                
                transition: background-color var(--color-fade-time), border-color var(--color-fade-time);
		    }
		    
		    #playerPortrait
		    {
		        background-color: var(--outline);
		        min-height: 96px;
		        width: 64px;
		        
		        border-radius: 10px;
		        
		        position: relative;
		        top: 5px;
		        
		        transition: background-color var(--color-fade-time), border-color var(--color-fade-time);
		    }
		    
		    #roundStatus
		    {
		        background-color: #222222bb;
		        padding: 18px 40px;
		        text-align: center;
		        
		        transition: background-color var(--color-fade-time), border-color var(--color-fade-time);
		    }
		    
		    #flag
		    {
		        display: inline-block;
		        
		        width: 26px;
		        height: 14px;
		        
		        border-radius: 3px;
		        
		        background-color: red;
		    }
		    
		    #playerName
		    {
		        font-size: 24px;
		        padding: 0px 10px;
		    }
		    
		    #tags
		    {
		        padding: 2px 4px;
		        font-size: 12px;
		        border-radius: 100%;
		        background-color: var(--outline);
		    }
		    
		    #roundType
		    {
		        display: flex;
		        gap: 5px;
		        
		        padding-top: 8px;
		        padding-bottom: 5px;
		    }
		    
		    .roundSpace
		    {
		        height: 12px;
		        
		        background-color: black;
		        
		        border-radius: 5px;
		        
		        flex-grow: 1;
		        
		        transition: background-color var(--color-fade-time), border-color var(--color-fade-time);
		    }
		    
		    .roundSpace.active
		    {
		        background-color: var(--primary);
		    }
		    
		    #roundName
		    {
		        text-transform: uppercase;
		    }
		    
		    #nextStateButton
		    {
		        pointer-events: auto;
		        color: lightblue;
		    }
		    
		    #counter
		    {
		        width: 128px;
		        height: 128px;
		        
		        background-color: var(--primary);
		        
		        border-radius: 100%;
		        border: 10px solid var(--outline);
		        
		        display: flex;
		        flex-direction: column;
		        align-items: center;
		        justify-content: flex-end;
		        
		        position: relative;
		        left: -26px;
		        
		        transition: background-color var(--color-fade-time), border-color var(--color-fade-time);
		    }
		    
		    #statue
		    {
		        background-color: var(--outline);
		        min-height: 72px;
		        width: 48px;
		        
		        border-radius: 10px;
		        
		        position: relative;
		        top: 10px;
		        
		        transition: background-color var(--color-fade-time), border-color var(--color-fade-time);
		    }
		    
		    #count
		    {
		        background-color: var(--outline);
		        border-radius: 10px;
		        padding: 5px;
		        font-size: 28px;
		        text-align: center;
		        
		        width: 38px;
		        
		        position: relative;
		        top: 20px;
		        
		        transition: background-color var(--color-fade-time), border-color var(--color-fade-time);
		    }
		    
		    .attackPlanner
		    {
		        position: absolute;
		        
		        height: 100vh;
		        width: 100vw;
		        
		        background-color: #000000aa;
		        
		        opacity: 0;
		        
		        transition: opacity 0.3s;
		        
		        display: flex;
		    }
		    
		    .gameInterfaceContainer[data-visibility='hidden'] > .attackPlanner
		    {
		        opacity: 1;
		    }
		    
		    .gameInterfaceContainer > .attackPlanner > div
		    {
		        flex-grow: 1;
		        
		        position: relative;
		        
		        transition: left 0.3s, right 0.3s;
		        
		        display: flex;
		        justify-content: center;
		        align-items: center;
		        flex-direction: column;
		    }
		    
		    .gameInterfaceContainer > .attackPlanner > .attacker
		    {
		        left: -50%;
		    }
		    
		    .gameInterfaceContainer > .attackPlanner > .defender
		    {
		        right: -50%;
		    }
		    
		    .gameInterfaceContainer[data-visibility='hidden'] > .attackPlanner > .attacker
		    {
		        left: 0px;
		    }
		    
		    .gameInterfaceContainer[data-visibility='hidden'] > .attackPlanner > .defender
		    {
                right: 0px;
		    }
		    
		    #unitPlaceDialog
		    {
		        position: relative;
		        z-index: 9999999 !important;
		        
		        pointer-events: auto;
		        
		        padding: 20px;
		        border-radius: 10px;
		        
		        background-color: #222222aa;
		        color: white;
		        text-align: center;
		    }
		    
		    #unitPlaceDialog > h1
		    {
		        font-size: 14px;
		        margin: 0px;
		    }
		    
		    #unitPlaceDialog > div
		    {
		        margin-top: 10px;
		        margin-bottom: 5px;
		    }
		    
		    #unitPlaceDialog > div > input[type="range"]
		    {
		        width: 80%;
		    }
		    
		    #dropUnitAmountPreview
		    {
		        font-size: 20px;
		        padding-left: 5px;
		        position: relative;
		        top: -3px;
		    }
		    
		    #unitPlaceDialog > button
		    {
		        width: 100%;
		        font-size: 14px;
		        padding: 5px;
		    }
		    
		    /*
		    #dropUnitDialog
		    {
		        width: 80%;
		        height: 30%;
		        overflow-y: hidden;
		        
	            position: absolute;
		        z-index: 999999;
		        top: 35%;
		        left: 10%;
		        
		        display: flex;
		        align-items: center;
		        justify-content: center;
		        flex-direction: column;
		        
		        background-color: #222222aa;
		        color: white;
		        font-size: 40px;
		        
		        opacity: 0;
		        transform: scale(0.8);
		        
		        transition: opacity, 0.25s, transform 0.2s;
		    }
		    
		    #dropUnitDialog.open
		    {
		        opacity: 1;
		        transform: scale(1);
		    }
		    */
		    
			#loadingCover
			{
			    position: absolute;
			    z-index: 99999999;
			    width: 100%;
			    height: 100%;
			    top: 0px;
			    left: 0px;
			    
			    background: rgb(46, 46, 46) center;
			    background-size: cover;
			        
			    backdrop-filter: blur(3px);
			    -webkit-backdrop-filter: blur(3px);
			    
			    display: flex;
			    justify-content: center;
			    align-items: center;
			    flex-direction: column;
			    
			    color: white;
			    font-size: 72px;
			    
			    opacity: 1;
			    transition: all 1s;
			}
			
			#loadingCover > #status
			{
			    display: flex;
			    align-items: center;
			    gap: 20px;
			}
			
			#kerris
			{
			    width: 30vw;
			    height: 3vw;
			}
			
			#threejs
			{
			    width: 10vw;
			    height: 10vw;
			}
			
			#webgl
			{
			    width: 30vw;
			    height: 10vw;
			}
			
			#loadingCover > .help
			{
			    position: absolute;
			    
			    width: 100%;
			    height: 100%;
			    
			    display: flex;
			    justify-content: center;
			    align-items: flex-end;
			    
			    color: white;
			    font-size: 20px;
			    
			    margin-bottom: 2em;
			}
		</style>
	</head>
	
	<body>
	    <?php 
	        if (!isset($_GET['skipLoading']))
	            echo "
            	    <div id='loadingCover'>
            	        <div id='status'>
                	        <img id='kerris' src='https://kerrishaus.com/assets/logo/text-big.png'></img>
            	            <img id='threejs' src='https://bachasoftware.com/wp-content/uploads/2020/07/icon_2-1.png'></img>
                	        <img id='webgl' src='https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/WebGL_Logo.svg/1024px-WebGL_Logo.svg.png'></img>
            	        </div>
            	        <div class='help'>
            	            Copyright &copy;&nbsp;<span translate='no'>Kerris Haus</span>
            	        </div>
            	    </div>"
        ?>
	    
	    <div class='gameInterfaceContainer transition-quick'>
	        <div class='gameStatus moveableInterfaceElement' data-state='0'>
	            <div id='me'>
	                <div id='playerPortrait'></div>
	            </div>
	            <div id='roundStatus'>
	                <div>
	                    <span id='flag'></span>
	                    <span id='playerName'>Super Idiot</span>
	                    <span id='tags'>&#10004;</span>
	                </div>
	                <div id='roundType'>
	                    <div class='roundSpace active'></div>
	                    <div class='roundSpace'></div>
	                    <div class='roundSpace'></div>
	                </div>
	                <div>
    	                <span id='roundName'>
    	                    Place
    	                </span>
                        <a href='#' id='nextStateButton'>
                            next state
                        </a>
	                </div>
	            </div>
	            <div id='counter'>
	                <div id='statue'>
	                    
	                </div>
	                <div id='count'>
	                    
	                </div>
	            </div>
	        </div>
	        <div class='attackPlanner'>
	            <div class='attacker'>
	                <h1>Attacker</h1>
	                <div style='width: 500px;height: 600px;background-color:red;border-radius:10px;'>
	                </div>
	            </div>
	            <div class='defender'>
	                <h1>Defender</h1>
	                <div style='width: 500px;height: 600px;background-color:blue;border-radius:10px;'>
	                </div>
	            </div>
	        </div>
	    </div>
	    
	    <!--
	    <div id='dropUnitDialog'>
	        <div>How many units?</div>
	        <div>
	            <input type="range" min="1" max="4" value="2" class="slider" id="dropUnitAmount"> <span id='dropUnitAmountPreview'>0</span>
            </div>
            <div>
	            <button id='dropUnitButton'>Drop Units</button>
            </div>
	    </div>
	    -->
	    
		<script src="https://kerrishaus.com/assets/threejs/build/three.js"></script>
		
		<script type='module'>
		    import { CSS2DObject, CSS2DRenderer } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";
		    
		    const ownedColor                 = 0x00aa00, 
		          ownedHoverColor            = 0x00cc00, 
		          selectedOwnedColor         = 0x00ff00, 
		          
		          enemyColor                 = 0xaa0000, 
		          enemyInvadeableColor       = 0xee0000,
		          enemyInvadeablePausedColor = 0x550000,
		          enemyInvadeableHoverColor  = 0xcc0000, 
		          enemySelectedColor         = 0xff0000;
		
			class WorldObject extends THREE.Mesh
			{
			    constructor(width, height, color)
			    {
			        const geometry = new THREE.BoxGeometry(width, height, 1);
			        const material = new THREE.MeshBasicMaterial({ color: color });
			        
			        super(geometry, material);
			        
			        this.hovered = false;
			        
			        this.objectOwner = -1;
			        this.unitCount = 1;
			        
    				const labelDiv = document.createElement("div");
    				labelDiv.id = this.uuid;
        			labelDiv.className = 'unitCount';
        			labelDiv.textContent = this.unitCount;
        			
        			this.label = new CSS2DObject(labelDiv);
        			this.label.color = "white";
        			this.add(this.label);
        			
        			this.userData.canClick = true;
        			
        			this.targetPosition = new THREE.Vector3(0, 0, 0);
        			
        			this.dialog = null;
        			this.world = null;
        			this.invadeableNeighbors = new Array(4);
			    }
			    
			    update(deltaTime)
			    {
			        this.position.lerp(this.targetPosition, 0.3);
			    }
			    
			    getInvadeableNeighbors()
			    {
			        return this.invadeableNeighbors;
			    }
			    
			    createUnitPlaceDialog(availableUnits)
			    {
			        if (this.availableUnits <= 0)
			        {
			            console.warn("No available units to place.");
			            return
			        }
			        
			        if (this.dialog)
			            this.destroyUnitPlaceDialog();
			        
    				const dialog = document.createElement("div");
        			dialog.id = 'unitPlaceDialog';
        			
        			const header = document.createElement("h1");
        			header.innerHTML = "How many units?";
        			dialog.append(header);
        			
        			const inputGroup = document.createElement("div");
        			dialog.append(inputGroup);
        			
        			const input = document.createElement("input");
        			input.id = 'dropUnitAmount';
        			input.type = 'range'
        			input.min = 1;
        			input.max = availableUnits;
        			input.value = availableUnits;
        			input.addEventListener("input", function(event)
        			{
        			    document.getElementById("dropUnitAmountPreview").innerHTML = this.value;
        			});
        			inputGroup.append(input);
        			
        			const inputCounter = document.createElement("span");
        			inputCounter.textContent = availableUnits;
        			inputCounter.id = 'dropUnitAmountPreview'
        			inputGroup.append(inputCounter);
        			
        			const button = document.createElement("button");
        			button.id = 'dropUnitButton';
        			button.textContent = "Place";
        			dialog.append(button);
        			
        			this.dialog = new CSS2DObject(dialog);
        			this.add(this.dialog);
			    }
			    
			    destroyUnitPlaceDialog()
			    {
        			this.remove(this.dialog);
        			this.dialog = null;
			    }
			    
			    /*
			    onHover()
			    {
			        this.raise();
			    }
			    
			    onStopHover()
			    {
			        this.lower();
			    }
			    */
			    
			    raise()
			    {
			        this.targetPosition.z = 0.4;
			    }
			    
			    lower()
			    {
			        this.targetPosition.z = 0;
			    }
			    
			    addUnits(amount = 1)
			    {
			        this.unitCount += amount;
			        $("#" + this.uuid).html(this.unitCount);
			    }
			    
			    removeUnits(amount = 1)
			    {
			        this.unitCount -= amount;
			        $("#" + this.uuid).html(this.unitCount);
			    }
			};
			
			/*
			class Territory extends WorldObject
			{
			    construct(color)
			    {
			        super(1, 1, color);
			    }
			}
			
			class OwnedTerritory extends Territory
			{
			    construct()
			    {
			        this.team = 1;
			    }
			}
			
			class EnemyTerritory extends Territory
			{
			    construct()
			    {
			        this.team = 2;
			    }
			}
			*/
			
			class GameWorld extends THREE.Group
			{
			    constructor(width, height)
			    {
			        super();
			        
			        this.height = height;
			        this.width = width;
			        
			        this.tiles = new Array(this.width * this.height);
			        
			        this.ownedTerritory = 0;
			        
		            for (let y = 0; y < this.height; y++)
			        {
			            for (let x = 0; x < this.width; x++)
			            {
                            function getRandomInt(max)
                            {
                                return Math.floor(Math.random() * max);
                            }
                            
                            let chance = getRandomInt(2);
                            
                            let color = enemyColor;
			                if (chance > 0)
			                {
			                    color = ownedColor;
			                    this.ownedTerritory += 1;
			                }
			                
			                const arrayPosition = x + y * this.width;
			                
			                const object = new WorldObject(2, 2, color);
			                
			                object.targetPosition.x = x + 1.3 * x;
			                object.targetPosition.y = y + 1.3 * y;
			                object.targetPosition.z = 0;
			                
			                object.userData.team = chance > 0 ? 1 : 2;
			                object.userData.invadeable = false;
			                object.userData.territoryId = arrayPosition;
			                
			                object.label.element.innerHTML = object.unitCount;
			                
			                this.tiles[arrayPosition] = object;
			                this.add(object);
			            }
			            
			        }
			        
		            // calculate invadeable neighbors
		            for (const tile of this.tiles)
		            {
		                const id = tile.userData.territoryId;
		                
		                if (id - 1 > 0)
		                    if (Math.trunc((id - 1) / this.width) == Math.trunc(id / this.width))
    		                    tile.invadeableNeighbors[0] = this.tiles[id - 1].userData.team != 1 ? this.tiles[id - 1] : null;
    		                
                        if (id + 1 < this.tiles.length)
                            if (Math.trunc((id + 1) / this.width) == Math.trunc(id / this.width))
                                tile.invadeableNeighbors[1] = this.tiles[id + 1].userData.team != 1 ? this.tiles[id + 1] : null;
		                    
	                    if (id - this.width > 0)
	                        tile.invadeableNeighbors[2]     = this.tiles[id - this.width].userData.team != 1 ? this.tiles[id - this.width] : null;
                        else
	                        tile.invadeableNeighbors[2]     = null
	                        
                        if (id + this.width < this.tiles.length)
	                        tile.invadeableNeighbors[3]     = this.tiles[id + this.width].userData.team != 1 ? this.tiles[id + this.width] : null;
                        else
                            tile.invadeableNeighbors[3]     = null
	                        
                        if (tile.invadeableNeighbors[0] === null &&
                            tile.invadeableNeighbors[1] === null &&
                            tile.invadeableNeighbors[2] === null &&
                            tile.invadeableNeighbors[3] === null)
                            {
                                tile.invadeableNeighbors = null;
                                console.log(id + " has no invadeable neighbors.");
                            }
		            }
			        
                    const floorGeometry = new THREE.PlaneGeometry(width + width * 1.3 + 3, height + height * 1.3 + 3);
                    const floorMaterial = new THREE.MeshBasicMaterial({color: 0x256d8f, side: THREE.FrontSide });
                    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
                    floor.position.x = width / 2 + 1.1 * width / 2 - 0.7;
                    floor.position.y = height / 2 + 1.1 * height / 2 - 0.7;
                    this.add(floor);
			    }
			    
			    update(deltaTime)
			    {
			        for (const tile of this.tiles)
		                tile.update(deltaTime);
	            }
	            
	            add(object)
	            {
	                object.world = this;
	                super.add(object);
	            }
			};
			
			const scene = new THREE.Scene();
			const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
			
			const cameraPosition = new THREE.Vector3(5 + 0.3 * 5, 5 + 0.3 * 5, 14);
			
			const renderer = new THREE.WebGLRenderer();
			renderer.setSize(window.innerWidth, window.innerHeight);
			document.body.appendChild(renderer.domElement);
			
			const htmlRenderer = new CSS2DRenderer();
			htmlRenderer.setSize(window.innerWidth, window.innerHeight);
			htmlRenderer.domElement.style.position = 'absolute';
			htmlRenderer.domElement.style.top = '0px';
			document.body.appendChild(htmlRenderer.domElement).style.pointerEvents = "none";
			
			let raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2, INTERSECTED;

			const clock = new THREE.Clock();
			
			window.addEventListener('resize', onWindowResize);
			
			document.addEventListener('keydown', onKeyDown);
			//document.addEventListener('keyup', onKeyUp);

            document.addEventListener('mousedown', onMouseDown);
            //document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('mousemove', onPointerMove);
            
            const world = new GameWorld(10, 5);
            world.position.x -= 3;
            world.position.y += 3;
			scene.add(world);
			
			const states = [
                "Place",
                "Attack",
                "Move"
		    ];
		    
			let gameState = 1;
			setGameState()
			
			let ownedTerritory = world.ownedTerritory;
			let availableUnits = Math.trunc(ownedTerritory / 3);
			$("#count").html(availableUnits);
            
            let selectedTerritory = null, attackTerritory = null;
			
			$(htmlRenderer.domElement).on("click", "#dropUnitButton", function(event)
			{
			    event.preventDefault();
			    
			    console.log("place");
			    
			    if (gameState != 0)
			    {
			        console.error("GameState must be 0 to place units.");
			        return;
			    }
			    
			    const amount = parseInt($("#dropUnitAmount").val());
			    
			    if (amount <= 0)
		        {
			        console.error("No available units to drop.");
			        return;
			    }
			    
			    if (amount > availableUnits)
			    {
			        console.error("Requested to drop too many units.");
			        return;
			    }
			   
                availableUnits -= amount;
                
                selectedTerritory.addUnits(amount);
                
                $("#count").html(availableUnits);
                
                dismissDropDialog();
			});
			
			$("body").on("click", "#nextStateButton", function(event)
			{
			    console.log("next state");
			    
			    event.preventDefault();
			    
			    nextGameState();
			});
			
			function nextGameState()
			{
			    if (gameState >= 2)
			        gameState = 0;
			    else
			        gameState += 1;
			        
                setGameState();
			}
			
			function setGameState()
			{
			    $(".roundSpace.active").removeClass("active");
			    $("#roundType").children()[gameState].classList.add("active");
			    $("#roundName").html(states[gameState]);
			    
			    $("#gameStatus").attr("data-state", gameState);
			}
			
		    function onHover(object)
		    {
                if (gameState == 0)
                {
                    if (selectedTerritory == null)
                        if (object.userData.team == 1)
		                    object.raise();
                }
                else if (gameState == 1)
                {
                    if (object.userData.team == 1) // picking the guy to attack from
                    {
                        // if we have selected a starting point, but not a destination
                        if (attackTerritory === null)
                        {
                            object.raise();
                            object.material.color.setHex(ownedHoverColor);
                        }
                    }
                    else // not on our team, we're picking who to attack
                    {
                        // TODO: not if we're allies maybe
                        
                        // we are picking from invadeable territories
                        if (selectedTerritory !== null && attackTerritory === null && object.userData.invadeable)
                        {
                            object.raise();
                            //object.material.color.setHex(enemyInvadeableHoverColor);
                            // TODO: need to do unhover logic for this one
                        }
                    }
                }
		    }
		    
		    function onStopHover(object)
		    {
		        if (gameState == 0)
		        {
		            object.lower();
		        }
		        else if (gameState == 1)
		        {
		            if (selectedTerritory != object &&
		                attackTerritory != object)
		                {
		                    object.lower();
		                    
		                    if (object.userData.team == 1)
		                        object.material.color.setHex(ownedColor);
		                }
		        }
		    }
			
			function createDropDialog(id)
			{
			    if (gameState != 0)
			    {
			        console.error("GameState must be 0 to place units.");
			        return;
			    }
			    
			    if (selectedTerritory !== null)
			    {
			        console.warn("Unit drop dialog is already open");
			        return;
			    }
			    
			    if (availableUnits <= 0)
			    {
			        console.warn("No available units.");
			        return
			    }
			    
			    selectedTerritory = scene.getObjectById(id);
			    
			    if (selectedTerritory == null)
			    {
			        console.error("Id passed in CreateDropDialog failed sanity check.");
			        return;
			    }
			    
			    // TODO: set hover color here
			    
			    selectedTerritory.createUnitPlaceDialog(availableUnits);
			    
			    console.log("Created drop dialog.");
			}
			
			function dismissDropDialog()
			{
			    selectedTerritory.destroyUnitPlaceDialog();
			    
			    // TODO: unset hover color here
			    
			    selectedTerritory = null;
			    
			    console.log("Dismissed drop dialog.");
			}
			
			function createAttackDiagram(id)
			{
			    if (selectedTerritory !== null)
			    {
			        console.log("A territory is already selected for something.");
			        return;
			    }
			    
			    const object = scene.getObjectById(id);
			    
			    if (object === null)
			    {
			        console.error("Id passed in CreateDropDialog failed sanity check.");
			        return;
			    }
			    
			    if (object.userData.team != 1)
			    {
			        console.error("This territory is not owned by you.");
			        return;
			    }
			    
			    if (object.invadeableNeighbors === null)
			    {
			        console.error("This territory does not border any enemy territory.");
			        return;
			    }
			    
			    selectedTerritory = object;
			    
			    for (const tile of selectedTerritory.getInvadeableNeighbors())
			    {
			        if (!(tile instanceof WorldObject))
			            continue;
			            
	                tile.material.color.setHex(enemyInvadeableColor);
	                tile.userData.invadeable = true;
			    }
			    
			    console.log("Created attack diagram for " + selectedTerritory.id);
			}
			
			function removeAttackDiagram()
			{
			    if (selectedTerritory === null)
			    {
			        console.error("selectedTerritorry is null.");
			        return;
			    }
			    
			    for (const tile of selectedTerritory.getInvadeableNeighbors())
			    {
			        if (!(tile instanceof WorldObject))
			            continue;
			        
			        tile.material.color.setHex(enemyColor);
			        tile.userData.invadeable = false;
			    }

                selectedTerritory.lower();
                selectedTerritory.material.color.setHex(ownedColor);
                
		        selectedTerritory = null;
		        
		        console.log("Attack diagram removed.");
			}
			
			function createAttackDialog(id)
			{
			    if (selectedTerritory === null)
			    {
			        console.error("selectedTerritory is not set.");
			        return;    
			    }
			    
			    if (attackTerritory !== null)
			    {
			        console.error("attackTerritory is already set.");
			        return;    
			    }
			    
			    const attackTarget = scene.getObjectById(id);
	    
			    if (attackTarget === null)
			    {
			        console.error(id + " is not a valid attack target.");
			        return;
			    }
			    
			    if (!attackTarget.userData.invadeable)
			    {
			        console.error("Tile " + attackTarget.id + " cannot be invaded from " + selectedTerritory.id + ".");
			        return;
			    }
			    
			    attackTerritory = attackTarget;
			    
			    attackTerritory.material.color.setHex(enemySelectedColor);
			    
                for (const tile of selectedTerritory.getInvadeableNeighbors())
                {
                    if (!(tile instanceof WorldObject))
                        continue;
                    
		            if (tile != attackTerritory)
                        tile.material.color.setHex(enemyInvadeablePausedColor);
			    }
			    
			    $(".gameInterfaceContainer").attr("data-visibility", "hidden");
			    
		        console.log(`Attack Dialog created for ${selectedTerritory.id} to attack ${attackTerritory.id}`);
			}
			
			function removeAttackDialog()
			{
			    if (attackTerritory === null)
			    {
			        console.error("attackTerritory is invalid: " + attackTerritory);
			        return;
			    }
			    
			    attackTerritory.lower();
			    attackTerritory.material.color.setHex(enemyInvadeableColor);
			    
			    attackTerritory = null;
			    selectedTerritory = null;
			    
			    $(".gameInterfaceContainer").attr("data-visibility", null);
			    
			    console.log("Attack dialog removed.");
			}
			
            function onMouseDown(event)
            {
                // FIXME: this is a bug.
                
                if (INTERSECTED == null)
                    return;
                    
                if (INTERSECTED.id == selectedTerritory || INTERSECTED.id == attackTerritory)
                    return;
                    
                if (INTERSECTED.userData.team == 1)
                {
                    if (gameState == 0)
                        if (selectedTerritory === null)
                            createDropDialog(INTERSECTED.id);
                    if (gameState == 1)
                        if (attackTerritory === null)
                        {
                            if (selectedTerritory !== null)
                            {
                                if (INTERSECTED.id == selectedTerritory.id)
                                {
                                    console.error("This tile is already selected.");
                                    return;
                                }
                                
                                console.log("selectedTerritory already exists, clearing attack diagram first.");
                                removeAttackDiagram();
                            }
                            
                            createAttackDiagram(INTERSECTED.id);
                        }
                }
                else if (INTERSECTED.userData.team == 2)
                    if (gameState == 1)
                        if (selectedTerritory !== null && attackTerritory === null)
                            createAttackDialog(INTERSECTED.id);
            }
            
            function onKeyDown(event)
            {
                if (event.code == "Escape")
                    if (gameState == 0)
                        dismissDropDialog();
                    else if (gameState == 1)
                        if (selectedTerritory !== null && attackTerritory === null)
                            removeAttackDiagram();
                        else if (attackTerritory !== null && selectedTerritory !== null)
                        {
                            const id = selectedTerritory.id;
                            
                            removeAttackDialog();
                            createAttackDiagram(id);
                        }
            }
			
            function onPointerMove(event)
            {
            	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            }
			
			function onWindowResize()
			{
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize(window.innerWidth, window.innerHeight);
				htmlRenderer.setSize(window.innerWidth, window.innerHeight);
			}
			
			function animate()
			{
				requestAnimationFrame(animate);
				
            	raycaster.setFromCamera(pointer, camera);
            	const intersects = raycaster.intersectObjects(scene.children, true);
            
            	if (intersects.length > 0)
            	{
            		if (INTERSECTED != intersects[0].object)
            		{
            			if (INTERSECTED) // the object is no longer hovered, and we're hovering over another object
            			{
            			    onStopHover(INTERSECTED);
            			    INTERSECTED = null;
            			}
            
                        if (intersects[0].object.userData.hasOwnProperty("canClick")) // the object is now hovered
                        {
            				INTERSECTED = intersects[0].object;
                            onHover(INTERSECTED);
                        }
            		}
            	}
            	else if (INTERSECTED !== null)// the object is no longer hovered, and no object is hovered
            	{
            	    onStopHover(INTERSECTED);
            		INTERSECTED = null;
            	}
                
                camera.position.lerp(cameraPosition, 0.2);
				
				world.update(clock.getElapsedTime());
				
				renderer.render(scene, camera);
				htmlRenderer.render(scene, camera);
			};
			
			<?php
			
			    if (!isset($_GET['skipLoading']))
		            echo "
			// remove loading cover
			setTimeout(function()
			{
				document.getElementById('loadingCover').style.opacity = '0';
				
				setTimeout(function() 
				{
    				document.getElementById('loadingCover').remove();
				}, 1000);
			}, 1000);";
			
			?>
			
			animate();
		</script>
	</body>
</html>
