# Read the entire file
$content = Get-Content "hooks/use-organization.ts" -Raw

# Define the exact malformed pattern to replace
$malformedPattern = @"
    return (
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
    );
"@

# Define the correct replacement
$correctReplacement = @"
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

# Perform the replacement
$newContent = $content -replace [regex]::Escape($malformedPattern), $correctReplacement

# If exact match didn't work, try a more flexible regex pattern
if ($newContent -eq $content) {
    Write-Host "Exact match failed, trying flexible pattern..."
    # Match the Provider opening tag through the closing tag
    $pattern = '(<OrganizationContext\.Provider\s+value=\{\{[^}]+\}\s*\}\s*>\s*\{[^}]+\}\s*</OrganizationContext\.Provider>)'
    $replacement = @"
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
"@
    $newContent = $content -replace $pattern, $replacement
}

# Write the fixed content back
$newContent | Set-Content "hooks/use-organization.ts" -NoNewline

Write-Host "JSX fully corrected"
