$content = Get-Content "hooks/use-organization.ts" -Raw

# Replace the malformed return statement with correct JSX
$pattern = [regex]::Escape("    return (
        <OrganizationContext.Provider
            value={{
        currentOrganizationId,
            currentOrganization,
            organizations,
            switchOrganization,
            createOrganization,
            }
}
        >
    { children }
    </OrganizationContext.Provider>
    );")

$replacement = @"
    return (
        <OrganizationContext.Provider
            value={{
                currentOrganizationId,
                currentOrganization,
                organizations,
                switchOrganization,
                createOrganization,
            }}
        >
            {children}
        </OrganizationContext.Provider>
    );
"@

$content = $content -replace [regex]::Escape($pattern), $replacement

# Also try a simpler pattern match in case escaping doesn't work
if ($content -match "value=\{\{") {
    $content = $content -replace "value=\{\{`r?`n\s+currentOrganizationId,`r?`n\s+currentOrganization,`r?`n\s+organizations,`r?`n\s+switchOrganization,`r?`n\s+createOrganization,`r?`n\s+\}`r?`n\}`r?`n\s+>`r?`n\s+\{ children \}", @"
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
}

$content | Set-Content "hooks/use-organization.ts" -NoNewline
