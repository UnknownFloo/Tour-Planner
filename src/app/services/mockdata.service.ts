import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import * as Leaflet from "leaflet"


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
    startCoordinate: Leaflet.LatLngLiteral;
    endCoordinate: Leaflet.LatLngLiteral;
    distance: number;
    time: number;
    vehicleType: vehicle;
    tourComments: TourComment[];
}



@Injectable({providedIn: "root"})
export class MockDataService{
    private Tours  = new BehaviorSubject<Tour[]>([
        { 
            id: 1, 
            name: "My First Tour", 
            author: "System", 
            description: "Eine entspannte Fahrradtour durch Wien, perfekt für Anfänger.",
            startCoordinate: {lat: 48.2079155684571, lng: 16.383361816406254},
            endCoordinate: {lat: 48.201043339417126, lng: 16.39915466308594},
            distance: 0,
            time: 0,
            vehicleType: "cycling-road",
            tourComments: [
                {id: 1, title: "Great Tour", author: "System", difficulty: 3, enjoyment: 5},
                {id: 2, title: "Short not worth", author: "System", difficulty: 1, enjoyment: 1, comment: "The route is pretty short, pretty much just riding 2 Streets"}
            ]            
        },
        { 
            id: 2, 
            name: "My Second Tour", 
            author: "System", 
            description: "Eine kurze, aber intensive Rennradstrecke mit einigen Hügeln.",
            startCoordinate: {lat: 48.21094100893029, lng: 16.39597892761231},
            endCoordinate: {lat: 48.211799921984905, lng: 16.40271663665772},
            distance: 0,
            time: 0,
            vehicleType: "cycling-road",
            tourComments: []            
        },
    ])

    tours$ = this.Tours.asObservable();

    getTourByID(id: number) {
        return this.tours$.pipe(map(tours => tours.find(tour => tour.id === id)));
    }

    addTour(tour: Tour) {
        const currentTours = this.Tours.value;
        this.Tours.next([...currentTours, tour]);
    }

    updateTour(updatedTour: Tour) {
        const currentTours = this.Tours.value;
        const nextTours = currentTours.map((tour) =>
            tour.id === updatedTour.id ? updatedTour : tour
        );
        this.Tours.next(nextTours);
    }

    deleteTour(id: number) {
        const currentTours = this.Tours.value;
        const nextTours = currentTours.filter((tour) => tour.id !== id);
        this.Tours.next(nextTours);
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
    }

}