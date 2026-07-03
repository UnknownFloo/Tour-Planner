using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TourPlanner.Api.Data;
using TourPlanner.Api.Helpers;
using TourPlanner.Api.Middleware;
using TourPlanner.Api.Repositories;
using TourPlanner.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("TOURPLANNER_CONNECTION")
    ?? "Host=localhost;Port=5432;Database=tourplanner;Username=postgres;Password=postgres";

builder.Services.AddDbContext<TourPlannerDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITourRepository, TourRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITourService, TourService>();
builder.Services.AddSingleton<JwtTokenHelper>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;

    var jwtKey = builder.Configuration["Jwt:Key"] ?? Environment.GetEnvironmentVariable("JWT_KEY") ?? "REPLACE_WITH_A_SECRET_KEY";
    var issuer = builder.Configuration["Jwt:Issuer"] ?? "TourPlanner";
    var audience = builder.Configuration["Jwt:Audience"] ?? "TourPlannerClient";

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        ClockSkew = TimeSpan.FromMinutes(2)
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseGlobalExceptionHandler();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
