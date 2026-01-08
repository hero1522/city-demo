const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(__dirname)); // Serve website files
app.use('/images', express.static(path.join(__dirname, 'New folder'))); // Serve images

// API to get all images formatted by category
app.get('/api/products', (req, res) => {
    const imagesDir = path.join(__dirname, 'New folder');
    const categories = ['Men', 'Ladies', 'baby']; // Note: 'baby' is lowercase in file system based on previous list_dir
    const products = [];

    categories.forEach(category => {
        const catDir = path.join(imagesDir, category);
        if (fs.existsSync(catDir)) {
            const files = fs.readdirSync(catDir);
            files.forEach(file => {
                if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
                    products.push({
                        category: category, // normalized name could be done here if needed
                        image: `/images/${category}/${file}`,
                        name: file.replace(/\.[^/.]+$/, "") // Remove extension for a pseudo-name
                    });
                }
            });
        }
    });

    res.json(products);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
