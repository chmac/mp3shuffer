import { expandGlobSync } from "@std/fs";
import { shuffleArray } from "@hugoalh/shuffle-array";

const LeadingNumberPattern = new RegExp("^[0-9]+_(.*)$", "g");

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  if (
    !confirm("Are you ready to rename all mp3 files in the current directory?")
  ) {
    console.log("Aborted");
    Deno.exit();
  }

  // Get all mp3 files into an array
  const mp3FilesIterator = expandGlobSync("./*.mp3");
  const mp3FilesArray = await Array.fromAsync(mp3FilesIterator);

  // Remove any leading number and underscore from file names
  const toRename = mp3FilesArray.map((walkEntry) => {
    const matches = Array.from(walkEntry.name.matchAll(LeadingNumberPattern));
    if (matches.length > 0) {
      const [, originalFileName] = matches[0];
      return {
        originalFileName,
        walkEntry,
      };
    }
    return {
      originalFileName: walkEntry.name,
      walkEntry,
    };
  });

  const fileCount = toRename.length;
  const fileCountLength = fileCount.toString().length;

  const shuffled = shuffleArray(toRename);

  shuffled.forEach(({ originalFileName, walkEntry }, index) => {
    const number = index.toString().padStart(fileCountLength, "0");
    const newFileName = `${number}_${originalFileName}`;
    Deno.renameSync(walkEntry.name, newFileName);
  });

  console.log(`Shuffled ${fileCount} mp3 files`);
}
