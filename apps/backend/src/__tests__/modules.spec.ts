import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.resolve(__dirname, '..');

describe('Module Structure', () => {
  const domains = ['identity', 'company'];

  it('each domain should have domain/, application/, infrastructure/ folders', () => {
    for (const domain of domains) {
      const domainPath = path.resolve(SRC_DIR, domain);

      expect(fs.existsSync(path.join(domainPath, 'domain'))).toBe(true);
      expect(fs.existsSync(path.join(domainPath, 'application'))).toBe(true);
      expect(fs.existsSync(path.join(domainPath, 'infrastructure'))).toBe(true);
    }
  });

  it('each domain should have a module file', () => {
    const modules = [
      'identity/identity.module.ts',
      'company/company.module.ts',
    ];

    for (const mod of modules) {
      expect(fs.existsSync(path.resolve(SRC_DIR, mod))).toBe(true);
    }
  });

  it('each domain should have at least one entity', () => {
    for (const domain of domains) {
      const entitiesPath = path.join(SRC_DIR, domain, 'domain', 'entities');
      expect(fs.existsSync(entitiesPath)).toBe(true);

      const entities = fs
        .readdirSync(entitiesPath)
        .filter(
          (f) =>
            f.endsWith('.ts') && !f.endsWith('.spec.ts') && !f.endsWith('.d.ts'),
        );
      expect(entities.length).toBeGreaterThan(0);
    }
  });

  it('each domain should have at least one port', () => {
    for (const domain of domains) {
      const portsPath = path.join(SRC_DIR, domain, 'domain', 'ports');
      expect(fs.existsSync(portsPath)).toBe(true);

      const ports = fs
        .readdirSync(portsPath)
        .filter(
          (f) =>
            f.endsWith('.ts') && !f.endsWith('.spec.ts') && !f.endsWith('.d.ts'),
        );
      expect(ports.length).toBeGreaterThan(0);
    }
  });

  it('shared module should exist with infrastructure', () => {
    expect(
      fs.existsSync(path.join(SRC_DIR, 'shared', 'infrastructure')),
    ).toBe(true);
  });
});
