# Script to scan "New folder" and generate products.js for the website
$rootFolder = "$PSScriptRoot\New folder"
$outputFile = "$PSScriptRoot\products.js"

$categories = @("Men", "Ladies", "baby")
$products = @()

Write-Host "Scanning folders..."

foreach ($category in $categories) {
    $categoryPath = Join-Path $rootFolder $category
    if (Test-Path $categoryPath) {
        # Loop through all files recursively (Robust method)
        $files = Get-ChildItem -Path $categoryPath -Recurse -File | Where-Object { $_.Extension -match '\.(jpg|jpeg|png|gif|webp)$' }
        Write-Host "Found $($files.Count) files in $category"
        
        foreach ($file in $files) {
            # robust relative path calculation
            # Get path part after "New folder"
            $pathParts = $file.FullName.Substring($rootFolder.Length + 1)
            $relPath = $pathParts.Replace('\', '/')
            $finalWebPath = "New folder/" + $relPath
            
            # Determine subcategory (Path relative to Category)
            $fileDir = $file.Directory.FullName
            
            if ($fileDir.StartsWith($categoryPath)) {
                # Get path relative to the category root
                # e.g. for "Men\pant\gens pant", $relDir becomes "\pant\gens pant"
                $relDir = $fileDir.Substring($categoryPath.Length)
                
                # Clean up slashes
                $subcategory = $relDir.TrimStart('\').Replace('\', '/')
                
                if ($subcategory -eq "") {
                    $subcategory = "all"
                }
            } else {
                $subcategory = "all"
            }

            # Create object
            $product = @{
                category = $category
                subcategory = $subcategory
                image = $finalWebPath
                name = $file.BaseName
            }
            $products += $product
        }
    } else {
        Write-Warning "Category folder not found: $categoryPath"
    }
}

# Convert to JSON and wrap in a JS variable
$json = $products | ConvertTo-Json -Depth 3 -Compress
$jsContent = "const products = $json;"

Set-Content -Path $outputFile -Value $jsContent -Encoding UTF8

Write-Host "Successfully created products.js with $($products.Count) items."
Write-Host "You can now open index.html to view the website."
