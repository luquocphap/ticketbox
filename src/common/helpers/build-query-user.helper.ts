// import { QueryUserPaginatedDto } from "src/modules-api/auth/dto/query-paginated-user.dto";


// export const buildQueryUser = (query: QueryUserPaginatedDto) => {
//     let { soTrang, soPhanTuTrenTrang, tuKhoa } = query;

//     const pageDefault = 1;
//     const pageSizeDefault = 3;

//     // ĐẢM BẢO LÀ SỐ
//     soTrang = Number(soTrang);
//     soPhanTuTrenTrang = Number(soPhanTuTrenTrang);

//     // nếu gửi chữ
//     soTrang = Number(soTrang) || pageDefault;
//     soPhanTuTrenTrang = Number(soPhanTuTrenTrang) || pageSizeDefault;

//     // nếu mà số âm
//     if (soTrang < 1) soTrang = pageDefault;
//     if (soPhanTuTrenTrang < 1) soPhanTuTrenTrang = pageSizeDefault;

//     // xử lý index
//     const index = (soTrang - 1) * soPhanTuTrenTrang;

//     console.log({ soTrang, soPhanTuTrenTrang, index });

//     let where = {}

//     if (tuKhoa && tuKhoa.trim() !== ''){
//          where = {
//             OR: [
//                 {
//                     email: {
//                         contains: tuKhoa
//                     }
//                 },
//                 {
//                     ho_ten: {
//                         contains: tuKhoa
//                     }
//                 }
//             ]
//         }
//     }

//     return {
//         soTrang,
//         soPhanTuTrenTrang,
//         index,
//         where
//     };
// };

