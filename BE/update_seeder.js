const fs = require('fs');

const generateProducts = () => {
    const products = [];
    let id = 1;
    let variantId = 101;
    
    const categories = [1, 2, 3, 4, 5];
    const brands = [1, 2, 3];
    const seasons = [1, 2, 3];
    const genders = [1, 2, 3];
    const materials = [1, 2, 3, 4];
    const forms = [1, 2, 3];
    const sports = [1, 2, 3, 4];

    const names = ['Áo Thun Basic', 'Quần Short Thể Thao', 'Áo Polo Pique', 'Áo Khoác Gió', 'Quần Dài Kaki', 'Đồ Lót Nam', 'Áo Chạy Bộ', 'Quần Jogger', 'Áo Thun Oversize', 'Quần Lót Kháng Khuẩn'];
    const images = [
        'https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg',
        'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
        'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg',
        'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg',
        'https://images.pexels.com/photos/1040893/pexels-photo-1040893.jpeg',
        'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg',
        'https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg',
        'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg',
        'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg',
        'https://images.pexels.com/photos/991509/pexels-photo-991509.jpeg'
    ];

    const sizes = ['S', 'M', 'L', 'XL'];
    const colors = ['Black', 'White', 'Navy', 'Grey'];

    for (let i = 0; i < 20; i++) {
        const cat = categories[i % categories.length];
        const brand = brands[i % brands.length];
        const season = seasons[i % seasons.length];
        const gender = genders[i % genders.length];
        const mat = materials[i % materials.length];
        const form = forms[i % forms.length];
        const sport = sports[i % sports.length];
        const price = 100000 + Math.floor(Math.random() * 400000);

        products.push({
            _id: id,
            name: names[i % names.length] + ' ' + i,
            category_id: cat,
            brand_id: brand,
            season_id: season,
            gender_id: gender,
            sport_id: sport,
            material_id: mat,
            form_id: form,
            main_img: images[i % images.length] + '?auto=compress&w=600',
            images: [images[(i + 1) % images.length] + '?auto=compress&w=600'],
            variants: [
                { _id: variantId++, sku: 'SKU-' + id + '-1', size: sizes[i % sizes.length], color: colors[i % colors.length], price: price, cost_price: price - 50000, sold: Math.floor(Math.random() * 200) },
                { _id: variantId++, sku: 'SKU-' + id + '-2', size: sizes[(i + 1) % sizes.length], color: colors[(i + 1) % colors.length], price: price, cost_price: price - 50000, sold: Math.floor(Math.random() * 200) }
            ]
        });
        id++;
    }
    
    // Return standard JSON but replace quotes around keys to make it look like a JS object
    let str = JSON.stringify(products, null, 2);
    // basic regex to remove quotes around keys
    str = str.replace(/"([^"]+)":/g, '$1:');
    // replace double quotes with single quotes for strings
    str = str.replace(/"/g, "'");
    return str;
};

const path = 'c:/xampp/htdocs/shop-quan-ao/BE/src/modules/seed/services/seeder.service.js';
let content = fs.readFileSync(path, 'utf8');
const startTag = 'const productData = [';
const endTag = '    for (const p of productData) {';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
    const newContent = content.substring(0, startIndex) + 'const productData = ' + generateProducts() + ';\n\n' + content.substring(endIndex);
    fs.writeFileSync(path, newContent);
    console.log('Seeder updated with 20 products.');
} else {
    console.log('Could not find productData array bounds.');
}
