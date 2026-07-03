using System;
using System.Threading.Tasks;
using TourPlanner.Api.Dtos.Auth;
using TourPlanner.Api.Helpers;
using TourPlanner.Api.Models;
using TourPlanner.Api.Repositories;

namespace TourPlanner.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly JwtTokenHelper _jwtTokenHelper;

        public AuthService(IUserRepository userRepository, JwtTokenHelper jwtTokenHelper)
        {
            _userRepository = userRepository;
            _jwtTokenHelper = jwtTokenHelper;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            var existingUser = await _userRepository.FindByUsernameAsync(request.Username);
            if (existingUser != null)
            {
                throw new InvalidOperationException("Username is already taken.");
            }

            var (hash, salt) = PasswordHasher.HashPassword(request.Password);
            var user = new User
            {
                Username = request.Username,
                PasswordHash = hash,
                PasswordSalt = salt
            };

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            var token = _jwtTokenHelper.CreateToken(user);
            return new AuthResponse
            {
                Username = user.Username,
                Token = token,
                ExpiresInMinutes = int.Parse(Environment.GetEnvironmentVariable("JWT_EXPIRES_IN") ?? "60")
            };
        }

        public async Task<AuthResponse?> LoginAsync(LoginRequest request)
        {
            var user = await _userRepository.FindByUsernameAsync(request.Username);
            if (user == null)
            {
                return null;
            }

            var validPassword = PasswordHasher.VerifyPassword(request.Password, user.PasswordHash, user.PasswordSalt);
            if (!validPassword)
            {
                return null;
            }

            return new AuthResponse
            {
                Username = user.Username,
                Token = _jwtTokenHelper.CreateToken(user),
                ExpiresInMinutes = int.Parse(Environment.GetEnvironmentVariable("JWT_EXPIRES_IN") ?? "60")
            };
        }
    }
}
