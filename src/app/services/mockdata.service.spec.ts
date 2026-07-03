import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { MockDataService, Tour, Difficulty, Enjoyment } from './mockdata.service';

const sampleTour: Tour = {
  id: 1,
  name: 'Test Tour',
  author: 'Tester',
  description: 'A test tour',
  imageUrl: 'https://example.com/image.jpg',
  isPublic: false,
  startCoordinate: { lat: 49.0, lng: 8.4 },
  endCoordinate: { lat: 49.1, lng: 8.5 },
  distance: 10,
  time: 60,
  vehicleType: 'cycling-regular',
  tourComments: []
};

describe('MockDataService', () => {
  let service: MockDataService;
  let originalLocalStorage: typeof globalThis.localStorage | undefined;

  beforeEach(() => {
    originalLocalStorage = globalThis.localStorage;
    vi.stubGlobal('localStorage', {
      clear: vi.fn(),
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    service = new MockDataService();
  });

  afterEach(() => {
    if (originalLocalStorage) {
      vi.stubGlobal('localStorage', originalLocalStorage);
    } else {
      delete (globalThis as any).localStorage;
    }
  });

  it('should import tours and keep existing tours', () => {
    service.addTour(sampleTour);
    const json = JSON.stringify([{ ...sampleTour, id: 1, name: 'Test Tour' }]);

    const result = service.importFromJSON(json);

    expect(result).toBe(true);
    expect(service['Tours'].value.length).toBe(2);
    expect(service['Tours'].value[1].name).toContain('_copy');
  });

  it('should export selected tours and return count', () => {
    service.addTour(sampleTour);
    const count = service.exportSelectedTours([sampleTour.id]);

    expect(count).toBe(1);
  });

  it('should export all tours when no selection is made', () => {
    service.addTour(sampleTour);
    const count = service.exportSelectedTours([]);

    expect(count).toBe(1);
  });

  it('should add new tour with auto-incremented ID', () => {
    service.addTour(sampleTour);
    
    const secondTour = { ...sampleTour, id: 2, name: 'Another Tour' };
    service.addTour(secondTour);
    
    expect(service['Tours'].value.length).toBe(2);
  });

  it('should update existing tour', () => {
    service.addTour(sampleTour);
    
    const updatedTour = {
      ...sampleTour,
      name: 'Updated Tour Name',
      description: 'Updated description'
    };
    service.updateTour(updatedTour);
    
    const tours = service['Tours'].value;
    expect(tours[0].name).toBe('Updated Tour Name');
  });

  it('should delete tour by ID', () => {
    service.addTour(sampleTour);
    service.addTour({ ...sampleTour, id: 2, name: 'Tour 2' });
    
    service.deleteTour(1);
    
    expect(service['Tours'].value.length).toBe(1);
    expect(service['Tours'].value[0].id).toBe(2);
  });

  it('should add tour comment', () => {
    service.addTour(sampleTour);
    
    service.addTourComment(1, {
      title: 'Great tour',
      author: 'Reviewer',
      difficulty: 3 as Difficulty,
      enjoyment: 4 as Enjoyment,
      comment: 'Beautiful scenery'
    });
    
    const tour = service['Tours'].value[0];
    expect(tour.tourComments.length).toBe(1);
    expect(tour.tourComments[0].title).toBe('Great tour');
  });

  it('should update tour comment', () => {
    service.addTour(sampleTour);
    
    const comment = {
      id: 1,
      title: 'Great tour',
      author: 'Reviewer',
      difficulty: 3 as Difficulty,
      enjoyment: 4 as Enjoyment
    };
    
    service.addTourComment(1, comment);
    
    service.updateTourComment(1, {
      ...comment,
      title: 'Updated comment',
      enjoyment: 5 as Enjoyment
    });
    
    const tour = service['Tours'].value[0];
    expect(tour.tourComments[0].title).toBe('Updated comment');
    expect(tour.tourComments[0].enjoyment).toBe(5);
  });

  it('should delete tour comment', () => {
    service.addTour(sampleTour);
    
    service.addTourComment(1, {
      title: 'Comment 1',
      author: 'User',
      difficulty: 2 as Difficulty,
      enjoyment: 3 as Enjoyment
    });
    
    service.addTourComment(1, {
      title: 'Comment 2',
      author: 'User',
      difficulty: 4 as Difficulty,
      enjoyment: 4 as Enjoyment
    });
    
    const tour = service['Tours'].value[0];
    const firstCommentId = tour.tourComments[0].id;
    
    service.deleteTourComment(1, firstCommentId);
    
    expect(service['Tours'].value[0].tourComments.length).toBe(1);
    expect(service['Tours'].value[0].tourComments[0].title).toBe('Comment 2');
  });

  it('should get tour by ID', async () => {
    service.addTour(sampleTour);
    
    const tour = await service.getTourByID(1).toPromise();
    
    expect(tour).toBeDefined();
    expect(tour?.name).toBe('Test Tour');
  });

  it('should handle invalid JSON import gracefully', () => {
    const invalidJson = 'not valid json {]';
    
    const result = service.importFromJSON(invalidJson);
    
    expect(result).toBe(false);
  });
});
