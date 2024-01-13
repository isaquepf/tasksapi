import { parse } from "csv-parse";
import fs from "node:fs";

const csvPath = new URL("./tasks.csv", import.meta.url);

const stream = fs.createReadStream(csvPath);

const csvParse = parse({
  delimiter: ",",
  skipEmptyLines: true,
  fromLine: 2, // skip the header line
});

async function run() {
  const linesParse = stream.pipe(csvParse);

  const results = { total: 0, success: 0, errors: 0, details: [] };

  for await (const line of linesParse) {
    const [title, description] = line;

    try {
      await fetch("http://localhost:3333/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      results.total++;
      results.success++;
    } catch (error) {
      results.errors++;
      results.details.push({ line, error, title, description });
    }
  }

  console.log(`Results: \nTotal: ${results.total}`);
  console.log(`Success: ${results.success}`);
  console.log(`Errors: ${results.errors}`);

  if (results.details > 0) {
    results.details.forEach((detail) => {
      console.log(`line: ${detail.line}`);
      console.log(`error: ${detail.error}`);
      console.log(`title: ${detail.title}`);
      console.log(`description: ${detail.description}`);
    });
  }
}

run();
