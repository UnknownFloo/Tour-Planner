using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace TourPlanner.Api.Middleware
{
    /// <summary>
    /// Global Exception Handling Middleware für zentrale Error-Behandlung
    /// Pattern: Middleware Pattern für Cross-Cutting Concerns
    /// </summary>
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception occurred");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var response = new ErrorResponse();

            switch (exception)
            {
                case ArgumentException argEx:
                    response.StatusCode = HttpStatusCode.BadRequest;
                    response.Message = "Invalid argument provided";
                    response.Details = argEx.Message;
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    break;

                case InvalidOperationException invOpEx:
                    response.StatusCode = HttpStatusCode.BadRequest;
                    response.Message = "Invalid operation";
                    response.Details = invOpEx.Message;
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    break;

                case UnauthorizedAccessException unauthEx:
                    response.StatusCode = HttpStatusCode.Unauthorized;
                    response.Message = "Unauthorized access";
                    response.Details = unauthEx.Message;
                    context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    break;

                case KeyNotFoundException keyNotEx:
                    response.StatusCode = HttpStatusCode.NotFound;
                    response.Message = "Resource not found";
                    response.Details = keyNotEx.Message;
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    break;

                default:
                    response.StatusCode = HttpStatusCode.InternalServerError;
                    response.Message = "An internal server error occurred";
                    response.Details = exception.Message;
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    break;
            }

            return context.Response.WriteAsJsonAsync(response);
        }
    }

    public class ErrorResponse
    {
        public HttpStatusCode StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public static class ExceptionMiddlewareExtensions
    {
        public static void UseGlobalExceptionHandler(this IApplicationBuilder app)
        {
            app.UseMiddleware<GlobalExceptionMiddleware>();
        }
    }
}
