# TicketBox Backend — README

## Mục lục

1. [Tổng quan API](#1-tổng-quan-api)
2. [Cách tạo một API mới](#2-cách-tạo-một-api-mới)
3. [Chạy Unit Test](#3-chạy-unit-test)

---

## 1. Tổng quan API

> **Response format chuẩn** (áp dụng cho tất cả endpoints qua `ResponseSuccessInterceptor`):
> ```json
> { "statusCode": 200, "message": "Success", "data": { ... } }
> ```

---

### Auth — `/Auth`

> `AuthModule` hiện tại **NOT imported** trong `AppModule` — các routes dưới đây chưa hoạt động.

| Method | Endpoint | Auth | Input | Output |
|--------|----------|------|-------|--------|
| GET | `/Auth/getTypeList` | Public | — | `Type[]` |
| POST | `/Auth/register` | Public | **Body:** `RegisterDto` | `boolean` |
| POST | `/Auth/login` | Public | **Body:** `LoginDto` | `AuthToken` |
| POST | `/Auth/RefreshToken` | Public | **Cookie:** `accessToken`, `refreshToken` | `AuthToken` |

**DTOs:**

```typescript
// RegisterDto (Body)
{
  email: string          // required, định dạng email
  full_name: string      // required
  password: string       // required, min 8 ký tự, có hoa/thường/số/ký tự đặc biệt
}

// LoginDto (Body)
{
  email: string          // required
  mat_khau: string       // required, min 8 ký tự, có hoa/thường/số/ký tự đặc biệt
}

// AuthToken (Output)
{
  accessToken: string
  refreshToken: string
}
```

**Services:** `AuthService` → `PrismaService`, `TokenService`

---

### Concert — `/concert`

| Method | Endpoint | Auth | Input | Output |
|--------|----------|------|-------|--------|
| POST | `/concert` | `@Permission("CREATE", "CONCERT")` | **Body:** `CreateConcertDto` | `boolean` |
| GET | `/concert` | Public | **Query:** `QueryPaginatedDto` | `PaginatedResult<Concert>` |
| GET | `/concert/:id` | Public | **Param:** `id: string` | `Concert` |
| PATCH | `/concert/:id` | `@Permission("UPDATE", "CONCERT")` | **Param:** `id` · **Body:** `UpdateConcertDto` | `boolean` |
| DELETE | `/concert/:id` | `@Permission("DELETE", "CONCERT")` | **Param:** `id: string` | `boolean` |

**DTOs:**

```typescript
// CreateConcertDto (Body)
{
  title: string          // required
  venue: string          // required
  event_date: string     // required, ISO date string
}

// UpdateConcertDto (Body) — tất cả optional
{
  title?: string
  venue?: string
  event_date?: string
}

// QueryPaginatedDto (Query)
{
  page?: number
  pageSize?: number
  keyWord?: string
}

// PaginatedResult<Concert> (Output)
{
  currentPage: number
  count: number
  totalPages: number
  totalCount: number
  items: Concert[]
}

// Concert Entity
{
  id: string
  title: string
  venue: string
  event_date: DateTime
  created_by: string
  isDeleted: boolean
  deletedBy?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Services:** `ConcertService` → `PrismaService`

---

### Booking — `/booking`

> Tất cả endpoints yêu cầu JWT token (Protected).

| Method | Endpoint | Auth | Input | Output |
|--------|----------|------|-------|--------|
| POST | `/booking` | Protected | **Body:** `CreateBookingDto` | `Booking` |
| GET | `/booking` | Protected | — (lấy theo user hiện tại) | `Booking[]` |
| GET | `/booking/:id` | Protected | **Param:** `id: string` | `Booking` |
| PATCH | `/booking/:id/status` | Protected | **Param:** `id` · **Body:** `UpdateBookingStatusDto` | `Booking` |

**DTOs:**

```typescript
// CreateBookingDto (Body)
{
  ticketCategoryId: string   // required
  quantity: number           // required
  voucherCode?: string       // optional
  idempotencyKey: string     // required
}

// UpdateBookingStatusDto (Body)
{
  status: string             // required — PENDING | CONFIRMED | CANCELLED | EXPIRED
  note?: string              // optional
}

// Booking Entity (Output)
{
  id: string
  user_id: string
  ticket_category_id: string
  voucher_id?: string
  idempotency_key: string
  quantity: number
  total_price: decimal
  discount_amount: decimal
  status: string             // PENDING | CONFIRMED | CANCELLED | EXPIRED
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Services:** `BookingService` → `PrismaService`, `InventoryService`  
`InventoryService` xử lý reserve/release vé (dùng SELECT FOR UPDATE trong transaction).

---

### Voucher — `/voucher`

| Method | Endpoint | Auth | Input | Output |
|--------|----------|------|-------|--------|
| POST | `/voucher` | `@Permission("CREATE", "VOUCHER")` | **Body:** `CreateVoucherDto` | `boolean` |
| GET | `/voucher` | `@Permission("READ", "VOUCHER")` | **Query:** `VoucherPaginatedDto` | `PaginatedResult<Voucher>` |
| GET | `/voucher/:id` | Public | **Param:** `code: string` | `Voucher` |

**DTOs:**

```typescript
// CreateVoucherDto (Body)
{
  code: string               // required, unique
  discount_type: string      // required — PERCENTAGE | FIXED
  discount_value: decimal    // required
  expired_at: DateTime       // required
  max_usage: number          // required
}

// VoucherPaginatedDto (Query)
{
  page?: number
  pageSize?: number
  // + các filter fields khác
}

// Voucher Entity (Output)
{
  id: string
  code: string
  discount_type: string      // PERCENTAGE | FIXED
  discount_value: decimal
  expired_at: DateTime
  max_usage: number
  used_count: number
  is_active: boolean
  created_by: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Services:** `VoucherService` → `PrismaService`

---

## 2. Cách tạo một API mới

Tuân theo convention NestJS module-based. Dưới đây là các bước đầy đủ, lấy ví dụ tạo module `notification`.

### Bước 1 — Tạo cấu trúc thư mục

```
src/modules-api/notification/
├── notification.module.ts
├── notification.controller.ts
├── notification.service.ts
└── dto/
    ├── create-notification.dto.ts
    └── update-notification.dto.ts
```

### Bước 2 — Định nghĩa DTO

```typescript
// dto/create-notification.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
```

### Bước 3 — Viết Service

```typescript
// notification.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/modules-system/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateNotificationDto): Promise<boolean> {
    await this.prisma.notifications.create({
      data: { ...dto, created_by: userId },
    });
    return true;
  }

  async findOne(id: string) {
    const item = await this.prisma.notifications.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Notification not found');
    return item;
  }
}
```

### Bước 4 — Viết Controller

```typescript
// notification.controller.ts
import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Public } from '@/common/decorators/public.decorator';
import { Permission } from '@/common/decorators/permission.decorator';
import { User } from '@/common/decorators/user.decorator';
import { users } from '@prisma/client';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Protected + Permission
  @Post()
  @Permission('CREATE', 'NOTIFICATION')
  create(
    @User() user: users,
    @Body() dto: CreateNotificationDto,
  ) {
    return this.notificationService.create(user.id, dto);
  }

  // Public
  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }
}
```

### Bước 5 — Tạo Module

```typescript
// notification.module.ts
import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
```

### Bước 6 — Import vào AppModule

```typescript
// app.module.ts
import { NotificationModule } from './modules-api/notification/notification.module';

@Module({
  imports: [
    TokenModule,
    PrismaModule,
    ConcertModule,
    VoucherModule,
    BookingModule,
    NotificationModule, // ← thêm vào đây
  ],
  // ...
})
export class AppModule {}
```

### Checklist khi tạo API mới

- [ ] Tạo DTO với validation (`class-validator`)
- [ ] Service inject `PrismaService`, xử lý logic và throw exception chuẩn
- [ ] Controller dùng đúng decorator: `@Public()` hoặc `@Permission(action, resource)`
- [ ] Dùng `@User()` để lấy user hiện tại thay vì parse token thủ công
- [ ] Import module vào `AppModule`
- [ ] Viết unit test cho service mới (xem phần 3)

### Decorators tham khảo

```typescript
@Public()                        // Bypass JWT guard — không cần đăng nhập
@Permission("CREATE", "RESOURCE") // Yêu cầu permission cụ thể
@User()                          // Inject user object từ request (sau khi đã auth)
@Role("Admin")                   // Kiểm tra role (optional)
```

---

## 3. Chạy Unit Test

### Các file test hiện có

```
src/modules-api/
├── auth/auth.service.spec.ts
├── concert/concert.service.spec.ts
├── booking/
│   ├── booking.service.spec.ts
│   └── inventory.service.spec.ts
└── voucher/voucher.service.spec.ts
```

### Lệnh chạy test

```bash
# Chạy tất cả tests
npm run test

# Chạy test của một file cụ thể
npm run test -- auth.service.spec.ts
npm run test -- concert.service.spec.ts
npm run test -- booking.service.spec.ts
npm run test -- inventory.service.spec.ts
npm run test -- voucher.service.spec.ts

# Chạy với coverage report
npm run test:cov

# Chạy ở watch mode (tự reload khi code thay đổi)
npm run test:watch
```

### Cấu trúc một unit test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MyService } from './my.service';
import { PrismaService } from '@/modules-system/prisma/prisma.service';

describe('MyService', () => {
  let service: MyService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyService,
        {
          provide: PrismaService,
          useValue: {
            myTable: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MyService>(MyService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('should create successfully', async () => {
      // Arrange
      prisma.myTable.create.mockResolvedValue({ id: '1', title: 'Test' });

      // Act
      const result = await service.create('user-id', { title: 'Test' });

      // Assert
      expect(result).toBe(true);
      expect(prisma.myTable.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ title: 'Test' }) })
      );
    });

    it('should throw when resource not found', async () => {
      prisma.myTable.findUnique.mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow('not found');
    });
  });
});
```

### Coverage hiện tại

| Service | Test cases |
|---------|-----------|
| `AuthService` | register (success + duplicate email), login (success + user not found), getTypeList |
| `ConcertService` | create, findAll (paginated), findOne (success + not found), update, remove (soft delete) |
| `BookingService` | createBooking (success + category not found), getBookingById (success + not found), getMyBookings, updateStatus |
| `InventoryService` | reserveTickets (success + not enough tickets + category not found), releaseTickets |
| `VoucherService` | create, findAll (paginated), findOne (success + not found) |

### Best practices

**Đặt tên test rõ ràng** — dùng pattern `should [do X] when [condition Y]`

**Chỉ một assertion chính** mỗi test case — dễ debug khi fail

**Mock toàn bộ dependencies** — không gọi database hay external service thật

**Luôn test cả error cases** — không chỉ happy path

**AAA pattern** — Arrange → Act → Assert, phân tách rõ ràng

### Troubleshooting

```bash
# Lỗi "Cannot find module" → kiểm tra paths trong tsconfig.json và jest config
npm install

# Xóa cache test nếu có lỗi lạ
npm run test -- --clearCache

# Test bị timeout → thêm vào đầu file test
jest.setTimeout(10000)
```