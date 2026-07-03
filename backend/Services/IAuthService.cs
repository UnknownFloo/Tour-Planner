using System.Threading.Tasks;
using TourPlanner.Api.Dtos.Auth;

namespace TourPlanner.Api.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse?> LoginAsync(LoginRequest request);
    }
}
