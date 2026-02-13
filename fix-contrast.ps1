# Comprehensive Light Theme Fix - Text Contrast and Remaining Dark Elements
$appFiles = Get-ChildItem -Path "d:\my Programms\lenguage-schooll01\eduflow-2026\app\(protected)\app" -Filter "*.tsx" -Recurse
$componentFiles = Get-ChildItem -Path "d:\my Programms\lenguage-schooll01\eduflow-2026\components" -Filter "*.tsx" -Recurse
$allFiles = $appFiles + $componentFiles

$replacements = @{
    # Critical text contrast fixes - white text on light backgrounds
    'text-white' = 'text-foreground'
    'hover:text-white' = 'hover:text-foreground'
    
    # Remaining dark backgrounds that slipped through
    'bg-zinc-900 border border-zinc-800' = 'bg-card border border-border'
    'bg-zinc-900/50' = 'bg-card/50'
    'bg-zinc-800/50' = 'bg-secondary/50'
    'bg-zinc-800/30' = 'bg-secondary/30'
    'hover:bg-zinc-800' = 'hover:bg-secondary'
    'hover:bg-zinc-800/50' = 'hover:bg-secondary/50'
    'hover:bg-zinc-800/30' = 'hover:bg-secondary/30'
    
    # Border fixes
    'border-zinc-800 bg-card' = 'border-border bg-card'
    'border border-zinc-800' = 'border border-border'
    
    # Active state fixes for tabs (should use primary color, not zinc)
    'data-[state=active]:bg-zinc-800 data-[state=active]:text-white' = 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
    'data-[state=active]:bg-zinc-800' = 'data-[state=active]:bg-primary'
    
    # Hover states
    'hover:bg-card' = 'hover:bg-secondary'
}

$totalReplacements = 0
$filesUpdated = 0

foreach ($file in $allFiles) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName)
        $originalContent = $content
        
        foreach ($old in $replacements.Keys) {
            $new = $replacements[$old]
            $content = $content.Replace($old, $new)
        }
        
        if ($content -ne $originalContent) {
            [System.IO.File]::WriteAllText($file.FullName, $content)
            $filesUpdated++
            Write-Host "✓ Fixed: $($file.Name)"
        }
    } catch {
        Write-Host "✗ Error: $($file.Name) - $_"
    }
}

Write-Host "`n========================================="
Write-Host "Light Theme Contrast Fix Complete!"
Write-Host "Files updated: $filesUpdated"
Write-Host "========================================="
