import { access, constants, mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

import { dictionary } from './dictionary.mjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const parseFile = async (filename) => {
	try {
		const file = getFilenameAndExtension(filename);
		const data = await readFile(filename, 'utf8');

		const tableRegex = /<(?:table|TABLE)[^>]*>(.*?)<\/(?:table|TABLE)>/gis;
		const tableMatches = data.match(tableRegex);

		if (tableMatches) {
			// Extract column headers (TH tags)
			const thRegex = /<(?:th|TH)[^>]*>(.*?)<\/(?:th|TH)>/gis;
			const thMatches = tableMatches[0].match(thRegex);

			const headers = thMatches.map((th) => th.replace(/<[^>]*>/g, ''));

			// Extract rows (TR tags)
			const trRegex = /<(?:tr|TR)[^>]*>(.*?)<\/(?:tr|TR)>/gis;
			const trMatches = tableMatches[0].match(trRegex);

			const tdRegex = /<(?:td|TD)[^>]*>(.*?)<\/(?:td|TD)>/gis;

			const rows = trMatches
				.map((tr) => {
					const tdMatches = tr.match(tdRegex);
					if (!tdMatches) {
						return null;
					}
					return tdMatches.map((td) => td.replace(/<[^>]*>/g, ''));
				})
				.filter((row) => row !== null);

			// Prepare CSV content
			let csvContent = '';
			headers.forEach((header) => {
				csvContent += dictionary[header.trim()]
					? dictionary[header.trim()]
					: header.trim();

				csvContent += `\t`;
			});
			csvContent += `\n`;
			rows.forEach((row) => {
				let line = '';
				for (let index = 0; index < headers.length; index++) {
					if (!row[index]) {
						line += '\t';
					} else {
						if (index === 0) {
							line += row[index].trim();
						} else {
							line += '\t' + row[index].trim();
						}
					}
				}
				csvContent += `${line}\n`;
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
		} else {
			throw 'No rows found.';
		}
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
