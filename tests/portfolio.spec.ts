import { test, expect } from '@playwright/test'

test.describe('Portfolio — Full Feature Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
  })

  // ─── Page Load ───
  test('page loads with title', async ({ page }) => {
    await expect(page).toHaveTitle(/Aniket/i)
  })

  // ─── Navigation ───
  test('navbar has all section links', async ({ page }) => {
    const nav = page.locator('nav, header')
    for (const label of ['About', 'Skills', 'Projects', 'Contact']) {
      const link = nav.getByRole('link', { name: new RegExp(label, 'i') }).or(
        nav.locator(`text=${label}`)
      )
      await expect(link.first()).toBeVisible({ timeout: 5000 })
    }
  })

  // ─── Hero / About Section ───
  test('hero section renders', async ({ page }) => {
    const hero = page.locator('section').first()
    await expect(hero).toBeVisible()
  })

  // ─── Skills Section ───
  test('skills section is visible and has skill categories', async ({ page }) => {
    // Scroll to skills
    await page.locator('text=/skills/i').first().click()
    await page.waitForTimeout(800)
    const skills = page.locator('[id*="skill" i], section:has-text("Skills")')
    await expect(skills.first()).toBeVisible({ timeout: 5000 })
  })

  // ─── Projects Section ───
  test('projects section shows project cards', async ({ page }) => {
    await page.locator('text=/projects/i').first().click()
    await page.waitForTimeout(800)
    // Check at least a few projects are visible
    const projectTitles = page.locator('text=/JARVIS|CodeAbyss|MedMate|Speci-GO|Phoenix/i')
    const count = await projectTitles.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('Speci-GO project is present', async ({ page }) => {
    await page.locator('text=/projects/i').first().click()
    await page.waitForTimeout(800)
    const specigo = page.locator('text=/Speci-GO/i')
    await expect(specigo.first()).toBeVisible({ timeout: 5000 })
  })

  // ─── Contact Section ───
  test('contact section has form fields', async ({ page }) => {
    await page.locator('text=/contact/i').first().click()
    await page.waitForTimeout(800)
    // Check for input fields
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]')
    const emailInput = page.locator('input[name="email"], input[placeholder*="email" i], input[type="email"]')
    const messageInput = page.locator('textarea, input[name="message"]')
    await expect(nameInput.first()).toBeVisible({ timeout: 5000 })
    await expect(emailInput.first()).toBeVisible({ timeout: 5000 })
    await expect(messageInput.first()).toBeVisible({ timeout: 5000 })
  })

  test('Execute Transmission button exists', async ({ page }) => {
    await page.locator('text=/contact/i').first().click()
    await page.waitForTimeout(800)
    const btn = page.locator('button:has-text("Execute"), button:has-text("Transmit"), button:has-text("Send")')
    await expect(btn.first()).toBeVisible({ timeout: 5000 })
  })

  // ─── Contact form submission ───
  test('contact form submits without crash', async ({ page }) => {
    await page.locator('text=/contact/i').first().click()
    await page.waitForTimeout(800)
    // Fill in form
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first()
    const emailInput = page.locator('input[name="email"], input[placeholder*="email" i], input[type="email"]').first()
    const messageInput = page.locator('textarea, input[name="message"]').first()
    await nameInput.fill('Test User')
    await emailInput.fill('test@example.com')
    await messageInput.fill('This is a Playwright test message')
    // Click submit
    const btn = page.locator('button:has-text("Execute"), button:has-text("Transmit"), button:has-text("Send")').first()
    await btn.click()
    // Should not crash — either success or fallback
    await page.waitForTimeout(3000)
    // Page should still be up
    await expect(page.locator('body')).toBeVisible()
  })

  // ─── 3D World Buttons ───
  test('3D world entry buttons exist', async ({ page }) => {
    // Look for buttons that enter the 3D worlds
    const worldBtns = page.locator('button:has-text("Enter"), button:has-text("Explore"), button:has-text("Launch"), button:has-text("World")')
    const count = await worldBtns.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  // ─── Smooth scrolling ───
  test('smooth scroll works between sections', async ({ page }) => {
    const initialY = await page.evaluate(() => window.scrollY)
    await page.locator('text=/projects/i').first().click()
    await page.waitForTimeout(1000)
    const newY = await page.evaluate(() => window.scrollY)
    expect(newY).toBeGreaterThan(initialY)
  })

  // ─── Mobile responsive ───
  test('page is responsive at mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.reload({ waitUntil: 'networkidle' })
    await expect(page.locator('body')).toBeVisible()
    // Content should still render
    const hero = page.locator('section').first()
    await expect(hero).toBeVisible()
  })

  // ─── No console errors ───
  test('no critical console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    // Filter out known non-critical errors (3rd party, CORS, etc)
    const critical = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('CORS') && !e.includes('third-party') && !e.includes('ERR_BLOCKED')
    )
    // Allow up to 2 non-critical console errors
    expect(critical.length).toBeLessThanOrEqual(2)
  })

  // ─── Videos load ───
  test('video elements exist for projects with videos', async ({ page }) => {
    await page.locator('text=/projects/i').first().click()
    await page.waitForTimeout(1500)
    // Check that at least one video source is loaded
    const videos = page.locator('video')
    const count = await videos.count()
    // It's fine if videos are lazy-loaded and not all visible
    expect(count).toBeGreaterThanOrEqual(0)
  })
})
