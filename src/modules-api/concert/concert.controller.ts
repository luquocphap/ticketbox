import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ConcertService } from './concert.service';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Permission } from 'src/common/decorators/permission.decorator';
import { User } from 'src/common/decorators/user.decorator';
import type { users } from '@prisma/client';
import { QueryPaginatedDto } from './dto/find-all.dto';

@Controller('concert')
export class ConcertController {
  constructor(private readonly concertService: ConcertService) {}

  @Post()
  @Permission("CREATE", "CONCERT")
  create(@User() user: users, @Body() createConcertDto: CreateConcertDto) {
    return this.concertService.create(user, createConcertDto);
  }

  @Get()
  @Public()
  findAll(@Query() query: QueryPaginatedDto) {
    return this.concertService.findAll(query);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.concertService.findOne(id);
  }

  @Patch(':id')
  @Permission("UPDATE", "CONCERT")
  update(@Param('id') id: string, @Body() updateConcertDto: UpdateConcertDto) {
    return this.concertService.update(id, updateConcertDto);
  }

  @Delete(':id')
  @Permission("DELETE", "CONCERT")
  remove(@User() user: users, @Param('id') id: string) {
    return this.concertService.remove(user.id, id);
  }
}
