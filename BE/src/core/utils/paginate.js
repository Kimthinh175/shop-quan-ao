module.exports = function cursorPaginate(schema) {
    schema.statics.paginate = async function (filter, options) {
        let sortField = '_id';
        let sortOrder = -1; // Default descending

        if (options.sortBy) {
            const [key, order] = options.sortBy.split(':');
            sortField = key;
            sortOrder = order === 'asc' ? 1 : -1;
        }

        const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
        let queryFilter = { ...filter };
        let direction = options.direction === 'prev' ? 'prev' : 'next';

        // Xử lý toán tử và hướng sort dựa vào direction
        // Nếu sortOrder = -1 (mới nhất), đi Next -> tìm cái cũ hơn ($lt), đi Prev -> tìm cái mới hơn ($gt)
        let op = sortOrder === -1 ? '$lt' : '$gt';
        let querySortOrder = sortOrder;

        if (direction === 'prev') {
            op = sortOrder === -1 ? '$gt' : '$lt';
            querySortOrder = sortOrder === -1 ? 1 : -1; // Đảo ngược sort khi đi ngược
        }

        const sortObj = { [sortField]: querySortOrder };
        if (sortField !== '_id') {
            sortObj['_id'] = querySortOrder;
        }

        if (options.cursor) {
            let cursorData;
            try {
                const decoded = Buffer.from(options.cursor, 'base64').toString('utf-8');
                cursorData = JSON.parse(decoded);
            } catch (e) {
                cursorData = { _id: isNaN(Number(options.cursor)) ? options.cursor : Number(options.cursor) };
            }

            if (sortField === '_id') {
                if (queryFilter._id && typeof queryFilter._id === 'object') {
                    queryFilter._id[op] = cursorData._id;
                } else {
                    queryFilter._id = { [op]: cursorData._id };
                }
            } else {
                queryFilter.$or = [
                    { [sortField]: { [op]: cursorData[sortField] } },
                    { [sortField]: cursorData[sortField], _id: { [op]: cursorData._id } }
                ];
            }
        }

        let docsPromise = this.find(queryFilter).sort(sortObj).limit(limit + 1);

        if (options.select) {
            docsPromise = docsPromise.select(options.select);
        }

        if (options.populate) {
            if (typeof options.populate === 'string') {
                options.populate.split(',').forEach((populateOption) => {
                    docsPromise = docsPromise.populate(
                        populateOption.split('.').reverse().reduce((a, b) => ({ path: b, populate: a }))
                    );
                });
            } else if (Array.isArray(options.populate)) {
                options.populate.forEach((pop) => {
                    docsPromise = docsPromise.populate(pop);
                });
            }
        }

        // Chạy song song cả query lấy data và đếm tổng (tuỳ chọn)
        const countPromise = this.countDocuments(filter).exec(); // Lấy tổng dựa trên filter gốc (không có cursor)
        let [results, totalResults] = await Promise.all([docsPromise.exec(), countPromise]);

        let hasMore = results.length > limit;
        if (hasMore) {
            results.pop(); // Bỏ đi phần tử check-ahead
        }

        // Đảo ngược lại kết quả nếu đang đi lùi (prev)
        if (direction === 'prev') {
            results = results.reverse();
        }

        let hasNextPage = false;
        let hasPrevPage = false;

        if (direction === 'next') {
            hasNextPage = hasMore;
            hasPrevPage = !!options.cursor; // Nếu đang đi next và có cursor, tức là có trang trước
        } else {
            hasPrevPage = hasMore;
            hasNextPage = true; // Đi prev thì chắc chắn có trang next
        }

        let nextCursor = null;
        let prevCursor = null;

        if (results.length > 0) {
            if (hasNextPage) {
                const lastItem = results[results.length - 1];
                const nextPayload = { _id: lastItem._id };
                if (sortField !== '_id') nextPayload[sortField] = lastItem[sortField];
                nextCursor = Buffer.from(JSON.stringify(nextPayload)).toString('base64');
            }
            if (hasPrevPage) {
                const firstItem = results[0];
                const prevPayload = { _id: firstItem._id };
                if (sortField !== '_id') prevPayload[sortField] = firstItem[sortField];
                prevCursor = Buffer.from(JSON.stringify(prevPayload)).toString('base64');
            }
        }

        return {
            results,
            limit,
            totalResults,
            hasNextPage,
            hasPrevPage,
            nextCursor,
            prevCursor
        };
    };
};
