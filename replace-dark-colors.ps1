# Mass replacement script for dark theme colors to light theme semantic variables
$files = Get-ChildItem -Path "d:\my Programms\lenguage-schooll01\eduflow-2026\app\(protected)\app" -Filter "*.tsx" -Recurse

$replacements = @{
    # Background replacements
    'bg-zinc-950' = 'bg-background'
    'bg-zinc-900' = 'bg-card'
    'bg-zinc-800' = 'bg-secondary'
    'bg-gray-950' = 'bg-background'
    'bg-gray-900' = 'bg-card'
    'bg-gray-800' = 'bg-secondary'
    'bg-slate-950' = 'bg-background'
    'bg-slate-900' = 'bg-card'
    'bg-slate-800' = 'bg-secondary'
    
    # Border replacements
    'border-zinc-900' = 'border-border'
    'border-zinc-800' = 'border-border'
    'border-zinc-700' = 'border-border'
    'border-gray-900' = 'border-border'
    'border-gray-800' = 'border-border'
    'border-gray-700' = 'border-border'
    
    # Text replacements
    'text-zinc-700' = 'text-muted-foreground'
    'text-zinc-600' = 'text-muted-foreground'
    'text-zinc-500' = 'text-muted-foreground'
    'text-zinc-400' = 'text-muted-foreground/70'
    'text-zinc-300' = 'text-foreground/80'
    'text-zinc-200' = 'text-foreground'
    'text-zinc-100' = 'text-foreground'
    'text-white' = 'text-foreground'
}

$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        $content = $content -replace $old, $new
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $totalReplacements++
        Write-Host "Updated: $($file.Name)"
    }
}

Write-Host "`nTotal files updated: $totalReplacements"
