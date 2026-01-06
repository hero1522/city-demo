const products = [
    { "category": "Ladies", "name": "29-202-1", "subcategory": "Winter/cardigan", "image": "New folder/Ladies/Winter/cardigon/29-202-1.mp4" },
    { "category": "Ladies", "name": "29-213-1", "subcategory": "Winter/jacket", "image": "New folder/Ladies/Winter/jacket/29-213-1.mp4" },
    { "category": "baby", "name": "29-146-7", "subcategory": "Girl/winter", "image": "New folder/baby/Girl/winter/29-146-7.mp4" }
];

const filterCat = "Ladies";
const filterSub = "Winter";

console.log(`Filtering for Category: ${filterCat}, Subcategory: ${filterSub}`);

let filtered = products.filter(p => p.category === filterCat);
console.log(`After Category Filter: ${filtered.length} items`);

if (filterSub && filterSub !== 'all') {
    filtered = filtered.filter(p => {
        if (!p.subcategory) return false;
        const sub = p.subcategory.trim();
        const filter = filterSub.trim();
        const match = sub === filter || sub.startsWith(filter + '/');
        console.log(`Checking "${sub}" against "${filter}": Match? ${match}`);
        return match;
    });
}

console.log(`Final Result: ${filtered.length} items`);
console.log(filtered);
