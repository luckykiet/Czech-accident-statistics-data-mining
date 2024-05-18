import { access, constants, mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

import { decode } from 'windows-1250';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const inputDelimiter = ';';
const outputDelimiter = ';';

const parseFile = async (filename) => {
	try {
		const file = getFilenameAndExtension(filename);
		const input = await readFile(filename);
		const data = decode(input);

		let csvContent = '';
		let first = true;
		displayedHeaders.forEach((header, index) => {
			if (!Unknown.includes(header)) {
				if (first) {
					csvContent += dictionary[header.trim()]
						? dictionary[header.trim()].label
						: header.trim();
					first = false;
				} else {
					csvContent += outputDelimiter;
					csvContent += dictionary[header.trim()]
						? dictionary[header.trim()].label
						: header.trim();
				}
			}
		});
		const array = data.split('\n');
		array.forEach((row, i) => {
			const fields = row.split(inputDelimiter);
			let line = '';
			let first = true;
			for (let index = 0; index < displayedHeaders.length; index++) {
				if (!Unknown.includes(displayedHeaders[index])) {
					if (!fields[index]) {
						line += outputDelimiter;
					} else {
						// skip unknown columns
						const field = fields[index].trim().replace(/"/g, '');
						let formattedField = formatField(
							field.charAt(0).toUpperCase() + field.slice(1).toLowerCase()
						);

						if (first) {
							if (
								dictionary[displayedHeaders[index]] &&
								dictionary[displayedHeaders[index]]['items'] &&
								Object.keys(dictionary[displayedHeaders[index]]['items'])
									.length > 0
							) {
								if (
									formattedField !== '' &&
									!isNaN(formattedField) &&
									!dictionary[displayedHeaders[index]['skipIntParse']]
								) {
									formattedField = parseFloat(formattedField).toString();
								}
								formattedField = dictionary[displayedHeaders[index]]['items'][
									formattedField
								]
									? dictionary[displayedHeaders[index]]['items'][formattedField]
									: formattedField;
							}

							line += removeDiacritics(formattedField);
							first = false;
						} else {
							if (
								dictionary[displayedHeaders[index]] &&
								dictionary[displayedHeaders[index]]['items'] &&
								Object.keys(dictionary[displayedHeaders[index]]['items'])
									.length > 0
							) {
								if (
									formattedField !== '' &&
									!isNaN(formattedField) &&
									!dictionary[displayedHeaders[index]['skipIntParse']]
								) {
									formattedField = parseFloat(formattedField).toString();
								}
								formattedField = dictionary[displayedHeaders[index]]['items'][
									formattedField
								]
									? dictionary[displayedHeaders[index]]['items'][formattedField]
									: formattedField;
							}

							line += outputDelimiter + removeDiacritics(formattedField);
						}
					}
				}
			}
			if (i !== array.length - 1) {
				csvContent += `\n${line}`;
			}
		});

		const folderPath = join(__dirname, 'output');

		try {
			await access(folderPath, constants.F_OK);
		} catch (err) {
			if (err.code === 'ENOENT') {
				try {
					await mkdir(folderPath);
				} catch (mkdirErr) {
					console.error('Error creating directory:', mkdirErr);
				}
			} else {
				console.error('Error accessing directory:', err);
			}
		}

		const outputPath = join(folderPath, `${file.name}.csv`);
		const outputLatinPath = join(folderPath, `${file.name}_latin.csv`);
		await writeFile(outputPath, csvContent).then(() => {
			console.log(`File "${file.name}.csv" created!`);
		});
		return writeFile(outputLatinPath, csvContent, { encoding: 'latin1' }).then(
			() => {
				console.log(`File "${file.name}_latin.csv" created!`);
			}
		);
	} catch (error) {
		console.error(`Error: ${error}`);
	}
};

const parseFileRaw = async (filename) => {
	try {
		const file = getFilenameAndExtension(filename);
		const input = await readFile(filename);
		const data = decode(input);

		let csvContent = '';
		let first = true;
		displayedHeaders.forEach((header, index) => {
			if (!Unknown.includes(header)) {
				if (first) {
					csvContent += header.trim();
					first = false;
				} else {
					csvContent += outputDelimiter;
					csvContent += header.trim();
				}
			}
		});
		const array = data.split('\n');
		array.forEach((row, i) => {
			const fields = row.split(inputDelimiter);
			let line = '';
			let first = true;
			for (let index = 0; index < displayedHeaders.length; index++) {
				if (!Unknown.includes(displayedHeaders[index])) {
					if (!fields[index]) {
						line += outputDelimiter;
					} else {
						// skip unknown columns
						const field = fields[index].trim().replace(/"/g, '');
						let formattedField = formatField(
							field.charAt(0).toUpperCase() + field.slice(1).toLowerCase()
						);

						if (first) {
							if (
								formattedField !== '' &&
								!isNaN(formattedField) &&
								!dictionary[displayedHeaders[index]['skipIntParse']]
							) {
								formattedField = parseFloat(formattedField).toString();
							}

							line += removeDiacritics(formattedField);
							first = false;
						} else {
							if (
								formattedField !== '' &&
								!isNaN(formattedField) &&
								!dictionary[displayedHeaders[index]['skipIntParse']]
							) {
								formattedField = parseFloat(formattedField).toString();
							}
							line += outputDelimiter + removeDiacritics(formattedField);
						}
					}
				}
			}
			if (i !== array.length - 1) {
				csvContent += `\n${line}`;
			}
		});

		const folderPath = join(__dirname, 'output');

		try {
			await access(folderPath, constants.F_OK);
		} catch (err) {
			if (err.code === 'ENOENT') {
				try {
					await mkdir(folderPath);
				} catch (mkdirErr) {
					console.error('Error creating directory:', mkdirErr);
				}
			} else {
				console.error('Error accessing directory:', err);
			}
		}

		const outputPath = join(folderPath, `${file.name}_raw.csv`);
		const outputLatinPath = join(folderPath, `${file.name}_raw_latin.csv`);
		await writeFile(outputPath, csvContent).then(() => {
			console.log(`File "${file.name}_raw.csv" created!`);
		});
		return writeFile(outputLatinPath, csvContent, { encoding: 'latin1' }).then(
			() => {
				console.log(`File "${file.name}_raw_latin.csv" created!`);
			}
		);
	} catch (error) {
		console.error(`Error: ${error}`);
	}
};

const getFilenameAndExtension = (filename) => {
	const parts = filename.split('.');
	const extension = parts.pop();
	const name = parts.join('.');

	return {
		name,
		extension,
	};
};

const formatField = (field) => {
	const regex = /([a-zA-Z]+)(\d+)(\S*)/g;
	let formattedField = field.replace(regex, '$1 $2 $3');
	const komunikaceRegex = /\b(komunikace)\b/gi;
	formattedField = formattedField.replace(
		komunikaceRegex,
		(match, p1, offset, string) => {
			const beforeSpace = offset > 0 && string[offset - 1] === ' ';
			const afterSpace =
				offset + match.length < string.length &&
				string[offset + match.length] === ' ';
			if (beforeSpace || afterSpace) {
				return match;
			} else {
				return ' ' + p1 + ' ';
			}
		}
	);

	return formattedField;
};

const removeDiacritics = (str) => {
	const diacriticsMap = {
		á: 'a',
		č: 'c',
		ď: 'd',
		é: 'e',
		ě: 'e',
		í: 'i',
		ň: 'n',
		ó: 'o',
		ř: 'r',
		š: 's',
		ť: 't',
		ú: 'u',
		ů: 'u',
		ý: 'y',
		ž: 'z',
		Á: 'A',
		Č: 'C',
		Ď: 'D',
		É: 'E',
		Ě: 'E',
		Í: 'I',
		Ň: 'N',
		Ó: 'O',
		Ř: 'R',
		Š: 'S',
		Ť: 'T',
		Ú: 'U',
		Ů: 'U',
		Ý: 'Y',
		Ž: 'Z',
	};

	return str.replace(/[^\u0000-\u007E]/g, function (a) {
		return diacriticsMap[a] || a;
	});
};

const processArguments = async () => {
	if (process.argv.length < 3) {
		console.error(
			'Invalid command. Must be "node parse.mjs filename1 filename2..."'
		);
		process.exit(1);
	}

	for (let i = 2; i < process.argv.length; i++) {
		const filename = process.argv[i];
		await parseFile(filename);
		await parseFileRaw(filename);
	}
	console.log('Completed');
	process.exit(0);
};

const dictionary = {
	p1: { label: 'id' },
	p8: {
		label: 'Druh pevne prekazky',
		items: {
			1: 'strom',
			2: 'sloup (telefonní, veřejného osvětlení, elektrického vedení, signalizace apod.)',
			3: 'odrazník, patník (sloupek směrový, sloupek dopravní značky apod.)',
			4: 'svodidlo',
			5: 'překážka vzniklá provozem jiného vozidla (např. ztráta nákladu, výstroje vozidla nebo jeho části)',
			6: 'zeď, pevná část mostů (podjezdů, tunelů apod.)',
			7: 'závory železničního přejezdu',
			8: 'překážka vzniklá stavební činností (přenosné dopravní značky, hromada štěrku, písku nebo jiného stavebního materiálu apod.)',
			9: 'jiná překážka (zábradlí, oplocení, násep, nástupní ostrůvek apod.)',
			0: 'nepříchází v úvahu (nejedná se o srážku s pevnou překážkou)',
		},
	},
	p9: {
		label: 'Charakter nehody',
		items: {
			1: 'nehoda s nasledky na zivote',
			2: 'nehoda pouze s hmotnou skodou',
		},
	},
	p10: {
		label: 'Zavineni nehody',
		items: {
			1: 'řidičem motorového vozidla',
			2: 'řidičem nemotorového vozidla',
			3: 'chodcem',
			4: 'lesní zvěří, domácím zvířectvem',
			5: 'jiným účastníkem silničního provozu',
			6: 'závadou komunikace',
			7: 'technickou závadou vozidla',
			0: 'jiné zavinění',
		},
	},
	p11: {
		label: 'Pritomnost alkoholu u vinika',
		items: {
			1: '0,24 promile a mene',
			2: 'Ne',
			3: '0,24 do 0,5 promile',
			4: 'Pod vlivem drog',
			5: 'Pod vlivem alkoholu a drog',
			6: '0,5 do 0,8 promile',
			7: '0,8 do 1,0 promile',
			8: '1,0 do 1,5 promile',
			9: '1,5 promile a vice',
			0: 'nezjistovano',
		},
	},
	p12: {
		label: 'Hlavni priciny nehody',
		items: {
			100: 'nezaviněná řidičem',
			201: 'nepřiměřená rychlost jízdy - intenzitě (hustotě) provozu',
			202: 'nepřiměřená rychlost jízdy - viditelnosti (mlha, soumrak, jízda v noci na tlumená světla apod.)',
			203: 'nepřiměřená rychlost jízdy - vlastnostem vozidla a nákladu',
			204: 'nepřiměřená rychlost jízdy - stavu vozovky (náledí, výtluky, bláto, mokrý povrch apod.)',
			205: 'nepřiměřená rychlost jízdy - dopravně technickému stavu vozovky (zatáčka, klesání, stoupání, šířka vozovky apod.)',
			206: 'překročení předepsané rychlosti stanovené pravidly',
			207: 'překročení rychlosti stanovené dopravní značkou',
			208: 'nepřizpůsobení rychlosti - bočnímu, nárazovému větru (i při míjení, předjíždění vozidel)',
			209: 'jiný druh nepřiměřené rychlosti',
			301: 'předjíždění - vpravo',
			302: 'předjíždění - bez dostatečného bočního odstupu',
			303: 'předjíždění - bez dostatečného rozhledu (v nepřehledné zatáčce nebo její blízkosti, před vrcholem stoupání apod.)',
			304: 'pri předjíždění - došlo k ohrožení protijedoucího řidiče vozidla (špatný odhad vzdálenosti potřebné k předjetí apod.)',
			305: 'pri předjíždění - došlo k ohrožení předjížděného řidiče vozidla (vynucené zařazení, předjížděný řidič musel prudce brzdit, měnit směr jízdy apod.)',
			306: 'předjíždění - vlevo vozidla odbočujícího vlevo',
			307: 'předjíždění - v místech, kde je to zakázáno dopravní značkou',
			308: 'pri předjíždění - byla přejeta podélná čára souvislá',
			309: 'bránění v předjíždění',
			310: 'přehlédnutí již předjíždějícícho souběžně jedoucího vozidla',
			311: 'jiný druh nesprávného předjíždění',
			401: 'nedání přednosti v jízdě - jízda na "červenou" 3-barevného semaforu',
			402: 'nedání přednosti v jízdě - proti příkazu dopravní značky STOP',
			403: 'nedání přednosti v jízdě - proti příkazu dopravní značky DEJ PREDNOST',
			404: 'vozidlu přijíždějícímu zprava',
			405: 'při odbočování vlevo',
			406: 'tramvají, která odbočuje',
			407: 'protijedoucímu vozidlu při objíždění překážky',
			408: 'při zařazování do proudu jedoucích vozidel ze stanice, místa zastavení nebo stání',
			409: 'při vjíždění na silnici',
			410: 'při otáčení nebo couvání',
			411: 'při přejíždění z jednoho jízdního pruhu do druhého',
			412: 'chodci na vyznačeném přechodu',
			413: 'při odbočování vlevo - souběžně jedoucímu vozidlu',
			414: 'jiné nedání přednosti',
			501: 'jízda po nesprávné straně vozovky, vjetí do protisměru',
			502: 'vyhýbání bez dostatečného bočního odstupu (vůle)',
			503: 'nedodržení bezpečné vzdálenosti za vozidlem',
			504: 'nesprávné otáčení nebo couvání',
			505: 'chyby při udání směru jízdy',
			506: 'bezohledná, agresivní, neohleduplná jízda',
			507: 'náhlé bezdůvodné snížení rychlosti jízdy, zabrzdění nebo zastavení',
			508: 'řidič se plně nevěnoval řízení vozidla',
			509: 'samovolné rozjetí nezajištěného vozidla',
			510: 'vjetí na nezpevněnou komunikaci',
			511: 'nezvládnutí řízení vozidla',
			512: 'jízda (vjetí) jednosměrnou ulicí, silnicí (v protisměru)',
			513: 'nehoda v důsledku použití (policií) prostředků k násilnému zastavení vozidla (zastavovací pásy, zábrana, vozidlo atp.)',
			514: 'nehoda v důsledku použití služební zbraně (policií)',
			515: 'nehoda při provádění služebního zákroku (pronásledování pachatele atd.)',
			516: 'jiný druh nesprávného způsobu jízdy',
			601: 'závada řízení',
			602: 'závada provozní brzdy',
			603: 'neúčinná nebo nefungující parkovací brzda',
			604: 'opotřebení běhounu pláště pod stanovenou mez',
			605: 'defekt pneumatiky způsobený průrazem nebo náhlým únikem vzduchu',
			606: 'závada osvětlovací soustavy vozidla (neúčinná, chybějící, znečištěná apod.)',
			607: 'nepřipojená nebo poškozená spojovací hadice pro bzrdění přípojného vozidla',
			608: 'nesprávné uložení nákladu',
			609: 'upadnutí, ztráta kola vozidla (i rezervního)',
			610: 'zablokování kol v důsledku mechanické závady vozidla (zadřený motor, převodovka, rozvodovka, spadlý řetěz apod.)',
			611: 'lom závěsu kola, pružiny',
			612: 'nezajištěná nebo poškozená bočnice (i u přívěsu)',
			613: 'závada závěsu pro přívěs',
			614: 'utržená spojovací hřídel',
			615: 'jiná technická závada (vztahuje se i na přípojná vozidla)',
		},
	},
	p13: { label: 'Nasledky nehody', items: {} },
	p13a: { label: 'Nehoda s umrtim', items: { 0: 'ne', 1: 'ano' } },
	p13b: { label: 'Nehoda s vaznym zranenim', items: { 0: 'ne', 1: 'ano' } },
	p13c: { label: 'Nehoda s lehkym zranenim', items: { 0: 'ne', 1: 'ano' } },
	p14: { label: 'Celkova hmotna skoda', items: {} },
	p15: {
		label: 'Typ povrchu silnice',
		items: {
			1: 'dlažba',
			2: 'živice',
			3: 'beton',
			4: 'panely',
			5: 'štěrk',
			6: 'jiný nezpevněný povrch',
		},
	},
	p16: {
		label: 'Stav povrchu vozovky v dobe nehody',
		items: {
			1: 'povrch suchý neznečištěný',
			2: 'povrch suchý znečištěný (písek, prach, listí, štěrk atd.)',
			3: 'povrch mokrý',
			4: 'na vozovce je bláto',
			5: 'na vozovce je náledí, ujetý sníh - posypané',
			6: 'na vozovce je náledí, ujetý sníh - neposypané',
			7: 'na vozovce je rozlitý olej, nafta apod.',
			8: 'souvislá sněhová vrstva, rozbředlý sníh',
			9: 'náhlá změna stavu vozovky (námraza na mostu, místní náledí)',
			0: 'jiný stav povrchu vozovky v době nehody',
		},
	},
	p17: {
		label: 'Stav komunikace',
		items: {
			1: 'dobrý, bez závad',
			2: "podélný sklon vyšší než 8 '%",
			3: 'nesprávně umístěná, znečištěná, chybějící dopravní značka',
			4: 'zvlněný povrch v podélném směru',
			5: 'souvislé výtluky',
			6: 'nesouvislé výtluky',
			7: 'trvalé zúžení vozovky',
			8: 'příčná stružka, hrbol, vystouplé, propadlé kolejnice',
			9: 'neoznačená nebo nedostatečně označená překážka na komunikaci',
			10: 'přechodná uzavírka jednoho jízdního pruhu',
			11: 'přechodná uzavírka komunikace nebo jízdního pásu',
			12: 'jiný (neuvedený) stav nebo závada komunikace',
		},
	},
	p18: {
		label: 'Povetrnostni podminky v dobe nehody',
		items: {
			1: 'neztížené',
			2: 'mlha',
			3: 'na počátku deště, slabý déšť, mrholení apod.',
			4: 'déšť',
			5: 'sněžení',
			6: 'tvoří se námraza, náledí',
			7: 'nárazový vítr (boční, vichřice apod.)',
			0: 'jiné ztížené',
		},
	},
	p19: {
		label: 'Viditelnosti',
		items: {
			1: 've dne, viditelnost nezhoršená vlivem povětrnostních podmínek',
			2: 've dne, zhoršená viditelnost (svítání, soumrak)',
			3: 've dne, zhoršená viditelnost vlivem povětrnostních podmínek (mlha, sněžení, déšť apod.)',
			4: 'v noci, s veřejným osvětlením, viditelnost nezhoršená vlivem povětrnostních podmínek',
			5: 'v noci, s veřejným osvětlením, zhoršená viditelnost vlivem povětrnostních podmínek (mlha, déšť, sněžení apod.)',
			6: 'v noci, bez veřejného osvětlení, viditelnost nezhoršená vlivem povětrnostních podmínek',
			7: 'v noci, bez veřejného osvětlení, viditelnost zhoršená vlivem povětrnostních podmínek (mlha, déšť, sněžení apod.)',
		},
	},
	p2: { label: 'Casove udaje o dopravni nehode', items: {} },
	p20: {
		label: 'Rozhledove podminky',
		items: {
			1: 'dobré',
			2: 'špatné - vlivem okolní zástavby (budovy, plné zábradlí apod.)',
			3: 'špatné - vlivem průběhu komunikace, nebo podélného profilu nebo trasování (nepřehledný vrchol stoupání, zářez komunikace apod.)',
			4: 'špatné - vlivem vegetace - trvale (stromy, keře apod.)',
			5: 'špatné - vlivem vegetace - přechodně (tráva, obilí apod.)',
			6: 'výhled zakryt stojícím vozidlem',
			0: 'jiné špatné',
		},
	},
	p21: {
		label: 'Deleni komunikace',
		items: {
			1: 'dvoupruhová',
			2: 'třípruhová',
			3: 'čtyřpruhová s dělícím pásem',
			4: 'čtyřpruhová s dělící čarou',
			5: 'vícepruhová',
			6: 'rychlostní komunikace',
			0: 'žádná z uvedených',
		},
	},
	p22: {
		label: 'Situovani nehody na komunikaci',
		items: {
			1: 'na jízdním pruhu',
			2: 'na odstavném pruhu',
			3: 'na krajnici',
			4: 'na odbočovacím, připojovacím pruhu',
			5: 'na pruhu pro pomalá vozidla',
			6: 'na chodníku nebo ostrůvku',
			7: 'na kolejích tramvaje',
			8: 'mimo komunikaci',
			9: 'na stezce pro cyklisty',
			0: 'žádné z uvedených',
		},
	},
	p23: {
		label: 'Rizeni provozu v dobe nehody',
		items: {
			1: 'policistou nebo jiným pověřeným orgánem',
			2: 'světelným signalizačním zařízením',
			3: 'místní úprava',
			0: 'žádný způsob řízení provozu',
		},
	},
	p24: {
		label: 'Mistni uprava prednosti v jizde',
		items: {
			1: 'světelná signalilzace přepnuta na přerušovanou žlutou',
			2: 'světelná signalizace mimo provoz',
			3: 'přednost vyznačena dopravními značkami',
			4: 'přednost vyznačena přenosnými dopravními značkami nebo zařízením',
			5: 'přednost nevyznačena - vyplývá z pravidel silničního provozu',
			0: 'žádná místní úprava',
		},
	},
	p27: {
		label: 'Specificka mista a objekty v miste nehody',
		items: {
			1: 'přechod pro chodce',
			2: 'v blízkosti přechodu pro chodce (do vzdálenosti 20 m)',
			3: 'železniční přejezd nezabezpečený závorami ani světelným výstražným zařízením',
			4: 'železniční přejezd zabezpečený',
			5: 'most, nadjezd, podjezd, tunel',
			6: 'zastávka autobusu, trolejbusu, tramvaje s nástupním ostrůvkem',
			7: 'zastávka tramvaje, autobusu, trolejbusu bez nástupního ostrůvku',
			8: 'výjezd z parkoviště, lesní cesty apod.',
			9: 'čerpadlo pohonných hmot',
			10: 'parkoviště přiléhající ke komunikaci',
			0: 'žádné nebo žádné z uvedených',
		},
	},
	p28: {
		label: 'Smerove pomery',
		items: {
			1: 'přímý úsek',
			2: 'přímý úsek po projetí zatáčkou (do vzdálenosti cca 100 m od optického konce zatáčky)',
			3: 'zatáčka',
			4: 'křižovatka průsečná - čtyřramenná',
			5: 'křižovatka styková - tříramenná',
			6: 'křižovatka pěti a víceramenná',
			7: 'kruhový objezd',
		},
	},
	p29: {
		label: 'Kategorie chodce',
		items: {
			1: 'muž',
			2: 'žena',
			3: 'dítě (do 15 let)',
			4: 'skupina dětí',
			5: 'jiná skupina',
		},
	},
	p29a: { label: 'Chodec s odrazem', items: {} },
	p29b: { label: 'Chodec na prepravci osob', items: {} },
	p2a: { label: 'Den, Mesic, Rok', items: {} },
	p2b: { label: 'Cas', items: {} },
	p30: {
		label: 'Stav chodce',
		items: {
			1: 'dobrý - žádné nepříznivé okolnosti nebyly zjištěny',
			2: 'nepozornost, roztržitost',
			3: 'pod vlivem léků, narkotik',
			4: 'pod vlivem alkoholu - obsah alkoholu v krvi do 0,99 ‰',
			5: 'fyzická indispozice - (nemoc, nevolnost, snížená pohyblivost apod.)',
			6: 'pokus o sebevraždu, sebevražda',
			7: 'invalida',
			8: 'jiný neuvedený stav',
			9: 'pod vlivem alkoholu - obsah alkoholu v krvi 1 ‰ a více',
			0: 'nezjištěno',
		},
	},
	p30a: {
		label: 'Pritomnost alkoholu (Chodec)',
		items: {
			1: 'ano - obsah alkoholu v krvi do 0,24 promile',
			2: 'ne',
			3: 'ano - obsah alkoholu v krvi od 0,24 promile do 0,5 promile',
			4: 'odmítnuto',
			5: '',
			6: 'ano - obsah alkoholu v krvi od 0,5 promile do 0,8 promile',
			7: 'ano - obsah alkoholu v krvi od 0,8 promile do 1,0 promile',
			8: 'ano - obsah alkoholu v krvi od 1,0 promile do 1,5 promile',
			9: 'ano - obsah alkoholu v krvi 1,5 promile a více',
			0: 'nezjišťováno',
		},
	},
	p30b: { label: 'Typ drogy (Chodec)', items: {} },
	p31: {
		label: 'Chovani chodce',
		items: {
			1: 'spravne, primerene',
			2: 'spatny odhad vzdalenosti a rychlosti vozidla',
			3: 'nahle vstoupeni do vozovky z chodniku, krajnice',
			4: 'nahle vstoupeni do vozovky z nastupniho nebo deliciho ostruvku',
			5: 'zmatene, zbrkle, nerozhodne jednani',
			6: 'nahla zmena smeru chuze',
			7: 'naraz do vozidla z boku',
			8: 'hra deti na vozovce',
			0: 'nezjisteno',
		},
		default: 0,
	},
	p32: {
		label: 'Situace v miste nehody',
		items: {
			1: 'vstup chodce na signal VOLNO',
			2: 'vstup chodce na signal STUJ',
			3: 'vstup chodce do vozovky v blizkosti prechodu (cca do 20 m)',
			4: 'prechazeni po vyznacenem prechodu',
			5: 'prechazeni tesne pred nebo za vozidlem stojicim v zastavce',
			6: 'prechazeni tesne pred nebo za vozidlem parkujicim',
			7: 'chuze, stani na chodniku',
			8: 'chuze po spravne strane',
			9: 'chuze po nespravne strane',
			10: 'prechazeni mimo prechod (20 a vice metru od prechodu)',
			0: 'jina situace',
		},
	},
	p33: { label: 'Nasledky na zivotech a zdravi chodcu', items: {} },
	p33c: {
		label: 'Pohlavi chodce',
		items: {
			1: 'muz',
			2: 'zena',
			3: 'chlapec do 15 let',
			4: 'divka do 15 let',
		},
	},
	p33d: {
		label: 'Rok narozeni chodce (posledni dvojcisli)',
		items: {},
		skipIntParse: true,
	},
	p33e: { label: 'Statni prislusnost chodce', items: {} },
	p33f: {
		label: 'Poskytnuti prvni pomoci',
		items: {
			1: 'nebylo treba poskytnout',
			2: 'poskytnuta osadkou vozidel zucastnenych na nehode',
			3: 'jinou osobou',
			4: 'leteckou zachrannou sluzbou',
			5: 'vozidlem RZP',
			6: 'nebyla poskytnuta, ale bylo nutno poskytnout',
		},
	},
	p33g: {
		label: 'Nasledky pro chodce',
		items: {
			1: 'usmrceni',
			2: 'tezke zraneni',
			3: 'lehke zraneni',
			4: 'bez zraneni',
		},
	},
	p34: { label: 'Pocet zucastnenych vozidel', items: {} },
	p35: {
		label: 'Misto dopravni nehody',
		items: {
			0: 'mimo krizovatku',
			10: 'na krizovatce mistnich a ucelovych komunikaci nebo mezilehle krizovatce',
			11: 'uvnitr zony 1 predmetne krizovatky',
			12: 'uvnitr zony 2 predmetne krizovatky',
			13: 'uvnitr zony 3 predmetne krizovatky',
			14: 'uvnitr zony 4 predmetne krizovatky',
			15: 'uvnitr zony 5 predmetne krizovatky',
			16: 'uvnitr zony 6 predmetne krizovatky',
			17: 'uvnitr zony 7 predmetne krizovatky',
			18: 'uvnitr zony 8 predmetne krizovatky',
			19: 'na krizovatce uvnitr hranic krizovatky definovanych pro system evidence nehod (zona 9)',
			22: 'na vjezdove nebo vyjezdove casti vetve pri mimourovnovem krizeni',
			23: 'na vjezdove nebo vyjezdove casti vetve pri mimourovnovem krizeni',
			24: 'na vjezdove nebo vyjezdove casti vetve pri mimourovnovem krizeni',
			25: 'na vjezdove nebo vyjezdove casti vetve pri mimourovnovem krizeni',
			26: 'na vjezdove nebo vyjezdove casti vetve pri mimourovnovem krizeni',
			27: 'na vjezdove nebo vyjezdove casti vetve pri mimourovnovem krizeni',
			28: 'na vjezdove nebo vyjezdove casti vetve pri mimourovnovem krizeni',
			29: 'mimo zonu 11-19 a 22-28',
		},
	},
	p36: {
		label: 'Druh pozemni komunikace',
		items: {
			0: 'dalnice',
			1: 'silnice 1. tridy',
			2: 'silnice 2. tridy',
			3: 'silnice 3. tridy',
			4: 'uzel (krizovatka sledovana ve vybranych mestech)',
			5: 'komunikace sledovana (ve vybranych mestech)',
			6: 'komunikace mistni',
			7: 'komunikace ucelova (polni a lesni cesty atd.)',
			8: 'komunikace ucelova (ostatni - parkoviste, odpocivky apod.)',
		},
	},
	p37: { label: 'Cislo pozemni komunikace', items: {} },
	p39: {
		label: 'Druh kruzujici komunikace',
		items: {
			1: 'silnice 1. tridy',
			2: 'silnice 2. tridy',
			3: 'silnice 3. tridy',
			6: 'mistni komunikace',
			7: 'ucelova komunikace',
			9: 'vetev mimourovnove krizovatky',
		},
	},
	p4: { label: 'Zeme nehody', items: {} },
	p44: {
		label: 'Druh vozidla',
		items: {
			'00': 'moped',
			1: 'maly motocykl (do 50 ccm)',
			2: 'motocykl (vcetne sidecaru, skutru apod.)',
			3: 'osobni automobil bez privesu',
			4: 'osobni automobil s privesem',
			5: 'nakladni automobil (vcetne multikary, autojerabu, cisterny atd.)',
			6: 'nakladni automobil s privesem',
			7: 'nakladni automobil s navesem',
			8: 'autobus',
			9: 'traktor (i s privesem)',
			10: 'tramvaj',
			11: 'trolejbus',
			12: 'jine motorove vozidlo (zemedelske, lesni, stavebni stroje atd.)',
			13: 'jizdni kolo',
			14: 'povoz, jizda na koni',
			15: 'jine nemotorove vozidlo',
			16: 'vlak',
			17: 'nezjisteno, ridic ujel',
			18: 'jiny druh vozidla',
		},
	},
	p45a: {
		label: 'Vyrobce vozidla',
		items: {
			1: 'ALFA-ROMEO',
			2: 'AUDI',
			3: 'AVIA',
			4: 'BMW',
			5: 'CHEVROLET',
			6: 'CHRYSLER',
			7: 'CITROEN',
			8: 'DACIA',
			9: 'DAEWOO',
			10: 'DAF',
			11: 'DODGE',
			12: 'FIAT',
			13: 'FORD',
			14: 'GAZ, VOLHA',
			15: 'FERRARI',
			16: 'HONDA',
			17: 'HYUNDAI',
			18: 'IFA',
			19: 'IVECO',
			20: 'JAGUAR',
			21: 'JEEP',
			22: 'LANCIA',
			23: 'LAND ROVER',
			24: 'LIAZ',
			25: 'MAZDA',
			26: 'MERCEDES',
			27: 'MITSUBISHI',
			28: 'MOSKVIČ',
			29: 'NISSAN',
			30: 'OLTCIT',
			31: 'OPEL',
			32: 'PEUGEOT',
			33: 'PORSCHE',
			34: 'PRAGA',
			35: 'RENAULT',
			36: 'ROVER',
			37: 'SAAB',
			38: 'SEAT',
			39: 'ŠKODA',
			40: 'SCANIA',
			41: 'SUBARU',
			42: 'SUZUKI',
			43: 'TATRA',
			44: 'TOYOTA',
			45: 'TRABANT',
			46: 'VAZ',
			47: 'VOLKSWAGEN',
			48: 'VOLVO',
			49: 'WARTBURG',
			50: 'ZASTAVA',
			51: 'AGM',
			52: 'ARO',
			53: 'AUSTIN',
			54: 'BARKAS',
			55: 'DAIHATSU',
			56: 'DATSUN',
			57: 'DESTACAR',
			58: 'ISUZU',
			59: 'KAROSA',
			60: 'KIA',
			61: 'LUBLIN',
			62: 'MAN',
			63: 'MASERATI',
			64: 'MULTICAR',
			65: 'PONTIAC',
			66: 'ROSS',
			67: 'SIMCA',
			68: 'SSANGYONG',
			69: 'TALBOT',
			70: 'TAZ',
			71: 'ZAZ',
			72: 'BOVA',
			73: 'IKARUS',
			74: 'NEOPLAN',
			75: 'OASA',
			76: 'RAF',
			77: 'SETRA',
			78: 'SOR',
			79: 'APRILIA',
			80: 'CAGIVA',
			81: 'ČZ',
			82: 'DERBI',
			83: 'DUCATI',
			84: 'GILERA',
			85: 'HARLEY',
			86: 'HERO',
			87: 'HUSQVARNA',
			88: 'JAWA',
			89: 'KAWASAKI',
			90: 'KTM',
			91: 'MALAGUTI',
			92: 'MANET',
			93: 'MZ',
			94: 'PIAGGIO',
			95: 'SIMSON',
			96: 'VELOREX',
			97: 'YAMAHA',
			98: 'jine vyrobene v CR',
			99: 'jine vyrobene mimo CR',
			'00': 'zadna z uvedenych',
		},
	},
	p45b: { label: 'Informace o vozidle', items: {} },
	p45d: { label: 'Typ paliva pro pohon vozidla', items: {} },
	p45f: { label: 'Typ kola vozidla', items: {} },
	p47: { label: 'Rok vyroby vozidla', items: {}, skipIntParse: true },
	p48a: {
		label: 'Charakteristika vozidla',
		items: {
			1: 'soukrome nevyuzivane k vydelecne cinnosti',
			2: 'soukrome vyuzivane k vydelecne cinnosti',
			3: 'soukroma organizace (podnikatel, s.r.o., v.o.s., a.s., atd.)',
			4: 'verejna hromadna doprava',
			5: 'mestska hromadna doprava',
			6: 'mezinarodni kamionova doprava',
			7: 'TAXI',
			8: 'statni podnik, statni organizace',
			9: 'registrovane mimo uzemi CR',
			10: 'zastupitelsky urad',
			11: 'ministerstvo vnitra',
			12: 'policie CR',
			13: 'mestska, obecni policie',
			14: 'soukrome bezpecnostni agentury',
			15: 'ministerstvo obrany',
			16: 'jine',
			17: 'odcizene',
			18: 'vozidlo AUTOSKOLY provadejici vycvik',
			'00': 'nezjisteno',
		},
	},
	p49: {
		label: 'Smyk',
		items: {
			1: 'ano',
			0: 'ne',
		},
	},
	p4a: { label: 'Stat nehody', items: {} },
	p4b: { label: 'Okres zeme nehody', items: {} },
	p4c: { label: 'Uzemni celky zeme nehody', items: {} },
	p5a: {
		label: 'Lokalita nehody',
		items: {
			1: 'v obci',
			2: 'mimo obec',
		},
	},
	p50a: {
		label: 'Vozidlo po nehode',
		items: {
			1: 'nedoslo k pozaru',
			2: 'doslo k pozaru',
			3: 'ridic ujel - zjisten',
			4: 'ridic ujel (utekl) - nezjisten',
			0: 'zadna z uvedenych',
		},
	},
	p50b: {
		label: 'Unik provoznich, prepravovanych hmot',
		items: {
			1: 'doslo k uniku pohonnych hmot, oleje, chladiciho media apod.',
			2: 'doslo k uniku jinych nebezpecnych latek - pevnych',
			3: 'doslo k uniku jinych nebezpecnych latek - kapalnych',
			4: 'doslo k uniku jinych nebezpecnych latek - plynnych',
			0: 'zadne z uvedenych',
		},
	},
	p51: {
		label: 'Zpusob vyprosteni osob z vozidla',
		items: {
			1: 'nebylo treba uzit nasili',
			2: 'pouzitim pacidel apod.',
			3: 'pouziti specialni vyprostovaci techniky',
		},
	},
	p52: {
		label: 'Smer jizdy nebo postaveni vozidla',
		items: {
			1: 'vozidlo jedouci - ve smeru staniceni (na komunikaci)',
			2: 'vozidlo odstavene, parkujici',
			3: 'vozidlo jedouci - proti smeru staniceni (na komunikaci)',
			4: 'vozidlo odstavene, parkujici - proti smeru staniceni (na komunikaci)',
			5: 'vozidlo jedouci - na komunikaci bez staniceni',
			6: 'vozidlo odstavene, parkujici - na komunikaci bez staniceni',
			10: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			11: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			12: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			13: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			14: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			15: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			16: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			17: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			18: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			19: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			20: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			21: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			22: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			23: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			24: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			25: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			26: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			27: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			28: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			29: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			30: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			31: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			32: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			33: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			34: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			35: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			36: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			37: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			38: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			39: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			40: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			41: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			42: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			43: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			44: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			45: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			46: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			47: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			48: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			49: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			50: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			51: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			52: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			53: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			54: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			55: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			56: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			57: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			58: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			59: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			60: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			61: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			62: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			63: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			64: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			65: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			66: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			67: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			68: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			69: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			70: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			71: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			72: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			73: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			74: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			75: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			76: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			77: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			78: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			79: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			80: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			81: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			82: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			83: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			84: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			85: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			86: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			87: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			88: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			89: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			90: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			91: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			92: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			93: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			94: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			95: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			96: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			97: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			98: 'zachycuje postaveni vozidla pri nehode na krizovatce',
			99: 'zachycuje postaveni vozidla pri nehode na krizovatce',
		},
	},
	p53: { label: 'Skoda na vozidle', items: {} },
	p55a: {
		label: 'Kategorie ridice',
		items: {
			1: 's ridicskym opravnenim skupiny A',
			2: 's ridicskym opravnenim skupiny B',
			3: 's ridicskym opravnenim skupiny C',
			4: 's ridicskym opravnenim skupiny D',
			5: 's ridicskym opravnenim skupiny T',
			6: 's ridicskym opravnenim skupiny A a s omezenim do 50 ccm',
			7: 'bez prislusneho ridicskeho opravneni',
			8: 'ostatni ridici vozidel (napr. cykliste, vozkove, strojvedouci atd.)',
			9: 'nezjisteno, ridic misto nehody opustil',
			0: 'nezjisteno (napr. u cizincu)',
		},
	},
	p57: {
		label: 'Stav ridice',
		items: {
			1: 'dobry, zadne nepriznive okolnosti nebyly zjisteny',
			2: 'unaven, usnul, nahla fyzicka indispozice',
			3: 'pod vlivem leku, narkotik',
			4: 'pod vlivem alkoholu, obsah alkoholu v krvi do 0,99 promile',
			5: 'pod vlivem alkoholu, obsah alkoholu v krvi 1 promile a vice',
			6: 'nemoc, uraz apod.',
			7: 'invalidita',
			8: 'ridic pri jizde zemrel (infarkt apod.)',
			9: 'pokus o sebevrazdu, sebevrazda',
			0: 'jiny nepriznivy stav',
		},
	},
	p58: {
		label: 'Vnejsi ovlivneni ridice',
		items: {
			1: 'ridic nebyl ovlivnen',
			2: 'oslnen sluncem',
			3: 'oslnen svetlomety jineho vozidla',
			4: 'ovlivnen jednanim jineho ucastnika silnicniho provozu',
			5: 'ovlivnen pri vyhybani lesni zveri, domacimu zvirectvu apod.',
			0: 'jine ovlivneni',
		},
	},
	p6: {
		label: 'Druh nehody',
		items: {
			1: 'srazka s jedoucim nekolejovym vozidlem',
			2: 'srazka s vozidlem zaparkovanym, odstavenym',
			3: 'srazka s pevnou prekazkou',
			4: 'srazka s chodcem',
			5: 'srazka s lesni zveri',
			6: 'srazka s domacim zviretem',
			7: 'srazka s vlakem',
			8: 'srazka s tramvaji',
			9: 'havarie',
			0: 'jiny druh nehody',
		},
	},
	p7: {
		label: 'Druh srazky jedouciho vozidel',
		items: {
			1: 'celni',
			2: 'bocni',
			3: 'z boku',
			4: 'zezadu',
			0: 'neprichazi v uvahu - nejedna se o srazku jedoucich vozidel',
		},
	},
	p8a: { label: 'Typ zvirete', items: {} },
	h: { label: 'Stat', items: {} },
	i: { label: 'Ulice', items: {} },
	k: { label: 'Typ umisteni', items: {} },
};

const displayedHeaders = [
	'p1',
	'p36',
	'p37',
	'p2a',
	'p2a',
	'p2b',
	'p6',
	'p7',
	'p8',
	'p9',
	'p10',
	'p11',
	'p12',
	'p13a',
	'p13b',
	'p13c',
	'p14',
	'p15',
	'p16',
	'p17',
	'p18',
	'p19',
	'p20',
	'p21',
	'p22',
	'p23',
	'p24',
	'p27',
	'p28',
	'p34',
	'p35',
	'p39',
	'p44',
	'p45a',
	'p47',
	'p48a',
	'p49',
	'p50a',
	'p50b',
	'p51',
	'p52',
	'p53',
	'p55a',
	'p57',
	'p58',
	'a',
	'b',
	'd',
	'e',
	'f',
	'g',
	'h',
	'i',
	'j',
	'k',
	'l',
	'n',
	'o',
	'p',
	'q',
	'r',
	's',
	't',
	'p5a',
];

const Unknown = [
	'a',
	'b',
	'f',
	'g',
	'j',
	'l',
	'n',
	'o',
	'p',
	'q',
	'r',
	's',
	't',
];

processArguments();
