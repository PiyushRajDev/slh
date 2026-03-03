import { extractCFProfile } from "../core/extractor.core"
import { isValidHandle } from "../utils/validate"

const handle = process.argv[2]

if (!isValidHandle(handle)) {
  console.error("Usage: npm run cli <handle>")
  console.error("Handle: 3-24 chars, letters/digits/underscore/hyphen only")
  process.exit(1)
}

extractCFProfile(handle)
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((err) => { console.error("Error:", (err as Error).message); process.exit(1) })