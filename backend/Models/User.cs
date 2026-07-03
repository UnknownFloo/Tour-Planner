using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TourPlanner.Api.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(80)]
        public string Username { get; set; } = null!;

        [Required]
        [MaxLength(256)]
        public string PasswordHash { get; set; } = null!;

        [Required]
        [MaxLength(128)]
        public string PasswordSalt { get; set; } = null!;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public IList<Tour> Tours { get; set; } = new List<Tour>();
    }
}
