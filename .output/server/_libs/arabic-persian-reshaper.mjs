import { t as __commonJSMin } from "../_runtime.mjs";
//#region node_modules/arabic-persian-reshaper/PersianShaper.js
var require_PersianShaper = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Node Arabic & Persian String Reshaper by Shen Yiming (https://github.com/soimy/arabic-persian-reshaper)
	* Forked from (https://github.com/font-store/persian-reshaper)
	* Based on (https://raw.github.com/Accorpa/Arabic-Converter-From-and-To-Arabic-Presentation-Forms-B/)
	*/
	var charsMap = [
		[
			1569,
			65152,
			null,
			null,
			null
		],
		[
			1570,
			65153,
			null,
			null,
			65154
		],
		[
			1571,
			65155,
			null,
			null,
			65156
		],
		[
			1572,
			65157,
			null,
			null,
			65158
		],
		[
			1573,
			65159,
			null,
			null,
			65160
		],
		[
			1574,
			65161,
			65163,
			65164,
			65162
		],
		[
			1575,
			65165,
			null,
			null,
			65166
		],
		[
			1576,
			65167,
			65169,
			65170,
			65168
		],
		[
			1577,
			65171,
			null,
			null,
			65172
		],
		[
			1578,
			65173,
			65175,
			65176,
			65174
		],
		[
			1579,
			65177,
			65179,
			65180,
			65178
		],
		[
			1580,
			65181,
			65183,
			65184,
			65182
		],
		[
			1581,
			65185,
			65187,
			65188,
			65186
		],
		[
			1582,
			65189,
			65191,
			65192,
			65190
		],
		[
			1583,
			65193,
			null,
			null,
			65194
		],
		[
			1584,
			65195,
			null,
			null,
			65196
		],
		[
			1585,
			65197,
			null,
			null,
			65198
		],
		[
			1586,
			65199,
			null,
			null,
			65200
		],
		[
			1688,
			64394,
			null,
			null,
			64395
		],
		[
			1587,
			65201,
			65203,
			65204,
			65202
		],
		[
			1588,
			65205,
			65207,
			65208,
			65206
		],
		[
			1589,
			65209,
			65211,
			65212,
			65210
		],
		[
			1590,
			65213,
			65215,
			65216,
			65214
		],
		[
			1591,
			65217,
			65219,
			65220,
			65218
		],
		[
			1592,
			65221,
			65223,
			65224,
			65222
		],
		[
			1593,
			65225,
			65227,
			65228,
			65226
		],
		[
			1594,
			65229,
			65231,
			65232,
			65230
		],
		[
			1600,
			1600,
			1600,
			1600,
			1600
		],
		[
			1601,
			65233,
			65235,
			65236,
			65234
		],
		[
			1602,
			65237,
			65239,
			65240,
			65238
		],
		[
			1603,
			65241,
			65243,
			65244,
			65242
		],
		[
			1604,
			65245,
			65247,
			65248,
			65246
		],
		[
			1605,
			65249,
			65251,
			65252,
			65250
		],
		[
			1606,
			65253,
			65255,
			65256,
			65254
		],
		[
			1607,
			65257,
			65259,
			65260,
			65258
		],
		[
			1608,
			65261,
			null,
			null,
			65262
		],
		[
			1609,
			65263,
			null,
			null,
			65264
		],
		[
			1610,
			65265,
			65267,
			65268,
			65266
		],
		[
			1740,
			64508,
			64510,
			64511,
			64509
		],
		[
			1670,
			64378,
			64380,
			64381,
			64379
		],
		[
			1662,
			64342,
			64344,
			64345,
			64343
		],
		[
			1711,
			64402,
			64404,
			64405,
			64403
		],
		[
			1705,
			64398,
			64400,
			64401,
			64399
		]
	];
	var combCharsMap = [[
		[1604, 1575],
		65275,
		null,
		null,
		65276
	]];
	var transChars = [
		1552,
		1554,
		1555,
		1556,
		1557,
		1611,
		1612,
		1613,
		1614,
		1615,
		1616,
		1617,
		1618,
		1619,
		1620,
		1621,
		1622,
		1623,
		1624,
		1648,
		1750,
		1751,
		1752,
		1753,
		1754,
		1755,
		1756,
		1759,
		1760,
		1761,
		1762,
		1763,
		1764,
		1767,
		1768,
		1770,
		1771,
		1772,
		1773
	];
	function CharacterMapContains(c) {
		for (var i = 0; i < charsMap.length; ++i) if (charsMap[i][0] == c) return true;
		return false;
	}
	function GetCharRep(c) {
		for (var i = 0; i < charsMap.length; ++i) if (charsMap[i][0] == c) return charsMap[i];
		return false;
	}
	function GetCombCharRep(c1, c2) {
		for (var i = 0; i < combCharsMap.length; ++i) if (combCharsMap[i][0][0] == c1 && combCharsMap[i][0][1] == c2) return combCharsMap[i];
		return false;
	}
	function IsTransparent(c) {
		for (var i = 0; i < transChars.length; ++i) if (transChars[i] == c) return true;
		return false;
	}
	function convertArabic(normal) {
		var crep, combcrep, shaped = "";
		for (var i = 0; i < normal.length; ++i) {
			var current = normal.charCodeAt(i);
			if (CharacterMapContains(current)) {
				var prev = null, next = null, prevID = i - 1, nextID = i + 1;
				for (; prevID >= 0; --prevID) if (!IsTransparent(normal.charCodeAt(prevID))) break;
				prev = prevID >= 0 ? normal.charCodeAt(prevID) : null;
				crep = prev ? GetCharRep(prev) : false;
				if (crep[2] == null && crep[3] == null) prev = null;
				for (; nextID < normal.length; ++nextID) if (!IsTransparent(normal.charCodeAt(nextID))) break;
				next = nextID <= normal.length ? normal.charCodeAt(nextID) : null;
				crep = next ? GetCharRep(next) : false;
				if (crep[3] == null && crep[4] == null) next = null;
				if (current == 1604 && next != null && (next == 1570 || next == 1571 || next == 1573 || next == 1575)) {
					combcrep = GetCombCharRep(current, next);
					if (prev != null) shaped += String.fromCharCode(combcrep[4]);
					else shaped += String.fromCharCode(combcrep[1]);
					i = i + 1;
					continue;
				}
				crep = GetCharRep(current);
				if (prev != null && next != null && crep[3] != null) {
					shaped += String.fromCharCode(crep[3]);
					continue;
				} else if (prev != null && crep[4] != null) {
					shaped += String.fromCharCode(crep[4]);
					continue;
				} else if (next != null && crep[2] != null) {
					shaped += String.fromCharCode(crep[2]);
					continue;
				} else shaped += String.fromCharCode(crep[1]);
			} else shaped += String.fromCharCode(current);
		}
		return shaped;
	}
	exports.convertArabic = convertArabic;
	function convertArabicBack(apfb) {
		var toReturn = "", selectedChar;
		theLoop: for (var i = 0; i < apfb.length; ++i) {
			selectedChar = apfb.charCodeAt(i);
			for (var j = 0; j < charsMap.length; ++j) if (charsMap[j][4] == selectedChar || charsMap[j][2] == selectedChar || charsMap[j][1] == selectedChar || charsMap[j][3] == selectedChar) {
				toReturn += String.fromCharCode(charsMap[j][0]);
				continue theLoop;
			}
			for (var j = 0; j < combCharsMap.length; ++j) if (combCharsMap[j][4] == selectedChar || combCharsMap[j][2] == selectedChar || combCharsMap[j][1] == selectedChar || combCharsMap[j][3] == selectedChar) {
				toReturn += String.fromCharCode(combCharsMap[j][0][0]) + String.fromCharCode(combCharsMap[j][0][1]);
				continue theLoop;
			}
			toReturn += String.fromCharCode(selectedChar);
		}
		return toReturn;
	}
	exports.convertArabicBack = convertArabicBack;
}));
//#endregion
//#region node_modules/arabic-persian-reshaper/ArabicShaper.js
var require_ArabicShaper = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	*
	*	Edited By Alex Clay to add Arabic characters not included in Persian.
	*	https://github.com/alex-clay/arabic-persian-reshaper
	*
	* Node Arabic & Persian String Reshaper by Shen Yiming (https://github.com/soimy/arabic-persian-reshaper)
	* Forked from (https://github.com/font-store/persian-reshaper)
	* Based on (https://raw.github.com/Accorpa/Arabic-Converter-From-and-To-Arabic-Presentation-Forms-B/)
	*/
	var charsMap = [
		[
			1569,
			65152,
			null,
			null,
			null
		],
		[
			1570,
			65153,
			null,
			null,
			65154
		],
		[
			1571,
			65155,
			null,
			null,
			65156
		],
		[
			1572,
			65157,
			null,
			null,
			65158
		],
		[
			1573,
			65159,
			null,
			null,
			65160
		],
		[
			1574,
			65161,
			65163,
			65164,
			65162
		],
		[
			1575,
			65165,
			null,
			null,
			65166
		],
		[
			1576,
			65167,
			65169,
			65170,
			65168
		],
		[
			1577,
			65171,
			null,
			null,
			65172
		],
		[
			1578,
			65173,
			65175,
			65176,
			65174
		],
		[
			1579,
			65177,
			65179,
			65180,
			65178
		],
		[
			1580,
			65181,
			65183,
			65184,
			65182
		],
		[
			1581,
			65185,
			65187,
			65188,
			65186
		],
		[
			1582,
			65189,
			65191,
			65192,
			65190
		],
		[
			1583,
			65193,
			null,
			null,
			65194
		],
		[
			1584,
			65195,
			null,
			null,
			65196
		],
		[
			1585,
			65197,
			null,
			null,
			65198
		],
		[
			1586,
			65199,
			null,
			null,
			65200
		],
		[
			1688,
			64394,
			null,
			null,
			64395
		],
		[
			1587,
			65201,
			65203,
			65204,
			65202
		],
		[
			1588,
			65205,
			65207,
			65208,
			65206
		],
		[
			1589,
			65209,
			65211,
			65212,
			65210
		],
		[
			1590,
			65213,
			65215,
			65216,
			65214
		],
		[
			1591,
			65217,
			65219,
			65220,
			65218
		],
		[
			1592,
			65221,
			65223,
			65224,
			65222
		],
		[
			1593,
			65225,
			65227,
			65228,
			65226
		],
		[
			1594,
			65229,
			65231,
			65232,
			65230
		],
		[
			1600,
			1600,
			1600,
			1600,
			1600
		],
		[
			1601,
			65233,
			65235,
			65236,
			65234
		],
		[
			1602,
			65237,
			65239,
			65240,
			65238
		],
		[
			1603,
			65241,
			65243,
			65244,
			65242
		],
		[
			1604,
			65245,
			65247,
			65248,
			65246
		],
		[
			1605,
			65249,
			65251,
			65252,
			65250
		],
		[
			1606,
			65253,
			65255,
			65256,
			65254
		],
		[
			1607,
			65257,
			65259,
			65260,
			65258
		],
		[
			1608,
			65261,
			null,
			null,
			65262
		],
		[
			1609,
			65263,
			64488,
			64489,
			64509
		],
		[
			1610,
			65265,
			65267,
			65268,
			65266
		],
		[
			1740,
			64508,
			64510,
			64511,
			65264
		],
		[
			1670,
			64378,
			64380,
			64381,
			64379
		],
		[
			1662,
			64342,
			64344,
			64345,
			64343
		],
		[
			1711,
			64402,
			64404,
			64405,
			64403
		],
		[
			1705,
			64398,
			64400,
			64401,
			64399
		]
	];
	var combCharsMap = [
		[
			[1604, 1570],
			65269,
			null,
			null,
			65270
		],
		[
			[1604, 1571],
			65271,
			null,
			null,
			65272
		],
		[
			[1604, 1573],
			65273,
			null,
			null,
			65274
		],
		[
			[1604, 1575],
			65275,
			null,
			null,
			65276
		]
	];
	var transChars = [
		1552,
		1554,
		1555,
		1556,
		1557,
		1611,
		1612,
		1613,
		1614,
		1615,
		1616,
		1617,
		1618,
		1619,
		1620,
		1621,
		1622,
		1623,
		1624,
		1648,
		1750,
		1751,
		1752,
		1753,
		1754,
		1755,
		1756,
		1759,
		1760,
		1761,
		1762,
		1763,
		1764,
		1767,
		1768,
		1770,
		1771,
		1772,
		1773
	];
	function CharacterMapContains(c) {
		for (var i = 0; i < charsMap.length; ++i) if (charsMap[i][0] == c) return true;
		return false;
	}
	function GetCharRep(c) {
		for (var i = 0; i < charsMap.length; ++i) if (charsMap[i][0] == c) return charsMap[i];
		return false;
	}
	function GetCombCharRep(c1, c2) {
		for (var i = 0; i < combCharsMap.length; ++i) if (combCharsMap[i][0][0] == c1 && combCharsMap[i][0][1] == c2) return combCharsMap[i];
		return false;
	}
	function IsTransparent(c) {
		for (var i = 0; i < transChars.length; ++i) if (transChars[i] == c) return true;
		return false;
	}
	function convertArabic(normal) {
		var crep, combcrep, shaped = "";
		for (var i = 0; i < normal.length; ++i) {
			var current = normal.charCodeAt(i);
			if (CharacterMapContains(current)) {
				var prev = null, next = null, prevID = i - 1, nextID = i + 1;
				for (; prevID >= 0; --prevID) if (!IsTransparent(normal.charCodeAt(prevID))) break;
				prev = prevID >= 0 ? normal.charCodeAt(prevID) : null;
				crep = prev ? GetCharRep(prev) : false;
				if (crep[2] == null && crep[3] == null) prev = null;
				for (; nextID < normal.length; ++nextID) if (!IsTransparent(normal.charCodeAt(nextID))) break;
				next = nextID <= normal.length ? normal.charCodeAt(nextID) : null;
				crep = next ? GetCharRep(next) : false;
				if (crep[3] == null && crep[4] == null) next = null;
				if (current == 1604 && next != null && (next == 1570 || next == 1571 || next == 1573 || next == 1575)) {
					combcrep = GetCombCharRep(current, next);
					if (prev != null) shaped += String.fromCharCode(combcrep[4]);
					else shaped += String.fromCharCode(combcrep[1]);
					i = i + 1;
					continue;
				}
				crep = GetCharRep(current);
				if (prev != null && next != null && crep[3] != null) {
					shaped += String.fromCharCode(crep[3]);
					continue;
				} else if (prev != null && crep[4] != null) {
					shaped += String.fromCharCode(crep[4]);
					continue;
				} else if (next != null && crep[2] != null) {
					shaped += String.fromCharCode(crep[2]);
					continue;
				} else shaped += String.fromCharCode(crep[1]);
			} else shaped += String.fromCharCode(current);
		}
		return shaped;
	}
	exports.convertArabic = convertArabic;
	function convertArabicBack(apfb) {
		var toReturn = "", selectedChar;
		theLoop: for (var i = 0; i < apfb.length; ++i) {
			selectedChar = apfb.charCodeAt(i);
			for (var j = 0; j < charsMap.length; ++j) if (charsMap[j][4] == selectedChar || charsMap[j][2] == selectedChar || charsMap[j][1] == selectedChar || charsMap[j][3] == selectedChar) {
				toReturn += String.fromCharCode(charsMap[j][0]);
				continue theLoop;
			}
			for (var j = 0; j < combCharsMap.length; ++j) if (combCharsMap[j][4] == selectedChar || combCharsMap[j][2] == selectedChar || combCharsMap[j][1] == selectedChar || combCharsMap[j][3] == selectedChar) {
				toReturn += String.fromCharCode(combCharsMap[j][0][0]) + String.fromCharCode(combCharsMap[j][0][1]);
				continue theLoop;
			}
			toReturn += String.fromCharCode(selectedChar);
		}
		return toReturn;
	}
	exports.convertArabicBack = convertArabicBack;
}));
//#endregion
//#region node_modules/arabic-persian-reshaper/index.js
var require_arabic_persian_reshaper = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		PersianShaper: require_PersianShaper(),
		ArabicShaper: require_ArabicShaper()
	};
}));
//#endregion
export { require_arabic_persian_reshaper as t };
