import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import type { users } from '@prisma/client';
import { QueryPaginatedDto } from './dto/find-all.dto';
import { buildQueryConcert } from 'src/common/helpers/build-query-concert.helper';

@Injectable()
export class ConcertService {
  constructor(private prisma: PrismaService){}
  async create(user: users, createConcertDto: CreateConcertDto) {
    const { title, event_date, venue } = createConcertDto;
    
    await this.prisma.concerts.create({
      data: {
        title: title,
        event_date: event_date,
        venue: venue,
        created_by: user.id
      }
    })

    return true;
  }

  async findAll(query: QueryPaginatedDto) {
    const { index, pageSize, page, where } = buildQueryConcert(query);
    const usersPromise = this.prisma.concerts.findMany({
            where: where,
            skip: index,
            take: pageSize,
        })

        const totalConcertPromise = this.prisma.concerts.count({
            where: where
        })

        const [users, totalConcert] = await Promise.all([usersPromise, totalConcertPromise]);

        const totolPages = Math.ceil(totalConcert / pageSize);

        return {
            currentPage: page,
            count: pageSize,
            totalPages: totolPages,
            totalCount: totalConcert,
            items: users
        }
  }

  async findOne(id: string) {
    const concert = await this.prisma.concerts.findUnique({
      where: {
        id: id
      }
    });

    if (!concert) throw new BadRequestException("Concert does not exist");

    return concert;
  }

  async update(id: string, updateConcertDto: UpdateConcertDto) {
    const { title, event_date, venue } = updateConcertDto;
    const concert = await this.prisma.concerts.findUnique({
      where: {
        id: id
      }
    });

    if (!concert) throw new BadRequestException("Concert does not exist");

    await this.prisma.concerts.update({
      where: {
        id: concert.id
      },

      data: {
        title: title,
        event_date: event_date,
        venue: venue
      }
    })

    return true;

  }

  async remove(userId: string,id: string) {
    const concert = await this.prisma.concerts.findUnique({
      where: {
        id: id
      }
    });

    if (!concert) throw new BadRequestException("Concert does not exist");

    await this.prisma.concerts.update({
      where: {
        id: concert.id
      },

      data: {
        isDeleted: true,
        deletedBy: userId
      }
    })

    return true;
  }
}
