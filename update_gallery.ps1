# Script to scan "New folder" and generate products.js for the website
$rootFolder = "$PSScriptRoot\New folder"
$outputFile = "$PSScriptRoot\products.js"

$categories = @("Men", "Ladies", "baby")
$products = @()

Write-Host "Scanning folders..."

foreach ($category in $categories) {
    $categoryPath = Join-Path $rootFolder $category
    if (Test-Path $categoryPath) {
        # Loop through all files recursively
        $files = Get-ChildItem -Path $categoryPath -Include *.jpg, *.jpeg, *.png, *.gif, *.webp -Recurse
        
        foreach ($file in $files) {
            # Calculate relative path for web
            $relativePath = "New folder/$category"
            
            # Determine subcategory
            # If file is in "Men/shirt", parent is "shirt". If in "Men", parent is "Men".
            $parentDir = $file.Directory.Name
            $subcategory = ""

            if ($parentDir -ne $category) {
               $subcategory = $parentDir
               $relativePath += "/$subcategory/" + $file.Name
            } else {
               $subcategory = "all"
               $relativePath += "/" + $file.Name
            }

            # Create object
            $product = @{
                category = $category
                subcategory = $subcategory
                image = $relativePath
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
