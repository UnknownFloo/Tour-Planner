import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RegisterViewModel } from './register.view-model';

class MockAuthService {
  isAuthenticated = vi.fn().mockReturnValue(false);
  register = vi.fn().mockResolvedValue(true);
}

class MockRouter {
  navigate = vi.fn().mockResolvedValue(true);
}

describe('RegisterViewModel', () => {
  let vm: RegisterViewModel;
  let mockAuthService: MockAuthService;
  let mockRouter: MockRouter;

  beforeEach(() => {
    mockAuthService = new MockAuthService();
    mockRouter = new MockRouter();
    vm = new RegisterViewModel(mockAuthService as any, mockRouter as any);
  });

  it('should initialize with empty credentials', () => {
    expect(vm.username).toBe('');
    expect(vm.password).toBe('');
  });

  it('should successfully register with valid credentials', async () => {
    vm.username = 'newuser';
    vm.password = 'securepass123';

    await vm.submit();

    expect(mockAuthService.register).toHaveBeenCalledWith({
      username: 'newuser',
      password: 'securepass123'
    });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show error on registration failure', async () => {
    mockAuthService.register.mockRejectedValue(new Error('User exists'));
    vm.username = 'existinguser';
    vm.password = 'password123';

    await vm.submit();

    expect(vm.error()).toBe('Registrierung fehlgeschlagen. Bitte versuche es erneut.');
  });

  it('should update username and password independently', () => {
    vm.username = 'user1';
    expect(vm.username).toBe('user1');
    expect(vm.password).toBe('');

    vm.password = 'pass1';
    expect(vm.username).toBe('user1');
    expect(vm.password).toBe('pass1');
  });

  it('should clear previous error on new registration attempt', async () => {
    vm.error.set('Old error');
    vm.username = 'user';
    vm.password = 'pass';

    await vm.submit();

    expect(vm.error()).toBe('');
  });
});
