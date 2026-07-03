using System;
using System.ComponentModel.DataAnnotations;

namespace TourPlanner.Api.Models
{
    public class TourLog
    {
        public int Id { get; set; }

        public int TourId { get; set; }

        public Tour? Tour { get; set; }

        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [MaxLength(1000)]
        public string? Comment { get; set; }

        [Range(1, 5)]
        public int Difficulty { get; set; }

        public double TotalDistanceKm { get; set; }

        public int TotalTimeMinutes { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }
    }
}
