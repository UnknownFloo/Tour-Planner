import { inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

interface RawPublicTourDto {
    id: number;
    name: string;
    author: string;
    description: string;
    imageUrl?: string;
    transportType: string;
    startLatitude: number;
    startLongitude: number;
    endLatitude: number;
    endLongitude: number;
    distanceKm: number;
    estimatedTimeMinutes: number;
    popularity: number;
    childFriendliness: number;
}

interface PublicTour {
    id: number;
    name: string;
    author: string;
    description: string;
    imageUrl?: string;
    vehicleType: string;
    startCoordinate: { lat: number; lng: number };
    endCoordinate: { lat: number; lng: number };
    distance: number;
    time: number;
    popularity: number;
    childFriendliness: number;
}

export class DiscoverViewModel {
    private readonly baseUrl = 'http://localhost:5073/api/tours/public';

    private readonly http = inject(HttpClient);

    readonly tours = toSignal(
        this.http.get<RawPublicTourDto[]>(this.baseUrl).pipe(
            map(dtos => dtos.map(dto => this.mapDtoToTour(dto)))
        ),
        { initialValue: [] as PublicTour[] }
    );
    readonly title = signal('Öffentliche Tours');

    private mapDtoToTour(dto: RawPublicTourDto): PublicTour {
        return {
            id: dto.id,
            name: dto.name,
            author: dto.author,
            description: dto.description,
            imageUrl: dto.imageUrl,
            vehicleType: dto.transportType,
            startCoordinate: { lat: dto.startLatitude, lng: dto.startLongitude },
            endCoordinate: { lat: dto.endLatitude, lng: dto.endLongitude },
            distance: dto.distanceKm,
            time: dto.estimatedTimeMinutes,
            popularity: dto.popularity,
            childFriendliness: dto.childFriendliness,
        };
    }
}