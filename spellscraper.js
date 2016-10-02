/*
	This script is used to scrape and generate a JSON object with all the D&D spells from the basic
	rules.

	Tested in Chrome by pasting the following code into the console on this page:
	http://dnd.wizards.com/products/tabletop/players-basic-rules

	TODO: 
	* fix range
	* finish properties for spells.
	* Generate multiple useful sortings of spells ie: different keys to look spells up
		examples:
		* spell levels
		* Classes
		* spell names
	* Create a function to easily add more spells
	* Output in multiple formats: json, cson, yaml, etc.
	* Create webpage to view spells
	
*/

var spellLevels = $('#howtoplay_1941').parent().children('dd');
var currentSpellLevel = 0;

var spellDB = {};

// Spell 
// {
// 	name: string,
// 	lvl: int,
// 	school: string
// 	castTime: {
// 		quantity: int,
// 		human: string,
// 		unit: string
// 	}
// 	range: {
// 		shape: string, //cone, sphere, cube, line, point
// 		distance: string, //self feet
// 		quantity: int, //0 means self
// 	},
// 	componentsArray: [strings],
// 	components : {
// 		v: boolean,
// 		m: boolean,
// 		s: boolean,
// 		materials: [strings]
// 	},
// 	duration: {
// 		human: string,
// 		quantity: int,
// 		unit: string
// 	},
// 	description: string,
// 	casterClassArray: [string],
// 	casters: {
// 		cleric: boolean,
// 		wizard: boolean,
// 		sorcerer: boolean,
// 		etc: boolean
// 	}
// }

function getSchool(theText) {
	var words = theText.split(' ')
	if (words.length < 2) return null;
	if (words[1] === 'cantrip') return words[0].toLowerCase();

	return words[1].toLowerCase();
}

function splitMeasurements(theText) {
	console.log(theText);
	var measurement = {};
	var tmp = theText.split(' ');

	measurement.human = theText;
	measurement.quantity = parseInt(tmp[0]);

	if (tmp.length < 2) {
		measurement.unit = null;
		return measurement;	
	} 

	var lastChar = tmp[1].charAt(tmp[1].length - 1);
	var theUnit = tmp[1];
	if (theUnit === 'bonus') {
		theUnit = 'bonus action';
	} else if(lastChar === 's' || lastChar === ',') {
		theUnit = theUnit.slice(0,-1);
	} else if (lastChar === ')') {
		// console.log(theText);
	}

	measurement.unit = theUnit;

	return measurement;
}

class Spell {
	constructor(name, spellDiv) {
		// var theSpell = {};
		this.lvl = currentSpellLevel;
		this.name = name;
		var tmp = spellDiv.find('dl dd');
		this.school = getSchool(spellDiv.find('h6').text());
		this.castTime = splitMeasurements(tmp.first().text());
		this.range = splitMeasurements($(tmp[1]).text());
		return this;
	}	
}


function getAllSpellsForLevel(spellList) {
	// console.log(spellList)
	// console.log("LEVEL %d SPELLS", currentSpellLevel)
	var currentLevelSpells = {}
	var currentSpell = {};
	var currDiv;
	var currentName;

	// spellList.find('div.spell_list').children().each(function(k,v) {
	spellList.children().each(function(k,v) {
		currDiv = $(v);
		// console.log(currDiv);
		if( currDiv.is('dt')) {
			currentName = currDiv.find('span').text();
		} else if (currDiv.is('dd')) {
			currentSpell = new Spell(currentName, currDiv.find('.wrap'));
			// console.log(currentSpell.castTime.unit);
			currentLevelSpells[currentSpell.name] = currentSpell;
		}
		
	});
	return currentLevelSpells;
}

spellLevels.each(function(index, value){
	var currentLvlDiv = $(value);
	spellDB[currentSpellLevel] = getAllSpellsForLevel(currentLvlDiv.find('.spell_list'));
	currentSpellLevel++;
});

console.log(spellDB);


var rangeCategories = {};
for(var i=0; i < 10; i++) {
	console.log("Spell Level %d", i);
	
	Object.keys(spellDB[i]).forEach(function(value, index){
		if (rangeCategories[spellDB[i][value].range.unit])
			rangeCategories[spellDB[i][value].range.unit] += 1;
		else
			rangeCategories[spellDB[i][value].range.unit] = 1;
	})
}
console.log(rangeCategories);

var castTimeCategories = {};
for(var i=0; i < 10; i++) {
	console.log("Spell Level %d", i);
	
	Object.keys(spellDB[i]).forEach(function(value, index){
		if (castTimeCategories[spellDB[i][value].castTime.unit])
			castTimeCategories[spellDB[i][value].castTime.unit] += 1;
		else
			castTimeCategories[spellDB[i][value].castTime.unit] = 1;
	})
}
console.log(castTimeCategories);
