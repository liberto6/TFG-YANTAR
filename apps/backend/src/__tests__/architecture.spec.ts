import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.resolve(__dirname, '..');

/**
 * Recursively get all .ts files in a directory,
 * excluding __tests__, node_modules, dist, and .spec.ts files.
 */
function getFilesRecursive(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const results: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (['__tests__', 'node_modules', 'dist'].includes(entry.name)) continue;
      results.push(...getFilesRecursive(fullPath));
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.ts') &&
      !entry.name.endsWith('.spec.ts') &&
      !entry.name.endsWith('.d.ts')
    ) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Read a file and extract all import-from statements.
 * Returns an array of the "from" specifiers.
 */
function getImports(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
  const imports: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

/**
 * Collect all .ts files under a specific layer across all domain modules.
 * E.g. layer = 'domain' collects identity/domain/**, company/domain/**, etc.
 */
function getLayerFiles(layer: string): { file: string; relativePath: string }[] {
  const domains = ['identity', 'company'];
  const files: { file: string; relativePath: string }[] = [];

  for (const domain of domains) {
    const layerDir = path.join(SRC_DIR, domain, layer);
    for (const file of getFilesRecursive(layerDir)) {
      files.push({
        file,
        relativePath: path.relative(SRC_DIR, file),
      });
    }
  }

  return files;
}

describe('Architecture Fitness Tests', () => {
  describe('Domain layer isolation', () => {
    const domainFiles = getLayerFiles('domain');

    it('should have domain files to test', () => {
      expect(domainFiles.length).toBeGreaterThan(0);
    });

    it('domain layer must not import NestJS framework', () => {
      const violations: string[] = [];

      for (const { file, relativePath } of domainFiles) {
        const imports = getImports(file);
        const nestImports = imports.filter((imp) => imp.startsWith('@nestjs/'));
        if (nestImports.length > 0) {
          violations.push(
            `${relativePath} imports NestJS: ${nestImports.join(', ')}`,
          );
        }
      }

      expect(violations).toEqual([]);
    });

    it('domain layer must not import Prisma', () => {
      const violations: string[] = [];

      for (const { file, relativePath } of domainFiles) {
        const imports = getImports(file);
        const prismaImports = imports.filter(
          (imp) => imp.startsWith('@prisma/') || imp.includes('prisma'),
        );
        if (prismaImports.length > 0) {
          violations.push(
            `${relativePath} imports Prisma: ${prismaImports.join(', ')}`,
          );
        }
      }

      expect(violations).toEqual([]);
    });

    it('domain layer must not import from infrastructure layer', () => {
      const violations: string[] = [];

      for (const { file, relativePath } of domainFiles) {
        const imports = getImports(file);
        const infraImports = imports.filter((imp) =>
          imp.includes('infrastructure'),
        );
        if (infraImports.length > 0) {
          violations.push(
            `${relativePath} imports infrastructure: ${infraImports.join(', ')}`,
          );
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe('Application layer isolation', () => {
    const applicationFiles = getLayerFiles('application');

    it('should have application files to test', () => {
      expect(applicationFiles.length).toBeGreaterThan(0);
    });

    it('application layer must not import Prisma', () => {
      const violations: string[] = [];

      for (const { file, relativePath } of applicationFiles) {
        const imports = getImports(file);
        const prismaImports = imports.filter(
          (imp) => imp.startsWith('@prisma/') || imp.includes('prisma'),
        );
        if (prismaImports.length > 0) {
          violations.push(
            `${relativePath} imports Prisma: ${prismaImports.join(', ')}`,
          );
        }
      }

      expect(violations).toEqual([]);
    });

    it('application layer must not import from infrastructure layer', () => {
      const violations: string[] = [];

      for (const { file, relativePath } of applicationFiles) {
        const imports = getImports(file);
        const infraImports = imports.filter((imp) =>
          imp.includes('infrastructure'),
        );
        if (infraImports.length > 0) {
          violations.push(
            `${relativePath} imports infrastructure: ${infraImports.join(', ')}`,
          );
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe('Cross-domain isolation', () => {
    const domains = ['identity', 'company'];

    it('domain layers must not import directly from other domains', () => {
      const violations: string[] = [];

      for (const domain of domains) {
        const domainDir = path.join(SRC_DIR, domain, 'domain');
        const files = getFilesRecursive(domainDir);
        const otherDomains = domains.filter((d) => d !== domain);

        for (const file of files) {
          const relativePath = path.relative(SRC_DIR, file);
          const imports = getImports(file);

          for (const imp of imports) {
            // Allow @yantar/shared imports
            if (imp.startsWith('@yantar/shared')) continue;

            // Check if importing from another domain's domain layer
            for (const other of otherDomains) {
              if (imp.includes(`${other}/domain`) || imp.includes(`/${other}/`)) {
                violations.push(
                  `${relativePath} imports from ${other} domain: ${imp}`,
                );
              }
            }
          }
        }
      }

      expect(violations).toEqual([]);
    });
  });
});
