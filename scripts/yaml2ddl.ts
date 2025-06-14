#!/usr/bin/env node --no-warnings

import { readFileSync } from 'fs'
import { parse as yamlParse } from 'yaml'

function yamlToDDL(yamlContent: string): string {
  const spec = yamlParse(yamlContent)
  const ddl: string[] = []

  // Create roles
  if (spec.roles) {
    for (const role of spec.roles) {
      ddl.push(`CREATE ROLE ${role.name}${role.noinherit ? ' NOINHERIT' : ''};`)
    }
  }

  // Create tables
  if (spec.tables) {
    for (const table of spec.tables) {
      const columns = table.columns.map((col: any) => {
        const parts = [`${col.name} ${col.type}`]
        if (col.is_nullable === false) parts.push('NOT NULL')
        if (col.default) parts.push(`DEFAULT ${col.default}`)
        return parts.join(' ')
      })

      ddl.push(`
CREATE TABLE ${table.name} (
  ${columns.join(',\n  ')}
);`)

      // Enable RLS if specified
      if (table.rls_enabled) {
        ddl.push(`ALTER TABLE ${table.name} ENABLE ROW LEVEL SECURITY;`)
      }

      // Create policies
      if (table.policies) {
        for (const policy of table.policies) {
          ddl.push(`
CREATE POLICY ${policy.name} ON ${table.name}
  FOR ${policy.operation}
  ${policy.using ? `USING (${policy.using})` : ''}
  ${policy.with_check ? `WITH CHECK (${policy.with_check})` : ''};`)
        }
      }
    }
  }

  // Create views
  if (spec.views) {
    for (const view of spec.views) {
      ddl.push(`
CREATE OR REPLACE VIEW ${view.name} AS
${view.definition};`)

      // Enable RLS if specified
      if (view.rls_enabled) {
        ddl.push(`ALTER VIEW ${view.name} SET (security_barrier = on);`)
      }

      // Create policies
      if (view.policies) {
        for (const policy of view.policies) {
          ddl.push(`
CREATE POLICY ${policy.name} ON ${view.name}
  FOR ${policy.operation}
  ${policy.using ? `USING (${policy.using})` : ''}
  ${policy.with_check ? `WITH CHECK (${policy.with_check})` : ''};`)
        }
      }
    }
  }

  // Create functions
  if (spec.functions) {
    for (const func of spec.functions) {
      const params = func.parameters.map((p: any) => {
        const parts = [p.name]
        if (p.type) parts.push(p.type)
        if (p.default) parts.push(`DEFAULT ${p.default}`)
        return parts.join(' ')
      })

      ddl.push(`
CREATE OR REPLACE FUNCTION ${func.name}(${params.join(', ')})
RETURNS ${func.returns}
LANGUAGE ${func.language}
${func.security === 'definer' ? 'SECURITY DEFINER' : 'SECURITY INVOKER'}
AS $$
${func.definition}
$$;`)
    }
  }

  return ddl.join('\n\n')
}

// Main execution
if (require.main === module) {
  const yamlFile = process.argv[2]
  if (!yamlFile) {
    console.error('Please provide a YAML file path')
    process.exit(1)
  }

  try {
    const yamlContent = readFileSync(yamlFile, 'utf8')
    const ddl = yamlToDDL(yamlContent)
    console.log(ddl)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

export { yamlToDDL } 