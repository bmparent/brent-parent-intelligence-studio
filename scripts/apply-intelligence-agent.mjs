import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

function read(file) {
  return fs.readFileSync(path.join(repoRoot, file), 'utf8')
}

function write(file, contents) {
  fs.writeFileSync(path.join(repoRoot, file), contents)
}

function ensureAppIntegration() {
  const appPath = 'src/App.tsx'
  if (!fs.existsSync(path.join(repoRoot, appPath))) {
    throw new Error('src/App.tsx was not found. Run this script from the repository root after copying the patch files in place.')
  }

  let app = read(appPath)

  if (!app.includes("./components/ui/IntelligenceStudioAgent")) {
    const importNeedle = "import { ContactCTA } from './sections/ContactCTA';"
    const importInsert = `${importNeedle}\nimport { IntelligenceStudioAgent } from './components/ui/IntelligenceStudioAgent';`

    if (!app.includes(importNeedle)) {
      throw new Error('Could not find ContactCTA import in src/App.tsx. Add IntelligenceStudioAgent import manually.')
    }

    app = app.replace(importNeedle, importInsert)
  }

  if (!app.includes('<IntelligenceStudioAgent />')) {
    const introNeedle = `        </section>
        <Capabilities />`
    const introInsert = `        </section>
        <IntelligenceStudioAgent />
        <Capabilities />`

    if (!app.includes(introNeedle)) {
      throw new Error('Could not find the intro-grid insertion point in src/App.tsx. Place <IntelligenceStudioAgent /> manually where the section should appear.')
    }

    app = app.replace(introNeedle, introInsert)
  }

  write(appPath, app)
}

function ensureGitignore() {
  const ignorePath = '.gitignore'
  let ignore = fs.existsSync(path.join(repoRoot, ignorePath)) ? read(ignorePath) : ''
  const additions = ['.dev.vars', '.dev.vars.*', '.env', '.env.*', '!.env.example', '!.dev.vars.example']

  for (const item of additions) {
    if (!ignore.split(/\r?\n/).includes(item)) ignore += `${ignore.endsWith('\n') || ignore.length === 0 ? '' : '\n'}${item}\n`
  }

  write(ignorePath, ignore)
}

function ensurePackageScripts() {
  const packagePath = 'package.json'
  if (!fs.existsSync(path.join(repoRoot, packagePath))) return

  const packageJson = JSON.parse(read(packagePath))
  packageJson.scripts = packageJson.scripts ?? {}
  packageJson.scripts.typecheck = packageJson.scripts.typecheck ?? 'tsc -b --pretty false'
  packageJson.scripts['preview:cf'] = packageJson.scripts['preview:cf'] ?? 'npm run build && npx wrangler pages dev dist'

  write(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)
}

ensureAppIntegration()
ensureGitignore()
ensurePackageScripts()

console.log('Intelligence Studio Agent integrated.')
console.log('Next: npm install, npm run typecheck, npm run lint, npm run build')
console.log('For the API route locally: copy .dev.vars.example to .dev.vars, add OPENAI_API_KEY, then run npm run preview:cf')
