import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface LatLngLiteral {
  lat: number;
  lng: number;
}

export type VehicleType =
  | 'driving-car'
  | 'cycling-regular'
  | 'cycling-road'
  | 'cycling-mountain'
  | 'cycling-electric'
  | 'foot-walking'
  | 'foot-hiking';

export interface TourComment {
  id: number;
  title: string;
  author: string;
  authorId?: number;
  difficulty: number;
  enjoyment: number;
  comment?: string;
}

export interface Tour {
  id?: number;
  name: string;
  description: string;
  startCoordinate: LatLngLiteral;
  endCoordinate: LatLngLiteral;
  transportType: VehicleType;
  vehicleType: VehicleType;
  distance: number;
  time: number;
  imageUrl?: string;
  isPublic: boolean;
  author?: string;
  popularity?: number;
  childFriendliness?: number;
  tourComments: TourComment[];
}

interface TourLogDto {
  id?: number;
  timestamp?: string | Date;
  comment?: string;
  difficulty: number;
  totalDistanceKm: number;
  totalTimeMinutes: number;
  rating: number;
}

interface TourDto {
  id?: number;
  name: string;
  description: string;
  startLatitude: number;
  startLongitude: number;
  endLatitude: number;
  endLongitude: number;
  transportType: VehicleType;
  distanceKm: number;
  estimatedTimeMinutes: number;
  imageUrl?: string;
  isPublic: boolean;
  author?: string;
  popularity?: number;
  childFriendliness?: number;
  tourLogs: TourLogDto[];
}

@Injectable({ providedIn: 'root' })
export class TourService {
  private readonly baseUrl = 'http://localhost:5073/api/tours';

  readonly tours = signal<Tour[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  async getAllTours(): Promise<Tour[]> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const tours = await firstValueFrom(this.http.get<TourDto[]>(this.baseUrl));
      const normalized = tours.map(dto => this.mapDtoToTour(dto));
      this.tours.set(normalized);
      return normalized;
    } catch (err: any) {
      const errorMsg = err?.error?.message || 'Failed to load tours';
      this.error.set(errorMsg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async createTour(tour: Tour): Promise<Tour> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const created = await firstValueFrom(this.http.post<TourDto>(this.baseUrl, this.mapTourToDto(tour)));
      const normalized = this.mapDtoToTour(created);

      this.tours.set([...this.tours(), normalized]);
      return normalized;
    } catch (err: any) {
      const errorMsg = err?.error?.details || err?.error?.message || 'Failed to create tour';
      this.error.set(errorMsg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async getTourById(id: number): Promise<Tour> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const tourDto = await firstValueFrom(this.http.get<TourDto>(`${this.baseUrl}/${id}`));
      return this.mapDtoToTour(tourDto);
    } catch (err: any) {
      if (err?.status === 404) {
        try {
          const publicTourDto = await firstValueFrom(this.http.get<TourDto>(`${this.baseUrl}/public/${id}`));
          return this.mapDtoToTour(publicTourDto);
        } catch (publicErr: any) {
          const publicError = publicErr?.error?.message || 'Failed to load public tour';
          this.error.set(publicError);
          throw publicErr;
        }
      }

      const errorMsg = err?.error?.message || 'Failed to load tour';
      this.error.set(errorMsg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async getOwnedTourById(id: number): Promise<Tour> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const tourDto = await firstValueFrom(this.http.get<TourDto>(`${this.baseUrl}/${id}`));
      return this.mapDtoToTour(tourDto);
    } catch (err: any) {
      const errorMsg = err?.error?.message || 'Failed to load tour';
      this.error.set(errorMsg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateTour(id: number, tour: Tour): Promise<Tour> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const updatedDto = await firstValueFrom(this.http.put<TourDto>(`${this.baseUrl}/${id}`, this.mapTourToDto(tour)));
      const normalized = this.mapDtoToTour(updatedDto);

      this.tours.set(this.tours().map(item => item.id === id ? normalized : item));
      return normalized;
    } catch (err: any) {
      const errorMsg = err?.error?.message || err?.error?.details || JSON.stringify(err?.error) || 'Failed to update tour';
      this.error.set(errorMsg);
      console.error('Tour update error:', err?.error);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async addLog(tourId: number, comment: TourComment): Promise<TourComment> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const createdDto = await firstValueFrom(this.http.post<TourLogDto>(`${this.baseUrl}/${tourId}/logs`, this.mapCommentToLog(comment)));
      return this.mapLogDtoToComment(createdDto);
    } catch (err: any) {
      const errorMsg = err?.error?.details || err?.error?.message || 'Failed to add comment';
      this.error.set(errorMsg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateLog(tourId: number, logId: number, comment: TourComment): Promise<TourComment> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const updatedDto = await firstValueFrom(this.http.put<TourLogDto>(`${this.baseUrl}/${tourId}/logs/${logId}`, this.mapCommentToLog(comment)));
      return this.mapLogDtoToComment(updatedDto);
    } catch (err: any) {
      const errorMsg = err?.error?.details || err?.error?.message || 'Failed to update comment';
      this.error.set(errorMsg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteLog(tourId: number, logId: number): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      await firstValueFrom(this.http.delete(`${this.baseUrl}/${tourId}/logs/${logId}`));
    } catch (err: any) {
      const errorMsg = err?.error?.details || err?.error?.message || 'Failed to delete comment';
      this.error.set(errorMsg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteTour(id: number): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      await firstValueFrom(this.http.delete(`${this.baseUrl}/${id}`));
      this.tours.set(this.tours().filter(t => t.id !== id));
    } catch (err: any) {
      const errorMsg = err?.error?.message || 'Failed to delete tour';
      this.error.set(errorMsg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async searchTours(query: string): Promise<Tour[]> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const tours = await firstValueFrom(
        this.http.get<TourDto[]>(`${this.baseUrl}/search`, { params: { query } })
      );
      const normalized = tours.map(dto => this.mapDtoToTour(dto));
      this.tours.set(normalized);
      return normalized;
    } catch (err: any) {
      const errorMsg = err?.error?.message || 'Search failed';
      this.error.set(errorMsg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  private mapDtoToTour(dto: TourDto): Tour {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      imageUrl: dto.imageUrl,
      isPublic: dto.isPublic,
      author: dto.author,
      popularity: dto.popularity,
      childFriendliness: dto.childFriendliness,
      startCoordinate: { lat: dto.startLatitude, lng: dto.startLongitude },
      endCoordinate: { lat: dto.endLatitude, lng: dto.endLongitude },
      distance: dto.distanceKm,
      time: dto.estimatedTimeMinutes,
      transportType: dto.transportType,
      vehicleType: dto.transportType,
      tourComments: dto.tourLogs?.map(this.mapLogDtoToComment) ?? []
    };
  }

  private mapTourToDto(tour: Tour): TourDto {
    const dto: TourDto = {
      id: tour.id,
      name: tour.name,
      description: tour.description,
      startLatitude: tour.startCoordinate.lat,
      startLongitude: tour.startCoordinate.lng,
      endLatitude: tour.endCoordinate.lat,
      endLongitude: tour.endCoordinate.lng,
      transportType: tour.transportType || tour.vehicleType,
      distanceKm: tour.distance,
      estimatedTimeMinutes: Math.round(tour.time),
      imageUrl: tour.imageUrl ?? '',
      isPublic: tour.isPublic,
      author: '',
      popularity: 0,
      childFriendliness: 0,
      tourLogs: []
    };
    console.log('Mapped DTO for update:', dto);
    return dto;
  }

  private mapCommentToLog(comment: TourComment): TourLogDto {
    return {
      id: comment.id,
      timestamp: new Date(),
      comment: JSON.stringify({
        title: comment.title,
        author: comment.author,
        authorId: comment.authorId,
        comment: comment.comment
      }),
      difficulty: comment.difficulty,
      totalDistanceKm: 0,
      totalTimeMinutes: 0,
      rating: comment.enjoyment
    };
  }

  private mapLogDtoToComment = (log: TourLogDto): TourComment => {
    let metadata: { title?: string; author?: string; authorId?: number; comment?: string } | null = null;
    try {
      if (log.comment) {
        metadata = JSON.parse(log.comment);
      }
    } catch {
      metadata = null;
    }

    return {
      id: log.id ?? 0,
      title: metadata?.title ?? `Log #${log.id ?? 0}`,
      author: metadata?.author ?? 'System',
      authorId: metadata?.authorId ?? undefined,
      difficulty: log.difficulty,
      enjoyment: log.rating,
      comment: metadata?.comment ?? log.comment ?? ''
    };
  };
}
