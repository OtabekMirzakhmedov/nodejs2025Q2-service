import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Track } from '@prisma/client';

@Injectable()
export class TracksService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Track[]> {
    return await this.prisma.track.findMany();
  }

  async findOne(id: string): Promise<Track> {
    const track = await this.prisma.track.findUnique({
      where: { id },
    });

    if (!track) {
      throw new NotFoundException(`Track with id ${id} not found`);
    }

    return track;
  }

  async create(createTrackDto: CreateTrackDto): Promise<Track> {
    return await this.prisma.track.create({
      data: {
        name: createTrackDto.name,
        duration: createTrackDto.duration,
        artistId: createTrackDto.artistId || null,
        albumId: createTrackDto.albumId || null,
      },
    });
  }

  async update(id: string, updateTrackDto: UpdateTrackDto): Promise<Track> {
    try {
      return await this.prisma.track.update({
        where: { id },
        data: {
          name: updateTrackDto.name,
          duration: updateTrackDto.duration,
          artistId: updateTrackDto.artistId || null,
          albumId: updateTrackDto.albumId || null,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Track with id ${id} not found`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.findOne(id);

      await this.prisma.track.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Track with id ${id} not found`);
    }
  }
}
