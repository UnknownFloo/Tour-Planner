import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { of } from 'rxjs';
import { DashboardViewModel } from './dashboard.view-model';

class MockDataService {
  tours$ = of([]);
  exportSelectedTours = vi.fn().mockReturnValue(0);
  importFromJSON = vi.fn().mockReturnValue(true);
  deleteTour = vi.fn();
}

describe('DashboardViewModel', () => {
  let mockDataService: MockDataService;
  let vm: DashboardViewModel;
  let originalFileReader: typeof FileReader | undefined;

  beforeEach(() => {
    originalFileReader = globalThis.FileReader;
    globalThis.FileReader = class MockFileReader {
      onload: ((ev: ProgressEvent<FileReader>) => any) | null = null;
      readAsText() {
        if (this.onload) {
          (this.onload as any)({ target: { result: JSON.stringify([]) } } as ProgressEvent<FileReader>);
        }
      }
    } as any;

    mockDataService = new MockDataService();
    vm = new DashboardViewModel(mockDataService as any);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    if (originalFileReader) {
      globalThis.FileReader = originalFileReader;
    } else {
      delete (globalThis as any).FileReader;
    }
  });

  it('should export all tours when none are selected', () => {
    mockDataService.exportSelectedTours.mockReturnValue(2);

    vm.exportSelectedTours();

    expect(mockDataService.exportSelectedTours).toHaveBeenCalledWith([]);
    expect(vm.toastMessage()).toBe('2 Touren wurden exportiert.');
    expect(vm.toastType()).toBe('success');
  });

  it('should show an error toast when import fails', () => {
    mockDataService.importFromJSON.mockReturnValue(false);

    const file = { name: 'tours.json' };
    const event = { target: { files: [file], value: '' } } as unknown as Event;

    vm.importTours(event);

    expect(mockDataService.importFromJSON).toHaveBeenCalled();
    expect(vm.toastType()).toBe('error');
    expect(vm.toastMessage()).toBe('Fehler beim Importieren. Bitte überprüfe die Datei.');
  });

  it('should hide toast after 2200ms', () => {
    vm.showToast('Test', 'info');
    expect(vm.isToastVisible()).toBe(true);

    vi.advanceTimersByTime(2200);
    expect(vm.isToastVisible()).toBe(false);
  });

  it('should toggle tour selection', () => {
    expect(vm.isTourSelected(1)).toBe(false);
    
    vm.toggleTourSelection(1);
    expect(vm.isTourSelected(1)).toBe(true);
    
    vm.toggleTourSelection(1);
    expect(vm.isTourSelected(1)).toBe(false);
  });

  it('should handle multiple tour selections', () => {
    vm.toggleTourSelection(1);
    vm.toggleTourSelection(2);
    vm.toggleTourSelection(3);

    expect(vm.isTourSelected(1)).toBe(true);
    expect(vm.isTourSelected(2)).toBe(true);
    expect(vm.isTourSelected(3)).toBe(true);
    expect(vm.isTourSelected(4)).toBe(false);
  });

  it('should export selected tours with correct count message', () => {
    mockDataService.exportSelectedTours.mockReturnValue(5);
    
    vm.toggleTourSelection(1);
    vm.toggleTourSelection(2);
    vm.exportSelectedTours();

    expect(mockDataService.exportSelectedTours).toHaveBeenCalledWith([1, 2]);
    expect(vm.toastMessage()).toContain('5');
  });

  it('should show error when no tours available for export', () => {
    mockDataService.exportSelectedTours.mockReturnValue(0);
    
    vm.exportSelectedTours();

    expect(vm.toastType()).toBe('error');
    expect(vm.toastMessage()).toBe('Es sind keine Touren zum Exportieren vorhanden.');
  });

  it('should clear selected tours after successful export', () => {
    mockDataService.exportSelectedTours.mockReturnValue(1);
    
    vm.toggleTourSelection(1);
    vm.exportSelectedTours();

    expect(vm.isTourSelected(1)).toBe(false);
  });

  it('should open delete modal', () => {
    vm.openDeleteTourModal(5);
    
    expect(vm.isDeleteModalOpen()).toBe(true);
    expect(vm.pendingDeleteTourId()).toBe(5);
  });

  it('should cancel delete modal', () => {
    vm.openDeleteTourModal(5);
    vm.cancelDeleteTour();
    
    expect(vm.isDeleteModalOpen()).toBe(false);
    expect(vm.pendingDeleteTourId()).toBe(null);
  });

  it('should delete tour and show success message', () => {
    vm.openDeleteTourModal(5);
    vm.confirmDeleteTour();
    
    expect(mockDataService.deleteTour).toHaveBeenCalledWith(5);
    expect(vm.toastMessage()).toBe('Tour gelöscht.');
    expect(vm.toastType()).toBe('success');
    expect(vm.isDeleteModalOpen()).toBe(false);
  });

  it('should handle import with valid JSON', () => {
    mockDataService.importFromJSON.mockReturnValue(true);
    
    const file = { name: 'tours.json' };
    const event = { target: { files: [file], value: '' } } as unknown as Event;
    
    vm.importTours(event);
    
    expect(vm.toastType()).toBe('success');
    expect(vm.toastMessage()).toContain('erfolgreich importiert');
  });

  it('should handle import with no file selected', () => {
    const event = { target: { files: [], value: '' } } as unknown as Event;
    
    vm.importTours(event);
    
    expect(mockDataService.importFromJSON).not.toHaveBeenCalled();
  });

  it('should reset tour selection on new session', () => {
    vm.toggleTourSelection(1);
    vm.toggleTourSelection(2);
    
    const newVm = new DashboardViewModel(mockDataService as any);
    expect(newVm.isTourSelected(1)).toBe(false);
    expect(newVm.isTourSelected(2)).toBe(false);
  });
});
