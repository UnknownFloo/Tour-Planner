import { describe, expect, it, vi, beforeEach } from 'vitest';
import { LoginViewModel } from './login.view-model';

class MockAuthService {
  isAuthenticated = vi.fn().mockReturnValue(false);
  login = vi.fn().mockResolvedValue(true);
}

class MockRouter {
  navigate = vi.fn().mockResolvedValue(true);
}

describe('LoginViewModel', () => {
  let vm: LoginViewModel;
  let mockAuthService: MockAuthService;
  let mockRouter: MockRouter;

  beforeEach(() => {
    mockAuthService = new MockAuthService();
    mockRouter = new MockRouter();
    vm = new LoginViewModel(mockAuthService as any, mockRouter as any);
  });

  it('should initialize with empty credentials', () => {
    expect(vm.username).toBe('');
    expect(vm.password).toBe('');
  });

  it('should update username', () => {
    vm.username = 'testuser';
    expect(vm.username).toBe('testuser');
  });

  it('should update password', () => {
    vm.password = 'testpass123';
    expect(vm.password).toBe('testpass123');
  });

  it('should successfully login with valid credentials', async () => {
    vm.username = 'testuser';
    vm.password = 'testpass123';

    await vm.submit();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'testpass123'
    });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(vm.error()).toBe('');
  });

  it('should show error message on failed login', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));
    vm.username = 'wronguser';
    vm.password = 'wrongpass';

    await vm.submit();

    expect(vm.error()).toBe('Login fehlgeschlagen. Bitte überprüfe deine Anmeldedaten.');
  });

  it('should redirect to dashboard if already authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    
    const vm2 = new LoginViewModel(mockAuthService as any, mockRouter as any);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should clear error message before login attempt', async () => {
    vm.error.set('Previous error');
    vm.username = 'user';
    vm.password = 'pass';

    await vm.submit();

    expect(vm.error()).toBe('');
  });
});
