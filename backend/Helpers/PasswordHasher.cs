using System;
using System.Security.Cryptography;

namespace TourPlanner.Api.Helpers
{
    public static class PasswordHasher
    {
        public static (string Hash, string Salt) HashPassword(string password)
        {
            var saltBytes = RandomNumberGenerator.GetBytes(16);
            var salt = Convert.ToBase64String(saltBytes);
            var hash = ComputeHash(password, saltBytes);
            return (Convert.ToBase64String(hash), salt);
        }

        public static bool VerifyPassword(string password, string storedHash, string storedSalt)
        {
            var saltBytes = Convert.FromBase64String(storedSalt);
            var hash = ComputeHash(password, saltBytes);
            return Convert.ToBase64String(hash) == storedHash;
        }

        private static byte[] ComputeHash(string password, byte[] salt)
        {
            using var algorithm = new Rfc2898DeriveBytes(password, salt, 100_000, HashAlgorithmName.SHA256);
            return algorithm.GetBytes(32);
        }
    }
}
