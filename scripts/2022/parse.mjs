import { Unknown, dictionary, headers } from './dictionary.mjs';
import { access, constants, mkdir, readFile, writeFile } from 'fs/promises';
import { decode, encode } from 'windows-1250';
import { dirname, join } from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const inputDelimiter = ';';

const parseFile = async (filename) => {
	try {
		const file = getFilenameAndExtension(filename);
		const input = await readFile(filename);
		const data = decode(input);

		let csvContent = '';
		let first = true;
		headers.forEach((header, index) => {
			if (!Unknown.includes(headers[index])) {
				if (first) {
					csvContent += dictionary[header.trim()]
						? dictionary[header.trim()]
						: header.trim();
					first = false;
				} else {
					csvContent += '\t';
					csvContent += dictionary[header.trim()]
						? dictionary[header.trim()]
						: header.trim();
				}
			}
		});
		data.split('\n').forEach((row) => {
			const fields = row.split(inputDelimiter);
			let line = '';
			let first = true;
			for (let index = 0; index < headers.length; index++) {
				if (!Unknown.includes(headers[index])) {
					if (!fields[index]) {
						line += '\t';
					} else {
						// skip unknown columns
						const field = fields[index].trim().replace(/"/g, '');
						const formattedField = formatField(
							field.charAt(0).toUpperCase() + field.slice(1).toLowerCase()
						);
						if (first) {
							line += formattedField;
							first = false;
						} else {
							line += '\t' + formattedField;
						}
					}
				}
			}
			csvContent += `\n${line}`;
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

		return writeFile(outputPath, csvContent).then(() => {
			console.log(`File "${file.name}.csv" created!`);
		});
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
	formattedField = formattedField.replace(komunikaceRegex, ' $1 ');
	return formattedField;
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
	}
	console.log('Completed');
	process.exit(0);
};

processArguments();
