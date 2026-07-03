import { Injectable, inject, effect } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import * as Leaflet from "leaflet"
import { AuthService } from "./auth.service";


export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type Enjoyment =  1 | 2 | 3 | 4 | 5; 
export type vehicle = "driving-car" | "cycling-regular" | "cycling-road" | "cycling-mountain" | "cycling-electric" | "foot-walking" | "foot-hiking"

export interface TourComment {
    id: number;
    title: string;
    author: string;
    difficulty: Difficulty;
    enjoyment: Enjoyment;
    comment?: string;
}

export interface Tour {
    id: number;
    name: string;
    author: string;
    description: string;
    imageUrl?: string;
    isPublic?: boolean;
    startCoordinate: Leaflet.LatLngLiteral;
    endCoordinate: Leaflet.LatLngLiteral;
    distance: number;
    time: number;
    vehicleType: vehicle;
    tourComments: TourComment[];
}



@Injectable({providedIn: "root"})
export class MockDataService{
    private readonly authService = inject(AuthService);

    private get storageKey() {
        const username = this.authService.username() ?? 'guest';
        return `tourplanner_tours_${username}`;
    }

    private readonly defaultTours: Tour[] = [];

    private Tours = new BehaviorSubject<Tour[]>(this.defaultTours);

    tours$ = this.Tours.asObservable();

    constructor() {
        effect(() => {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved) as Tour[];
                    this.Tours.next(parsed);
                } catch {
                    this.Tours.next(this.defaultTours);
                }
            } else {
                this.Tours.next(this.defaultTours);
            }
        });
    }

    private saveTours() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.Tours.value));
    }

    getTourByID(id: number) {
        return this.tours$.pipe(map(tours => tours.find(tour => tour.id === id)));
    }

    addTour(tour: Tour) {
        const currentTours = this.Tours.value;
        const nextTours = [...currentTours, tour];
        this.Tours.next(nextTours);
        this.saveTours();
    }

    updateTour(updatedTour: Tour) {
        const currentTours = this.Tours.value;
        const nextTours = currentTours.map((tour) =>
            tour.id === updatedTour.id ? updatedTour : tour
        );
        this.Tours.next(nextTours);
        this.saveTours();
    }

    deleteTour(id: number) {
        const currentTours = this.Tours.value;
        const nextTours = currentTours.filter((tour) => tour.id !== id);
        this.Tours.next(nextTours);
        this.saveTours();
    }

    addTourComment(tourId: number, comment: Omit<TourComment, "id">) {
        const currentTours = this.Tours.value;
        const nextTours = currentTours.map((tour) => {
            if (tour.id !== tourId) {
                return tour;
            }

            const nextId = tour.tourComments.length > 0
                ? Math.max(...tour.tourComments.map((existingComment) => existingComment.id)) + 1
                : 1;

            return {
                ...tour,
                tourComments: [...tour.tourComments, { ...comment, id: nextId }]
            };
        });
        this.Tours.next(nextTours);
        this.saveTours();
    }

    updateTourComment(tourId: number, updatedComment: TourComment) {
        const currentTours = this.Tours.value;
        const nextTours = currentTours.map((tour) => {
            if (tour.id !== tourId) {
                return tour;
            }

            const nextComments = tour.tourComments.map((comment) =>
                comment.id === updatedComment.id ? updatedComment : comment
            );

            return {
                ...tour,
                tourComments: nextComments
            };
        });
        this.Tours.next(nextTours);
        this.saveTours();
    }

    deleteTourComment(tourId: number, commentId: number) {
        const currentTours = this.Tours.value;
        const nextTours = currentTours.map((tour) => {
            if (tour.id !== tourId) {
                return tour;
            }
            return {
                ...tour,
                tourComments: tour.tourComments.filter((comment) => comment.id !== commentId)
            };
        });
        this.Tours.next(nextTours);
        this.saveTours();
    }

    exportToJSON(): string {
        return JSON.stringify(this.Tours.value, null, 2);
    }

    private getUniqueName(baseName: string, existingNames: Set<string>): string {
        const normalizedBase = baseName.trim() || 'Tour';
        let candidate = normalizedBase;
        let suffix = 1;

        while (existingNames.has(candidate.toLowerCase())) {
            const copySuffix = suffix === 1 ? '_copy' : `_copy${suffix}`;
            candidate = `${normalizedBase}${copySuffix}`;
            suffix += 1;
        }

        existingNames.add(candidate.toLowerCase());
        return candidate;
    }

    importFromJSON(jsonData: string): boolean {
        try {
            const parsed = JSON.parse(jsonData) as Tour[];
            if (!Array.isArray(parsed)) {
                return false;
            }

            const currentTours = this.Tours.value;
            const existingNames = new Set(currentTours.map((tour) => tour.name.toLowerCase()));
            const existingIds = new Set(currentTours.map((tour) => tour.id));
            let nextId = currentTours.length > 0 ? Math.max(...currentTours.map((tour) => tour.id)) + 1 : 1;

            const importedTours = parsed.map((item) => {
                const name = this.getUniqueName(item.name ?? `Tour ${nextId}`, existingNames);
                const tourId = existingIds.has(item.id) || item.id == null ? nextId++ : item.id;
                existingIds.add(tourId);

                return {
                    ...item,
                    id: tourId,
                    name,
                    description: item.description ?? '',
                    author: item.author ?? this.authService.username() ?? 'Unbekannt',
                    imageUrl: item.imageUrl?.trim() || undefined,
                    isPublic: item.isPublic ?? false,
                    startCoordinate: item.startCoordinate ?? { lat: 0, lng: 0 },
                    endCoordinate: item.endCoordinate ?? { lat: 0, lng: 0 },
                    distance: item.distance ?? 0,
                    time: item.time ?? 0,
                    vehicleType: item.vehicleType ?? 'cycling-regular',
                    tourComments: Array.isArray(item.tourComments) ? item.tourComments : []
                } as Tour;
            });

            this.Tours.next([...currentTours, ...importedTours]);
            this.saveTours();
            return true;
        } catch {
            return false;
        }
    }

    downloadAsFile(): void {
        const json = this.exportToJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tours_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    exportSelectedTours(tourIds: number[]): number {
        const currentTours = this.Tours.value;
        const selectedTours = tourIds.length > 0
            ? currentTours.filter(t => tourIds.includes(t.id))
            : currentTours;

        if (selectedTours.length === 0) {
            return 0;
        }

        const json = JSON.stringify(selectedTours, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tours_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);

        return selectedTours.length;
    }

}