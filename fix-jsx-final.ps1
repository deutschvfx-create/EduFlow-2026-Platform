$content = Get-Content "hooks/use-organization.ts" -Raw

# Fix the malformed JSX in one comprehensive replacement
$content = $content -replace `
    "value= \{\{`r?`n\s+currentOrganizationId,`r?`n\s+currentOrganization,`r?`n\s+organizations,`r?`n\s+switchOrganization,`r?`n\s+createOrganization,`r?`n\s+\}`r?`n\}`r?`n\s+>`r?`n\s+\{ children \}", `
    @"
value={{
                currentOrganizationId,
                currentOrganization,
                organizations,
                switchOrganization,
                createOrganization,
            }}
        >
            {children}
"@

$content | Set-Content "hooks/use-organization.ts" -NoNewline
Write-Host "JSX syntax fixed successfully"
