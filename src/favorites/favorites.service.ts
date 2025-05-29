import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { FavoritesResponse } from './entities/favorite.entity';
import { ArtistsService } from '../artists/artists.service';
import { AlbumsService } from '../albums/albums.service';
import { TracksService } from '../tracks/tracks.service';

@Injectable()
export class FavoritesService {
  private favoriteArtists: string[] = [];
  private favoriteAlbums: string[] = [];
  private favoriteTracks: string[] = [];

  constructor(
    @Inject(forwardRef(() => ArtistsService))
    private artistsService: ArtistsService,
    @Inject(forwardRef(() => AlbumsService))
    private albumsService: AlbumsService,
    @Inject(forwardRef(() => TracksService))
    private tracksService: TracksService,
  ) {}

  findAll(): FavoritesResponse {
    const artists = this.favoriteArtists
      .map((id) => {
        try {
          return this.artistsService.findOne(id);
        } catch {
          return null; // In case artist was deleted
        }
      })
      .filter((artist) => artist !== null);

    const albums = this.favoriteAlbums
      .map((id) => {
        try {
          return this.albumsService.findOne(id);
        } catch {
          return null; // In case album was deleted
        }
      })
      .filter((album) => album !== null);

    const tracks = this.favoriteTracks
      .map((id) => {
        try {
          return this.tracksService.findOne(id);
        } catch {
          return null;
        }
      })
      .filter((track) => track !== null);

    return { artists, albums, tracks };
  }

  addArtist(id: string): void {
    try {
      this.artistsService.findOne(id);
    } catch {
      throw new UnprocessableEntityException(
        `Artist with id ${id} doesn't exist`,
      );
    }

    if (!this.favoriteArtists.includes(id)) {
      this.favoriteArtists.push(id);
    }
  }

  removeArtist(id: string): void {
    const index = this.favoriteArtists.indexOf(id);
    if (index === -1) {
      throw new NotFoundException('Artist not found in favorites');
    }
    this.favoriteArtists.splice(index, 1);
  }

  addAlbum(id: string): void {
    try {
      this.albumsService.findOne(id);
    } catch {
      throw new UnprocessableEntityException(
        `Album with id ${id} doesn't exist`,
      );
    }

    if (!this.favoriteAlbums.includes(id)) {
      this.favoriteAlbums.push(id);
    }
  }

  removeAlbum(id: string): void {
    const index = this.favoriteAlbums.indexOf(id);
    if (index === -1) {
      throw new NotFoundException('Album not found in favorites');
    }
    this.favoriteAlbums.splice(index, 1);
  }

  addTrack(id: string): void {
    try {
      this.tracksService.findOne(id);
    } catch {
      throw new UnprocessableEntityException(
        `Track with id ${id} doesn't exist`,
      );
    }

    if (!this.favoriteTracks.includes(id)) {
      this.favoriteTracks.push(id);
    }
  }

  removeTrack(id: string): void {
    const index = this.favoriteTracks.indexOf(id);
    if (index === -1) {
      throw new NotFoundException('Track not found in favorites');
    }
    this.favoriteTracks.splice(index, 1);
  }

  removeArtistFromFavorites(artistId: string): void {
    const index = this.favoriteArtists.indexOf(artistId);
    if (index !== -1) {
      this.favoriteArtists.splice(index, 1);
    }
  }

  removeAlbumFromFavorites(albumId: string): void {
    const index = this.favoriteAlbums.indexOf(albumId);
    if (index !== -1) {
      this.favoriteAlbums.splice(index, 1);
    }
  }

  removeTrackFromFavorites(trackId: string): void {
    const index = this.favoriteTracks.indexOf(trackId);
    if (index !== -1) {
      this.favoriteTracks.splice(index, 1);
    }
  }
}
