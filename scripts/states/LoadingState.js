import { loadFont } from 'https://kerrishaus.com/assets/threejsaddons/r159/FontLoader.js';

import { State } from "./State.js";

import { MainMenuState } from "./MainMenuState.js";

export class LoadingState extends State
{
	init()
	{
        $("head").append("<link rel='stylesheet' id='loadingStyles' href='./styles/LoadingState.css' />");

        $("body").prepend(
           `<div id='loadingCover'>
                <div id='status'>
                    <img id='kerris' src='https://kerrishaus.com/assets/logo/text-big.png'></img>
                    <img id='threejs' src='https://raw.githubusercontent.com/mrdoob/three.js/43ec48015f23bda9c2a86533343ab3a2e104bfd6/files/icon.svg'></img>
                    <img id='webgl' src='https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/WebGL_Logo.svg/1024px-WebGL_Logo.svg.png'></img>
                </div>
                <div id='progressContainer'>
                    <progress id="progress"></progress>
                    <h1 id="progressText">Loading...</h1>
                </div>
                <div id='help'>
                    Copyright &copy;&nbsp;<span translate='no'>Kerris Haus</span>
                </div>
            </div>`
        );

        $("#progress").attr("max", 1);
        $("#progress").val(0);

        new Promise(async (resolve) =>
        {
            $("#progressText").text("Loading");

            await loadFont("Arial");
            $("#progress").val(1);

            resolve(true);
        }).then(() =>
        {
            $("#progressText").text("Ready!");
            stateManager.popState();
        });
	}
    
	cleanup()
	{
        setTimeout(() => {
            // load the new state first so that all the assets are loaded
            // and we don't get super bad popping
            stateManager.pushState(new MainMenuState());
    
            $("#loadingCover").fadeOut(1000, function() {
                $(this).remove(); 
                $("#loadingStyles").remove();
            });
        }, 1000);
	}
};