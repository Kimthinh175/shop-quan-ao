const mongoose = require('mongoose');

const BankAccountSchema = new mongoose.Schema({
    bank_name: { type: String, default: '' },
    account_number: { type: String, default: '' },
    account_name: { type: String, default: '' }
}, { _id: false });

const SocialLinksSchema = new mongoose.Schema({
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    tiktok: { type: String, default: '' }
}, { _id: false });

const SystemConfigSchema = new mongoose.Schema({
    _id: { type: Number, default: 1 }, // Luôn là 1 (Singleton)
    
    store_name: { type: String, default: 'CLOSET.' },
    store_email: { type: String, default: 'support@closet.vn' },
    store_phone: { type: String, default: '1900 123 456' },
    store_address: { type: String, default: '123 Fashion Street, HCMC' },
    
    social_links: { type: SocialLinksSchema, default: () => ({}) },
    
    banners: [{ type: String }], // Array of image URLs
    
    free_shipping_threshold: { type: Number, default: 1000000 },
    
    bank_account_info: { type: BankAccountSchema, default: () => ({}) },
    
    seo_description: { type: String, default: 'CLOSET. - Thương hiệu thời trang cao cấp' },
    
    maintenance_mode: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', SystemConfigSchema);
