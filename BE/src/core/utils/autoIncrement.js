const Counter = require('../models/Counter.model');

module.exports = exports = function autoIncrement(schema, options) {
    schema.pre('validate', async function () {
        if (!this.isNew) {
            return;
        }
        try {
            const counter = await Counter.findOneAndUpdate(
                { id: options.model },
                { $inc: { seq: 1 } },
                { returnDocument: 'after', upsert: true }
            );
            this._id = counter.seq;
        } catch (err) {
            throw err;
        }
    });
};
