import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true, args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width: 960, height: 540 } })
const vh = 540

const errors = []
page.on('pageerror', (err) => errors.push('pageerror: ' + err.message + '\n' + err.stack))

await page.goto('http://localhost:5173', { waitUntil: 'load' })
await page.waitForSelector('#experience', { timeout: 20000 })
await page.waitForTimeout(1500)

const geo = await page.evaluate(() => {
  const el = document.getElementById('services')
  return { top: el.offsetTop, height: el.offsetHeight }
})
console.log('lab geo:', JSON.stringify(geo))

async function shot(progress, name) {
  const y = geo.top + progress * (geo.height - vh)
  await page.evaluate((yy) => window.scrollTo(0, yy), y)
  await page.waitForTimeout(2800)
  await page.screenshot({ path: `scratch_lab_${name}.png`, timeout: 120000 })
  console.log(`${name} done`)
}

await shot(0.02, 'p02_dull')
await shot(0.3, 'p30_sweep')
await shot(0.48, 'p48_correction')
await shot(0.65, 'p65_ceramic')
await shot(0.85, 'p85_reveal1')
await shot(0.99, 'p99_reveal3')

console.log('ERRORS:', JSON.stringify(errors, null, 2))
await browser.close()
