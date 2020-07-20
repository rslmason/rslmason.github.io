const defaultHitOrder = [0,1,2,3,4,5,6,7,8,9,10];		// "11" is deliberately omitted here since it's the PDS and can't be hit.
const defaultShotOrder = [0,1,2,3,4,5,5,5,6,6];			// The sustain indices as well as the PDS are omitted. Sustains for obvious reasons and PDS is omitted again since it will not fire every round. two default flagship shots are included here, but that is variable by race.
const defaultBattleValues = [
	9, // 0 Fighter
	9, // 1 Destroyer
	7, // 2 Cruiser
	9, // 3 Carrier
	5, // 4 Dreadnought
	3, // 5 War Sun
	5, // 6 Flagship	- a guess
	0, // 7 C sustain	
	0, // 8 D sustain
	0, // 9 W sustain
	0, // 10 F sustain
	6  // 11 PDS
];
const defaultStats = [
[1,1],	// [1,1] is two AFB shots for destroyers. For upgraded it would be [1,1,1]. This should be [1,1,6,6,6,6] for Saar since their flagship has AFB or [1,1,1,6,6,6,6] with upgraded Destroyers
[0]// this is substracted from destroyer battle value ahead of AFB. For upgraded Destroyers it should be 2. NOthing changes this value at present.
// flagship PDS?
];
const shipNames = [
	"Fighter", 				//	 0
	"Destroyer", 			//	 1	
	"Cruiser", 				//	 2
	"Carrier", 				//	 3
	"Dreadnought", 			//	 4
	"WarSun", 				//	 5
	"Flagship", 			//	 6
	"CarrierSustain", 		//	 7
	"DreadnoughtSustain", 	//	 8
	"WarSunSustain", 		//	 9
	"FlagshipSustain",		//	10
	"PDS" 					//	11
];

function Fleet(ships, battles = defaultBattleValues, stats = defaultStats, shots = defaultShotOrder, hits = defaultHitOrder) {
	this.shipArray = ships.slice();
	// shipArray needs a loop that takes ships numbers and includes relevant sustain values.
	this.battleArray = battles.slice();
	this.fleetStats = stats.slice();
	this.shotOrder = shots.slice();
	this.hitOrder = hits.slice();
	//need to make sure that illegal hit orders, etc. don't get passed in that would make certain ships never be destroyed. 
	
	
	this.rollHits = function (b = defaultShotOrder){
		let hitTotal = 0;
		for (let shipIndex of b)
			for (let j=0;j<this.shipArray[shipIndex];j++){
				if (dieHit(this.battleArray[shipIndex])) {hitTotal ++}
			}
		return hitTotal;
	}
	
	this.assignHits = function (hits, b = this.hitOrder, c = []) {

		while (c.length > 0 && hits > 0) { // if a special token ship order was passed in, shoot those first.
			this.shipArray[c.pop()] --;
			hits --;
		}

		for (shipIndex of b){														// shoot in the default order, or the order passed in.
			if (this.shipArray[shipIndex] > hits){
				this.shipArray[shipIndex] = this.shipArray[shipIndex] - hits;
				hits = 0;
				break;
			}
			else { //else if (this.shipArray[shipIndex] <= hits){
				hits = hits - this.shipArray[shipIndex]; 
				this.shipArray[shipIndex]=0; // could consider popping this instead! (what's better for memory?
			}
		}	
	}
	
	this.checkDestroyed = function (){
		for (let i = this.hitOrder.length -1; i>= 0; i-- ){ // loop backwards to save time: first ships in the order are the ones most likely to be gone.
			if (this.shipArray[i]>0){return false};
		}
		return true;
	}
}

function dieHit(battleValue){
	if (Math.ceil(Math.random()*10)>=battleValue){return true};
	return false;
}

function fleetBattle (firstFleet, secondFleet){
	let g = 0, h = 0;
	// Pre-Combat Shots
		//
	// PDS
		secondFleet.assignHits(firstFleet.rollHits([11])); 	// Roll with the PDS. But could make this a fleet stat to give PDS for Xxcha flagship, etc.
		firstFleet.assignHits(secondFleet.rollHits([11]));	// 
	// Anti-Fighter Barrage	// could maybe have a 'set AFB value' function.
		firstFleet.battleArray[1] -= firstFleet.fleetStats[1][0];	// adjust destroyer battle value for AFB
		secondFleet.battleArray[1] -= secondFleet.fleetStats[1][0];
		secondFleet.assignHits(firstFleet.rollHits(firstFleet.fleetStats[0]),[0]); 	// fleetStats[0] is "[1,1]" if AFB will fire twice, and "[1,1,1]" if three times.
		firstFleet.assignHits(secondFleet.rollHits(secondFleet.fleetStats[0]),[0]);	// the second argument, "[0]", instructs assignHits only to apply these hits to fighters.
		firstFleet.battleArray[1] +=  firstFleet.fleetStats[1][0];	// adjust destroyers back.
		secondFleet.battleArray[1] += secondFleet.fleetStats[1][0];

	while (true){
		g = firstFleet.rollHits();
		h = secondFleet.rollHits();
		firstFleet.assignHits(h);
		secondFleet.assignHits(g);
		if (firstFleet.checkDestroyed() && secondFleet.checkDestroyed()){return 2}
		else if (firstFleet.checkDestroyed()) {return 1}
		else if (secondFleet.checkDestroyed()) {return 0}
	}
}

// original hardcoded fleet construction within battle loop.
// // for (let i=0;i<iterations;i++){
	// // let fleetOne = new Fleet([
		// // 0,	// Fighter
		// // 0,	// Destroyer
		// // 2,	// Cruiser
		// // 0,	// Carrier
		// // 0,	// Dreadnought
		// // 0,	// War Sun
		// // 0,	// Flagship
		// // 0,	// Carrier Sustain
		// // 0,	// Dreadnought Sustain
		// // 0,	// War Sun Sustain
		// // 0,	// Flagship Sustain
		// // 0	// PDS
	// // ]);
	// // let fleetTwo = new Fleet([
		// // 0,	// Fighter
		// // 0,	// Destroyer
		// // 0,	// Cruiser
		// // 0,	// Carrier
		// // 1,	// Dreadnought
		// // 0,	// War Sun
		// // 0,	// Flagship
		// // 0,	// Carrier Sustain
		// // 1,	// Dreadnought Sustain
		// // 0,	// War Sun Sustain
		// // 0,	// Flagship Sustain
		// // 0	// PDS
	// // ]);
	// // outcomeArray[fleetBattle(fleetOne,fleetTwo)] ++;
	// // //console.log("result: " + fleetBattle(fleetOne,fleetTwo))
	// // }
// console.log(
// "Fleet One: " + (outcomeArray[0]/(iterations/100)).toFixed(1) + 
// "\nFleet Two: " + (outcomeArray[1]/(iterations/100)).toFixed(1) +
// "\nTie      : " + (outcomeArray[2]/(iterations/100)).toFixed(1))

var outcomeArray = [0,0,0];
var iterations = 1000;
var fleetChange = true;
var prevIterations = 0;
var fleetArray = [];
function collectorFunction (){
//	let fleetNumbers = ["one","two"];
//	let fleetArray = [];

//	fleetOneArray = [];
//	fleetTwoArray = [];

	if (fleetChange) {
		outcomeArray = [0,0,0]
		iterations = 1000;
		prevIterations = 0;
		fleetArray["one"] = [];
		fleetArray["two"] = [];
		for (fleetNum of ["one","two"]){
			for (let i = 0; i<6;i++){
				fleetArray[fleetNum].push(document.getElementById(fleetNum+shipNames[i]).value);
			}
		}
	}
	else {
		prevIterations += iterations;
	}
	
	for (let i=0;i<iterations;i++){
//		let fleetOne = new Fleet(fleetOneArray);
//		let fleetTwo = new Fleet(fleetTwoArray);
		let fleetOne = new Fleet(fleetArray["one"]);
		let fleetTwo = new Fleet(fleetArray["two"]);
		outcomeArray[fleetBattle(fleetOne,fleetTwo)] ++;
	}
	
	let tempString = 
	  "Fleet One: " + (outcomeArray[0]/((prevIterations+iterations)/100)).toFixed(1) + "%" + 
	"\nFleet Two: " + (outcomeArray[1]/((prevIterations+iterations)/100)).toFixed(1) + "%" +
	      "\nTie: " + (outcomeArray[2]/((prevIterations+iterations)/100)).toFixed(1) + "%"
	

	document.getElementById("outputParagraph").innerHTML = tempString;
	document.getElementById("outputParagraphTwo").innerHTML = "Total Iterations of These Fleet Configurations: " + (iterations+prevIterations);
	fleetChange = false;
}


var myButton = document.getElementById("theButton");
var myInput = document.getElementById("oneFighter");

for (fleetNum of ["one","two"]) {
	for (i=0;i<6;i++){
	let tempInput = document.getElementById(fleetNum+shipNames[i]);
//	tempInput.addEventListener('change', (event) => myButton.innerHTML="bla");
	tempInput.addEventListener('change', (event) => fleetChange = true); // stole this code from online somewhere.
	}
}	
	
//myInput.addEventListener('change', (event) => myButton.innerHTML="bla");

myButton.onclick = collectorFunction;

