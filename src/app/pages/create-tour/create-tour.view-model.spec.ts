import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CreateTourViewModel } from './create-tour.view-model';

class MockDataService {
  addTour = vi.fn();
}

class MockAuthService {
  username = vi.fn().mockReturnValue('Tester');
}

class MockRouter {
  navigate = vi.fn().mockResolvedValue(true);
}

describe('CreateTourViewModel', () => {
  let vm: CreateTourViewModel;
  let mockDataService: MockDataService;
  let mockAuthService: MockAuthService;
  let mockRouter: MockRouter;

  beforeEach(() => {
    mockDataService = new MockDataService();
    mockAuthService = new MockAuthService();
    mockRouter = new MockRouter();
    vm = new CreateTourViewModel(mockDataService as any, mockAuthService as any, mockRouter as any);
  });

  it('should keep author populated from auth service', () => {
    expect(vm.author).toBe('Tester');
  });

  it('should initialize with empty tour data', () => {
    expect(vm.title).toBe('');
    expect(vm.description).toBe('');
    expect(vm.imageUrl).toBe('');
  });

  it('should initialize with default vehicle type', () => {
    expect(vm.vehicleType).toBe('cycling-regular');
  });

  it('should validate tour form when all required fields are present', () => {
    vm.title = 'Test Tour';
    vm.description = 'Test description';
    vm.startCoord = { lat: 49, lng: 8 };
    vm.endCoord = { lat: 49.1, lng: 8.1 };

    expect(vm.isTourFormValid()).toBe(true);
  });

  it('should invalidate tour form when title is missing', () => {
    vm.title = '';
    vm.description = 'Test description';
    vm.startCoord = { lat: 49, lng: 8 };
    vm.endCoord = { lat: 49.1, lng: 8.1 };

    expect(vm.isTourFormValid()).toBe(false);
  });

  it('should invalidate tour form when description is missing', () => {
    vm.title = 'Test Tour';
    vm.description = '';
    vm.startCoord = { lat: 49, lng: 8 };
    vm.endCoord = { lat: 49.1, lng: 8.1 };

    expect(vm.isTourFormValid()).toBe(false);
  });

  it('should invalidate tour form when start coord is missing', () => {
    vm.title = 'Test Tour';
    vm.description = 'Test description';
    vm.startCoord = null;
    vm.endCoord = { lat: 49.1, lng: 8.1 };

    expect(vm.isTourFormValid()).toBe(false);
  });

  it('should invalidate tour form when end coord is missing', () => {
    vm.title = 'Test Tour';
    vm.description = 'Test description';
    vm.startCoord = { lat: 49, lng: 8 };
    vm.endCoord = null;

    expect(vm.isTourFormValid()).toBe(false);
  });

  it('should not save invalid tour', async () => {
    vm.title = '';
    const result = await vm.saveTour();

    expect(result).toBe(false);
    expect(mockDataService.addTour).not.toHaveBeenCalled();
  });

  it('should save valid tour', async () => {
    vm.title = 'New Tour';
    vm.description = 'Description';
    vm.startCoord = { lat: 49, lng: 8 };
    vm.endCoord = { lat: 49.1, lng: 8.1 };
    vm.vehicleType = 'cycling-regular';

    const result = await vm.saveTour();

    expect(result).toBe(true);
    expect(mockDataService.addTour).toHaveBeenCalled();
  });

  it('should navigate to dashboard after successful tour creation', async () => {
    vm.title = 'New Tour';
    vm.description = 'Description';
    vm.startCoord = { lat: 49, lng: 8 };
    vm.endCoord = { lat: 49.1, lng: 8.1 };

    await vm.saveTour();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should trim whitespace from tour title', async () => {
    vm.title = '  Test Tour  ';
    vm.description = 'Description';
    vm.startCoord = { lat: 49, lng: 8 };
    vm.endCoord = { lat: 49.1, lng: 8.1 };

    await vm.saveTour();

    expect(mockDataService.addTour).toHaveBeenCalled();
    const addedTour = (mockDataService.addTour as any).mock.calls[0][0];
    expect(addedTour.name).toBe('Test Tour');
  });

  it('should set distance from map event', () => {
    vm.setDistance(5000);

    expect(vm.distance).toBe(5);
  });

  it('should set time from map event', () => {
    vm.setTime(3600);

    expect(vm.time).toBe(60);
  });

  it('should handle start coordinate selection', () => {
    const coord = { lat: 48.5, lng: 7.5 };
    vm.onStartSelected(coord);

    expect(vm.startCoord).toEqual(coord);
  });

  it('should handle end coordinate selection', () => {
    const coord = { lat: 50.5, lng: 9.5 };
    vm.onEndSelected(coord);

    expect(vm.endCoord).toEqual(coord);
  });

  it('should support different vehicle types', () => {
    vm.vehicleType = 'foot-hiking';
    expect(vm.vehicleType).toBe('foot-hiking');

    vm.vehicleType = 'driving-car';
    expect(vm.vehicleType).toBe('driving-car');
  });
});
