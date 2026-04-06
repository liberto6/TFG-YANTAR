import { Company } from '../company.entity'

describe('Company', () => {
  describe('create', () => {
    it('should generate correct slug from name', () => {
      const company = Company.create({ id: '1', name: 'Casa Pepe' })
      expect(company.slug).toBe('casa-pepe')
    })

    it('should strip accents from slug', () => {
      const company = Company.create({ id: '2', name: 'Café París' })
      expect(company.slug).toBe('cafe-paris')
    })

    it('should strip special characters from slug', () => {
      const company = Company.create({ id: '3', name: "Bob's Grill & Bar" })
      expect(company.slug).toBe('bobs-grill-bar')
    })

    it('should set isActive to false by default', () => {
      const company = Company.create({ id: '1', name: 'Test' })
      expect(company.isActive).toBe(false)
    })
  })

  describe('updateBranding', () => {
    it('should return a new instance with updated fields', () => {
      const company = Company.create({ id: '1', name: 'Test' })
      const updated = company.updateBranding({
        logoUrl: 'https://example.com/logo.png',
        colorPrimary: '#FF0000',
      })

      expect(updated).not.toBe(company)
      expect(updated.logoUrl).toBe('https://example.com/logo.png')
      expect(updated.colorPrimary).toBe('#FF0000')
      expect(updated.name).toBe('Test')
    })
  })

  describe('activate / deactivate', () => {
    it('should activate a company', () => {
      const company = Company.create({ id: '1', name: 'Test' })
      const activated = company.activate()

      expect(activated.isActive).toBe(true)
      expect(activated).not.toBe(company)
    })

    it('should deactivate a company', () => {
      const company = Company.create({ id: '1', name: 'Test' }).activate()
      const deactivated = company.deactivate()

      expect(deactivated.isActive).toBe(false)
    })
  })

  describe('isConfigured', () => {
    it('should return false when logoUrl and colorPrimary are null', () => {
      const company = Company.create({ id: '1', name: 'Test' })
      expect(company.isConfigured()).toBe(false)
    })

    it('should return true when logoUrl and colorPrimary are set', () => {
      const company = Company.create({ id: '1', name: 'Test' }).updateBranding({
        logoUrl: 'https://example.com/logo.png',
        colorPrimary: '#FF0000',
      })
      expect(company.isConfigured()).toBe(true)
    })
  })

  describe('restore', () => {
    it('should reconstitute all fields', () => {
      const now = new Date()
      const company = Company.restore({
        id: '1',
        name: 'Restored Co',
        slug: 'restored-co',
        description: 'A description',
        domain: 'restored.com',
        logoUrl: 'logo.png',
        faviconUrl: 'favicon.ico',
        fontFamily: 'Arial',
        colorPrimary: '#111',
        colorSecondary: '#222',
        colorAccent: '#333',
        colorBackground: '#444',
        colorSurface: '#555',
        colorText: '#666',
        colorTextMuted: '#777',
        welcomeMessage: 'Welcome!',
        appName: 'MyApp',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })

      expect(company.id).toBe('1')
      expect(company.name).toBe('Restored Co')
      expect(company.slug).toBe('restored-co')
      expect(company.description).toBe('A description')
      expect(company.domain).toBe('restored.com')
      expect(company.logoUrl).toBe('logo.png')
      expect(company.faviconUrl).toBe('favicon.ico')
      expect(company.fontFamily).toBe('Arial')
      expect(company.colorPrimary).toBe('#111')
      expect(company.isActive).toBe(true)
      expect(company.welcomeMessage).toBe('Welcome!')
      expect(company.appName).toBe('MyApp')
    })
  })
})
