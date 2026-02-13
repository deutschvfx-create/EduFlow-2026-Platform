# Mass replacement script for dark theme colors - Components directory
$files = Get-ChildItem -Path "d:\my Programms\lenguage-schooll01\eduflow-2026\components" -Filter "*.tsx" -Recurse

$replacements = @{
    'bg-zinc-950/50' = 'bg-background/50'
    'bg-zinc-950/40' = 'bg-background/40'
    'bg-zinc-950/30' = 'bg-background/30'
    'bg-zinc-950' = 'bg-background'
    'bg-zinc-900/60' = 'bg-card/60'
    'bg-zinc-900/50' = 'bg-card/50'
    'bg-zinc-900/40' = 'bg-card/40'
    'bg-zinc-900/30' = 'bg-card/30'
    'bg-zinc-900/20' = 'bg-card/20'
    'bg-zinc-900' = 'bg-card'
    'bg-zinc-800/50' = 'bg-secondary/50'
    'bg-zinc-800/30' = 'bg-secondary/30'
    'bg-zinc-800' = 'bg-secondary'
    'border-zinc-900' = 'border-border'
    'border-zinc-800/50' = 'border-border/50'
    'border-zinc-800' = 'border-border'
    'border-zinc-700' = 'border-border'
}

$totalReplacements = 0

foreach ($file in $files) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName)
        $originalContent = $content
        
        foreach ($old in $replacements.Keys) {
            $new = $replacements[$old]
            $content = $content.Replace($old, $new)
        }
        
        if ($content -ne $originalContent) {
            [System.IO.File]::WriteAllText($file.FullName, $content)
            $totalReplacements++
            Write-Host "Updated: $($file.Name) in $($file.DirectoryName)"
        }
    } catch {
        Write-Host "Error processing $($file.Name): $_"
    }
}

Write-Host "`nTotal component files updated: $totalReplacements"
