const seederService = require('../services/seeder.service');

const seedData = async (req, res, next) => {
    try {
        const result = await seederService.seedData();
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = { seedData };
