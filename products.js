const products = [
    // --- LADIES (Girl shoes) ---
    { "category": "Ladies", "name": "23-48-1", "subcategory": "Girl shoes", "image": "New folder/Ladies/Girl shoes/23-48-1.mp4" },
    { "category": "Ladies", "name": "25-40-1", "subcategory": "Girl shoes", "image": "New folder/Ladies/Girl shoes/25-40-1.mp4" },
    { "category": "Ladies", "name": "29-100-1", "subcategory": "Girl shoes", "image": "New folder/Ladies/Girl shoes/29-100-1.mp4" },
    { "category": "Ladies", "name": "29-100-3", "subcategory": "Girl shoes", "image": "New folder/Ladies/Girl shoes/29-100-3.mp4" },
    { "category": "Ladies", "name": "29-184-1", "subcategory": "Girl shoes", "image": "New folder/Ladies/Girl shoes/29-184-1.mp4" },
    { "category": "Ladies", "name": "29-184-2", "subcategory": "Girl shoes", "image": "New folder/Ladies/Girl shoes/29-184-2.mp4" },
    { "category": "Ladies", "name": "29-207-1", "subcategory": "Girl shoes", "image": "New folder/Ladies/Girl shoes/29-207-1.mp4" },
    { "category": "Ladies", "name": "29-23-4", "subcategory": "Girl shoes", "image": "New folder/Ladies/Girl shoes/29-23-4.mp4" },
    { "category": "Ladies", "name": "29-116-2", "subcategory": "Girl shoes/Slipper", "image": "New folder/Ladies/Girl shoes/Slipper/29-116-2.mp4" },

    // --- LADIES (Bag) ---
    { "category": "Ladies", "name": "29-91-1", "subcategory": "bag/Moon Bag", "image": "New folder/Ladies/bag/moon bag/29-91-1.mp4" },

    // --- LADIES (Coat) ---
    { "category": "Ladies", "name": "29-51-3", "subcategory": "coat", "image": "New folder/Ladies/coat/29-51-3.mp4" },

    // --- LADIES (Summer) ---
    { "category": "Ladies", "name": "27-52-2", "subcategory": "Summer/cardigan", "image": "New folder/Ladies/Summar/cardigon/27-52-2.mp4" },

    // --- LADIES (Winter) ---
    // Cardigan
    { "category": "Ladies", "name": "27-38-2", "subcategory": "Winter/cardigan", "image": "New folder/Ladies/Winter/cardigon/27-38-2.mp4" },
    { "category": "Ladies", "name": "27-44-2", "subcategory": "Winter/cardigan", "image": "New folder/Ladies/Winter/cardigon/27-44-2.mp4" },
    { "category": "Ladies", "name": "29-122-5", "subcategory": "Winter/cardigan", "image": "New folder/Ladies/Winter/cardigon/29-122-5.mp4" },
    { "category": "Ladies", "name": "29-202-1", "subcategory": "Winter/cardigan", "image": "New folder/Ladies/Winter/cardigon/29-202-1.mp4" },
    { "category": "Ladies", "name": "29-202-2", "subcategory": "Winter/cardigan", "image": "New folder/Ladies/Winter/cardigon/29-202-2.mp4" },
    { "category": "Ladies", "name": "29-202-3", "subcategory": "Winter/cardigan", "image": "New folder/Ladies/Winter/cardigon/29-202-3.mp4" },
    { "category": "Ladies", "name": "29-204-3", "subcategory": "Winter/cardigan", "image": "New folder/Ladies/Winter/cardigon/29-204-3.mp4" },
    { "category": "Ladies", "name": "29-79-1", "subcategory": "Winter/cardigan", "image": "New folder/Ladies/Winter/cardigon/29-79-1.mp4" },
    { "category": "Ladies", "name": "29-79-2", "subcategory": "Winter/cardigan", "image": "New folder/Ladies/Winter/cardigon/29-79-2.mp4" },
    { "category": "Ladies", "name": "29-84-1", "subcategory": "Winter/cardigan", "image": "New folder/Ladies/Winter/cardigon/29-84-1.mp4" },

    // High Neck
    { "category": "Ladies", "name": "23-70-2", "subcategory": "Winter/high neck", "image": "New folder/Ladies/Winter/hinek/23-70-2.mp4" },
    { "category": "Ladies", "name": "27-80-1", "subcategory": "Winter/high neck", "image": "New folder/Ladies/Winter/hinek/27-80-1.mp4" },
    { "category": "Ladies", "name": "29-122-3", "subcategory": "Winter/high neck", "image": "New folder/Ladies/Winter/hinek/29-122-3.mp4" },
    { "category": "Ladies", "name": "29-203-1", "subcategory": "Winter/high neck", "image": "New folder/Ladies/Winter/hinek/29-203-1.mp4" },
    { "category": "Ladies", "name": "29-89-4", "subcategory": "Winter/high neck", "image": "New folder/Ladies/Winter/hinek/29-89-4.mp4" },

    // Hoodie
    { "category": "Ladies", "name": "27-115-2", "subcategory": "Winter/hoodie", "image": "New folder/Ladies/Winter/hoodie/27-115-2.mp4" },
    { "category": "Ladies", "name": "29-161-3", "subcategory": "Winter/hoodie", "image": "New folder/Ladies/Winter/hoodie/29-161-3.mp4" },
    { "category": "Ladies", "name": "29-164-2", "subcategory": "Winter/hoodie", "image": "New folder/Ladies/Winter/hoodie/29-164-2.mp4" },
    { "category": "Ladies", "name": "29-185-3", "subcategory": "Winter/hoodie", "image": "New folder/Ladies/Winter/hoodie/29-185-3.mp4" },
    { "category": "Ladies", "name": "29-152-3", "subcategory": "Winter/hoodie/chain hoodie", "image": "New folder/Ladies/Winter/hoodie/chain hoodie/29-152-3.mp4" },
    { "category": "Ladies", "name": "29-157-2", "subcategory": "Winter/hoodie/chain hoodie", "image": "New folder/Ladies/Winter/hoodie/chain hoodie/29-157-2.mp4" },
    { "category": "Ladies", "name": "29-73-1", "subcategory": "Winter/hoodie/chain hoodie", "image": "New folder/Ladies/Winter/hoodie/chain hoodie/29-73-1.mp4" },

    // Jacket
    { "category": "Ladies", "name": "26-72-1", "subcategory": "Winter/jacket", "image": "New folder/Ladies/Winter/jacket/26-72-1.mp4" },
    { "category": "Ladies", "name": "27-27-1", "subcategory": "Winter/jacket", "image": "New folder/Ladies/Winter/jacket/27-27-1.mp4" },
    { "category": "Ladies", "name": "29-134-5", "subcategory": "Winter/jacket", "image": "New folder/Ladies/Winter/jacket/29-134-5.mp4" },
    { "category": "Ladies", "name": "29-144-2", "subcategory": "Winter/jacket", "image": "New folder/Ladies/Winter/jacket/29-144-2.mp4" },
    { "category": "Ladies", "name": "29-157-1", "subcategory": "Winter/jacket", "image": "New folder/Ladies/Winter/jacket/29-157-1.mp4" },
    { "category": "Ladies", "name": "29-157-3", "subcategory": "Winter/jacket", "image": "New folder/Ladies/Winter/jacket/29-157-3.mp4" },
    { "category": "Ladies", "name": "29-158-1", "subcategory": "Winter/jacket", "image": "New folder/Ladies/Winter/jacket/29-158-1.mp4" },
    { "category": "Ladies", "name": "29-167-3", "subcategory": "Winter/jacket", "image": "New folder/Ladies/Winter/jacket/29-167-3.mp4" },
    { "category": "Ladies", "name": "29-177-1", "subcategory": "Winter/jacket", "image": "New folder/Ladies/Winter/jacket/29-177-1.mp4" },
    { "category": "Ladies", "name": "29-187-1", "subcategory": "Winter/jacket", "image": "New folder/Ladies/Winter/jacket/29-187-1.mp4" },
    { "category": "Ladies", "name": "29-192-1", "subcategory": "Winter/jacket", "image": "New folder/Ladies/Winter/jacket/29-192-1.mp4" },
    { "category": "Ladies", "name": "29-205-1", "subcategory": "Winter/jacket", "image": "New folder/Ladies/Winter/jacket/29-205-1.mp4" },
    { "category": "Ladies", "name": "29-213-1", "subcategory": "Winter/jacket", "image": "New folder/Ladies/Winter/jacket/29-213-1.mp4" },
    { "category": "Ladies", "name": "29-216-1", "subcategory": "Winter/jacket", "image": "New folder/Ladies/Winter/jacket/29-216-1.mp4" },

    // Leggings
    { "category": "Ladies", "name": "29-150-2", "subcategory": "Winter/leggings/kapada leggings", "image": "New folder/Ladies/Winter/legens/kapada leggings/29-150-2.mp4" },
    { "category": "Ladies", "name": "29-97-1", "subcategory": "Winter/leggings/kapada leggings", "image": "New folder/Ladies/Winter/legens/kapada leggings/29-97-1.mp4" },
    { "category": "Ladies", "name": "29-144-10", "subcategory": "Winter/leggings/sport leggings", "image": "New folder/Ladies/Winter/legens/sport leggings/29-144-10.mp4" },
    { "category": "Ladies", "name": "29-144-9", "subcategory": "Winter/leggings/sport leggings", "image": "New folder/Ladies/Winter/legens/sport leggings/29-144-9.mp4" },

    // Night Dress
    { "category": "Ladies", "name": "27-76-2", "subcategory": "Winter/night dress", "image": "New folder/Ladies/Winter/night dress/27-76-2.mp4" },

    // Pant
    { "category": "Ladies", "name": "17-26-1", "subcategory": "Winter/Pant", "image": "New folder/Ladies/Winter/Pant/17-26-1.mp4" },

    // Sweatshirt
    { "category": "Ladies", "name": "27-26-2", "subcategory": "Winter/sweatshirt", "image": "New folder/Ladies/Winter/sweat shirt/27-26-2.mp4" },
    { "category": "Ladies", "name": "27-95-5", "subcategory": "Winter/sweatshirt", "image": "New folder/Ladies/Winter/sweat shirt/27-95-5.mp4" },
    { "category": "Ladies", "name": "27-97-1", "subcategory": "Winter/sweatshirt", "image": "New folder/Ladies/Winter/sweat shirt/27-97-1.mp4" },
    { "category": "Ladies", "name": "29-157-4", "subcategory": "Winter/sweatshirt", "image": "New folder/Ladies/Winter/sweat shirt/29-157-4.mp4" },

    // Trouser
    { "category": "Ladies", "name": "29-164-1", "subcategory": "Winter/trouser", "image": "New folder/Ladies/Winter/trouser/29-164-1.mp4" },
    { "category": "Ladies", "name": "29-179-2", "subcategory": "Winter/trouser", "image": "New folder/Ladies/Winter/trouser/29-179-2.mp4" },
    { "category": "Ladies", "name": "29-181-1", "subcategory": "Winter/trouser", "image": "New folder/Ladies/Winter/trouser/29-181-1.mp4" },
    { "category": "Ladies", "name": "29-182-2", "subcategory": "Winter/trouser", "image": "New folder/Ladies/Winter/trouser/29-182-2.mp4" },
    { "category": "Ladies", "name": "29-198-1", "subcategory": "Winter/trouser", "image": "New folder/Ladies/Winter/trouser/29-198-1.mp4" },
    { "category": "Ladies", "name": "29-204-1", "subcategory": "Winter/trouser", "image": "New folder/Ladies/Winter/trouser/29-204-1.mp4" },
    { "category": "Ladies", "name": "29-206-1", "subcategory": "Winter/trouser", "image": "New folder/Ladies/Winter/trouser/29-206-1.mp4" },
    { "category": "Ladies", "name": "29-210-1", "subcategory": "Winter/trouser", "image": "New folder/Ladies/Winter/trouser/29-210-1.mp4" },
    { "category": "Ladies", "name": "29-150-6", "subcategory": "Winter/trouser/cottries trouser", "image": "New folder/Ladies/Winter/trouser/cottries trouser/29-150-6.mp4" },

    // Woolen Set
    { "category": "Ladies", "name": "29-198-4", "subcategory": "Winter/woolen set", "image": "New folder/Ladies/Winter/wooden set/29-198-4.mp4" },

    // Woolen Sweater
    { "category": "Ladies", "name": "23-50-1", "subcategory": "Winter/woolen sweater", "image": "New folder/Ladies/Winter/woolen sweater/23-50-1.mp4" },
    { "category": "Ladies", "name": "29-159-1", "subcategory": "Winter/woolen sweater", "image": "New folder/Ladies/Winter/woolen sweater/29-159-1.mp4" },
    { "category": "Ladies", "name": "29-161-2", "subcategory": "Winter/woolen sweater", "image": "New folder/Ladies/Winter/woolen sweater/29-161-2.mp4" },
    { "category": "Ladies", "name": "29-194-1", "subcategory": "Winter/woolen sweater", "image": "New folder/Ladies/Winter/woolen sweater/29-194-1.mp4" },
    { "category": "Ladies", "name": "29-199-3", "subcategory": "Winter/woolen sweater", "image": "New folder/Ladies/Winter/woolen sweater/29-199-3.mp4" },

    // --- BABY ---
    // Boy
    { "category": "baby", "name": "29-146-1", "subcategory": "Boy/winter/jacket", "image": "New folder/baby/Boy/winter/jacket/29-146-1.mp4" },
    { "category": "baby", "name": "29-146-2", "subcategory": "Boy/winter/jacket", "image": "New folder/baby/Boy/winter/jacket/29-146-2.mp4" },
    { "category": "baby", "name": "29-86-1", "subcategory": "Boy/winter/jacket", "image": "New folder/baby/Boy/winter/jacket/29-86-1.mp4" },
    { "category": "baby", "name": "29-108-4", "subcategory": "Boy/winter/set", "image": "New folder/baby/Boy/winter/set/29-108-4.mp4" },
    { "category": "baby", "name": "29-109-1", "subcategory": "Boy/winter/set", "image": "New folder/baby/Boy/winter/set/29-109-1.mp4" },
    { "category": "baby", "name": "29-113-1", "subcategory": "Boy/winter/set", "image": "New folder/baby/Boy/winter/set/29-113-1.mp4" },
    { "category": "baby", "name": "29-128-1", "subcategory": "Boy/winter/set", "image": "New folder/baby/Boy/winter/set/29-128-1.mp4" },
    { "category": "baby", "name": "29-131-1", "subcategory": "Boy/winter/set", "image": "New folder/baby/Boy/winter/set/29-131-1.mp4" },
    { "category": "baby", "name": "29-146-3", "subcategory": "Boy/winter/set", "image": "New folder/baby/Boy/winter/set/29-146-3.mp4" },
    { "category": "baby", "name": "29-105-4", "subcategory": "Boy/winter/sweatshirt", "image": "New folder/baby/Boy/winter/sweat shirt/29-105-4.mp4" },
    { "category": "baby", "name": "29-108-5", "subcategory": "Boy/winter/sweatshirt", "image": "New folder/baby/Boy/winter/sweat shirt/29-108-5.mp4" },

    // Girl
    { "category": "baby", "name": "29-108-1", "subcategory": "Girl/Summar/trouser", "image": "New folder/baby/Girl/Summar/trouser/29-108-1.mp4" },
    { "category": "baby", "name": "29-146-5", "subcategory": "Girl/trouser", "image": "New folder/baby/Girl/trouser/29-146-5.mp4" },
    { "category": "baby", "name": "29-146-7", "subcategory": "Girl/winter", "image": "New folder/baby/Girl/winter/29-146-7.mp4" },
    { "category": "baby", "name": "29-105-3", "subcategory": "Girl/winter/leggings", "image": "New folder/baby/Girl/winter/leggings/29-105-3.mp4" },
    { "category": "baby", "name": "29-130-1", "subcategory": "Girl/winter/set", "image": "New folder/baby/Girl/winter/set/29-130-1.mp4" },

    // Shoes
    { "category": "baby", "name": "29-116-1", "subcategory": "shoes", "image": "New folder/baby/shoes/29-116-1.mp4" }
];
