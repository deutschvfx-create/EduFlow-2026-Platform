# Add 'use client' directive to the top of the file
$content = Get-Content "hooks/use-organization.ts" -Raw
$newContent = "'use client';`r`n`r`n" + $content
$newContent | Set-Content "hooks/use-organization.ts" -NoNewline
Write-Host "Added 'use client' directive"
