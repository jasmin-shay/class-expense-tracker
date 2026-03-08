Get-ChildItem -Recurse -File | ForEach-Object {
    $path = $_.FullName
    $lines = Get-Content $path
    if ($lines -match '<<<<<<< HEAD') {
        $output = @()
        $skip = $false
        $inConflict = $false
        foreach ($line in $lines) {
            if ($line -like '<<<<<<<*') {
                $inConflict = $true
                $skip = $false
                continue
            }
            if ($inConflict -and $line -like '=======') {
                $skip = $true
                continue
            }
            if ($inConflict -and $line -like '>>>>>>>*') {
                $inConflict = $false
                $skip = $false
                continue
            }
            if (-not $skip) {
                $output += $line
            }
        }
        $output | Set-Content $path
    }
}
