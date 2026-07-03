using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TourPlanner.Api.Models;

namespace TourPlanner.Api.Helpers
{
    public class JwtTokenHelper
    {
        private readonly IConfiguration _configuration;

        public JwtTokenHelper(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string CreateToken(User user)
        {
            var key = _configuration.GetValue<string>("Jwt:Key") ?? throw new InvalidOperationException("JWT secret key is not configured.");
            var issuer = _configuration.GetValue<string>("Jwt:Issuer") ?? "TourPlanner";
            var audience = _configuration.GetValue<string>("Jwt:Audience") ?? "TourPlannerClient";
            var expiresInMinutes = _configuration.GetValue<int>("Jwt:ExpiresInMinutes", 60);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim("userId", user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var keyBytes = Encoding.UTF8.GetBytes(key);
            var credentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer,
                audience,
                claims,
                expires: DateTime.UtcNow.AddMinutes(expiresInMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
