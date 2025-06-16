import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ArtistsService } from '../artists/artists.service';
import { AlbumsService } from '../albums/albums.service';
import { TracksService } from '../tracks/tracks.service';
import { FavoritesResponse } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ArtistsService))
    private artistsService: ArtistsService,
    @Inject(forwardRef(() => AlbumsService))
    private albumsService: AlbumsService,
    @Inject(forwardRef(() => TracksService))
    private tracksService: TracksService,
  ) {}

  async findAll(): Promise<FavoritesResponse> {
    const [favoriteArtists, favoriteAlbums, favoriteTracks] = await Promise.all(
      [
        this.prisma.favoriteArtist.findMany({
          include: { artist: true },
        }),
        this.prisma.favoriteAlbum.findMany({
          include: { album: true },
        }),
        this.prisma.favoriteTrack.findMany({
          include: { track: true },
        }),
      ],
    );

    return {
      artists: favoriteArtists.map((fa) => fa.artist),
      albums: favoriteAlbums.map((fa) => fa.album),
      tracks: favoriteTracks.map((ft) => ft.track),
    };
  }

  async addArtist(id: string): Promise<void> {
    try {
      await this.artistsService.findOne(id);
    } catch {
      throw new UnprocessableEntityException(
        `Artist with id ${id} doesn't exist`,
      );
    }

    try {
      await this.prisma.favoriteArtist.create({
        data: { artistId: id },
      });
    } catch {}
  }

  async removeArtist(id: string): Promise<void> {
    try {
      await this.prisma.favoriteArtist.delete({
        where: { artistId: id },
      });
    } catch {
      throw new NotFoundException('Artist not found in favorites');
    }
  }

  async addAlbum(id: string): Promise<void> {
    try {
      await this.albumsService.findOne(id);
    } catch {
      throw new UnprocessableEntityException(
        `Album with id ${id} doesn't exist`,
      );
    }

    try {
      await this.prisma.favoriteAlbum.create({
        data: { albumId: id },
      });
    } catch {}
  }

  async removeAlbum(id: string): Promise<void> {
    try {
      await this.prisma.favoriteAlbum.delete({
        where: { albumId: id },
      });
    } catch {
      throw new NotFoundException('Album not found in favorites');
    }
  }

  async addTrack(id: string): Promise<void> {
    try {
      await this.tracksService.findOne(id);
    } catch {
      throw new UnprocessableEntityException(
        `Track with id ${id} doesn't exist`,
      );
    }

    try {
      await this.prisma.favoriteTrack.create({
        data: { trackId: id },
      });
    } catch {}
  }

  async removeTrack(id: string): Promise<void> {
    try {
      await this.prisma.favoriteTrack.delete({
        where: { trackId: id },
      });
    } catch {
      throw new NotFoundException('Track not found in favorites');
    }
  }

  async removeArtistFromFavorites(artistId: string): Promise<void> {
    try {
      await this.prisma.favoriteArtist.delete({
        where: { artistId },
      });
    } catch {}
  }

  async removeAlbumFromFavorites(albumId: string): Promise<void> {
    try {
      await this.prisma.favoriteAlbum.delete({
        where: { albumId },
      });
    } catch {}
  }

  async removeTrackFromFavorites(trackId: string): Promise<void> {
    try {
      await this.prisma.favoriteTrack.delete({
        where: { trackId },
      });
    } catch {}
  }
}
