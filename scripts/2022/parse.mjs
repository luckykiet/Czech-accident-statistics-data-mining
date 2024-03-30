import { access, constants, mkdir, readFile, writeFile } from 'fs/promises';
import { dictionary, headers } from './dictionary.mjs';
import { dirname, join } from 'path';

import { decode } from 'windows-1250';
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
		headers.forEach((header) => {
			csvContent += dictionary[header.trim()]
				? dictionary[header.trim()]
				: header.trim();

			csvContent += `\t`;
		});
		data.split('\n').forEach((row) => {
			const fields = row.split(inputDelimiter);
			let line = '';

			for (let index = 0; index < headers.length; index++) {
				if (!fields[index]) {
					line += '\t';
				} else {
					const field = fields[index].trim().replace(/"/g, '');
					if (index === 0) {
						line += field;
					} else {
						line += '\t' + field;
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
