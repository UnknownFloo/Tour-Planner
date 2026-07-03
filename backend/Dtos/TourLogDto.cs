using System;
using System.ComponentModel.DataAnnotations;

namespace TourPlanner.Api.Dtos
{
    public class TourLogDto
    {
        public int Id { get; set; }

        public DateTime Timestamp { get; set; }

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
