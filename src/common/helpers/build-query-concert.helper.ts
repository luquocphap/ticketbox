import { QueryPaginatedDto } from "src/modules-api/concert/dto/find-all.dto";


export const buildQueryConcert = (query: QueryPaginatedDto) => {
    let { page, pageSize, keyWord } = query;

    const pageDefault = 1;
    const pageSizeDefault = 3;

    // ĐẢM BẢO LÀ SỐ
    page = Number(page);
    pageSize = Number(pageSize);

    // nếu gửi chữ
    page = Number(page) || pageDefault;
    pageSize = Number(pageSize) || pageSizeDefault;

    // nếu mà số âm
    if (page < 1) page = pageDefault;
    if (pageSize < 1) pageSize = pageSizeDefault;

    // xử lý index
    const index = (page - 1) * pageSize;

    console.log({ page, pageSize, index });

    let where = {}

    if (keyWord && keyWord.trim() !== ''){
         where = {
            OR: [
                {
                    title: {
                        contains: keyWord
                    }
                },
                {
                    venue: {
                        contains: keyWord
                    }
                }
            ]
        }
    }

    return {
        page,
        pageSize,
        index,
        where
    };
};

